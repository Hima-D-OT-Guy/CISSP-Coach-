import React, { useState, useEffect } from 'react';
import { Menu, MessageSquare, BookOpen, PenTool } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import FileUpload from './components/FileUpload';
import SetupModal from './components/SetupModal';
import { AssessmentQuiz } from './components/AssessmentQuiz';
import { LabWorkbook } from './components/LabWorkbook';
import { TopicExplainer } from './components/TopicExplainer';
import { AppState, TeachingMode, Message, MessageRole, TOCItem, UserSettings, ProcessedBook } from './types';
import { INITIAL_DOMAINS } from './constants';
import { geminiService } from './services/geminiService';
import { storageService } from './services/storageService';

type ViewTab = 'chat' | 'essentials' | 'labs';

const App: React.FC = () => {
    const [state, setState] = useState<AppState>({
        hasFile: false,
        fileName: null,
        fileContent: null,
        isProcessing: false,
        mode: TeachingMode.GUIDED,
        chatHistory: [],
        stats: INITIAL_DOMAINS,
        toc: [],
        apiKeyValid: false, // Default to false until setup
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const [isRestoring, setIsRestoring] = useState(true);
    const [showSetup, setShowSetup] = useState(false);

    // Navigation State
    const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ViewTab>('chat');

    // Initialize App (Load Settings & State)
    useEffect(() => {
        const init = async () => {
            console.log("[App] Initializing...");
            setIsRestoring(true);
            try {
                // 1. Load User Settings
                const userSettings = await storageService.loadUserSettings();
                console.log(`[App] User Settings Loaded: ${userSettings ? 'Yes' : 'No'}`);

                if (!userSettings) {
                    console.log("[App] No user settings found. Showing Setup Modal.");
                    setShowSetup(true);
                    setIsRestoring(false);
                    return; // Stop here, wait for setup
                }

                // 2. Configure Gemini Service
                geminiService.setCredentials(userSettings.apiKey, userSettings.tier);
                setState(prev => ({ ...prev, apiKeyValid: true, userSettings }));

                // 3. Load Application State (Content, History)
                const savedState = await storageService.loadState();
                console.log(`[App] Saved State Loaded: ${savedState ? 'Yes' : 'No'}`);

                if (savedState) {
                    setState(prev => ({
                        ...prev,
                        ...savedState,
                        isProcessing: false,
                        apiKeyValid: true,
                        userSettings // Ensure settings are kept
                    }));

                    // Re-initialize Gemini session if content exists
                    if (savedState.fileContent) {
                        console.log("[App] Restoring Gemini Session from saved content...");
                        geminiService.initializeSession(savedState.fileContent).catch(e => {
                            console.error("[App] Failed to restore Gemini session:", e);
                        });
                    }
                }
            } catch (e) {
                console.error("[App] Failed to load saved state", e);
            } finally {
                setIsRestoring(false);
            }
        };
        init();
    }, []);

    // Save to IndexedDB on change
    useEffect(() => {
        if (state.hasFile && !isRestoring && state.apiKeyValid) {
            storageService.saveState(state);
        }
    }, [state.chatHistory, state.stats, state.mode, state.hasFile, state.toc, isRestoring, state.apiKeyValid]);

    // Initialize chat when file is processed
    const handleFileProcessed = async (processedBook: ProcessedBook, fileName: string) => {
        const fullText = processedBook.fullText;

        console.log(`[App] File Processed: ${fileName} (${fullText.length} chars)`);
        console.log(`[App] Chapters found: ${processedBook.toc.length}`);

        setState(prev => ({ ...prev, isProcessing: true }));

        try {
            await geminiService.initializeSession(fullText);

            // Use the generated TOC from the file processor instead of generating one via AI if available
            const toc = processedBook.toc.length > 1 ? processedBook.toc : await geminiService.generateTOC();

            console.log("[App] TOC Length:", toc.length);
            if (toc.length > 0) {
                console.log("[App] TOC First Item:", JSON.stringify(toc[0]));
                console.log("[App] TOC Second Item:", JSON.stringify(toc[1]));
            }

            const estTokens = Math.ceil(fullText.length / 4);

            setState(prev => ({
                ...prev,
                hasFile: true,
                fileName: fileName,
                fileContent: fullText,
                processedBook: processedBook, // Store the structured book
                isProcessing: false,
                toc: toc,
                tokenCount: estTokens,
                chatHistory: [
                    {
                        id: 'welcome',
                        role: MessageRole.MODEL,
                        text: `**I have successfully loaded the ${fileName}.**\n\nI found **${processedBook.toc.length}** chapters/sections.\n\nI am ready to act as your CISSP Coach.\n\nWe can:\n1. Start specifically with **Domain 1: Security and Risk Management**.\n2. Create a **Baseline Assessment Quiz** to gauge your level.\n3. Jump straight into a topic of your choice.\n\n*How would you like to proceed?*`,
                        timestamp: Date.now()
                    }
                ]
            }));
        } catch (e) {
            console.error("[App] Initialization failed", e);
            // Reset processing state on error would happen here in a real app
        }
    };

    // Auto-load pre-processed book data
    useEffect(() => {
        const loadBookData = async () => {
            if (state.hasFile || !state.apiKeyValid || isRestoring || showSetup) return;

            try {
                console.log("[App] Loading book data...");
                setState(prev => ({ ...prev, isProcessing: true }));

                const response = await fetch('/book_data.json?t=' + Date.now());
                if (!response.ok) {
                    throw new Error("Book data not found. Please run the processing script.");
                }
                const bookData = await response.json() as ProcessedBook;
                console.log("[App] Book data loaded successfully.");

                await handleFileProcessed(bookData, "CISSP Guide");
            } catch (error) {
                console.error("[App] Failed to load book data:", error);
                setState(prev => ({ ...prev, isProcessing: false }));
            }
        };

        loadBookData();
    }, [state.hasFile, state.apiKeyValid, isRestoring, showSetup]);

    const handleSetupComplete = async (settings: UserSettings) => {
        console.log("[App] Setup Completed. Saving settings...");
        // Save settings
        await storageService.saveUserSettings(settings);

        // Configure Service
        geminiService.setCredentials(settings.apiKey, settings.tier);

        // Update State
        setState(prev => ({ ...prev, apiKeyValid: true, userSettings: settings }));
        setShowSetup(false);
    };

    const handleResetCredentials = async () => {
        console.log("[App] User requested credential reset.");
        if (confirm("Are you sure you want to reset your API key and settings? This will reload the page.")) {
            await storageService.clearUserSettings();
            window.location.reload();
        }
    };

    const handleSendMessage = async (text: string, context?: string) => {
        console.log(`[App] Sending Message: "${text.substring(0, 50)}..."`);
        // Add User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: MessageRole.USER,
            text: text,
            timestamp: Date.now(),
            selectionContext: context
        };

        setState(prev => ({
            ...prev,
            chatHistory: [...prev.chatHistory, userMsg]
        }));

        setIsLoadingResponse(true);

        try {
            // Get AI Response
            const response = await geminiService.sendMessage(text, context, state.mode === TeachingMode.GUIDED ? 'guided' : 'deep_dive');

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: MessageRole.MODEL,
                text: response.text,
                timestamp: Date.now(),
                quizPayload: response.quiz,
                visualizations: response.visualizations,
                sourceMode: state.mode === TeachingMode.GUIDED ? "guided" : "deepDive"
            };

            setState(prev => ({
                ...prev,
                chatHistory: [...prev.chatHistory, aiMsg]
            }));
        } catch (error) {
            console.error("[App] Error getting response:", error);
        } finally {
            setIsLoadingResponse(false);
        }
    };

    const handleTopicClick = async (topicId: string) => {
        console.log(`[App] Topic Clicked: ${topicId}`);
        setActiveTopicId(topicId);
        setActiveTab('chat'); // Reset to chat view on new topic

        // Find topic title
        const findTopic = (items: TOCItem[]): string | undefined => {
            for (const item of items) {
                if (item.id === topicId) return item.title;
                if (item.children) {
                    const found = findTopic(item.children);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const topicTitle = state.toc ? findTopic(state.toc) : topicId;
        if (!topicTitle) return;

        // Look up section content if available
        const sectionContent = state.processedBook?.sections?.[topicId];
        console.log(`[App] Section content found for ${topicId}: ${sectionContent ? 'Yes' : 'No'}`);

        // Add system message indicating mode switch or topic start
        const startMsg: Message = {
            id: Date.now().toString(),
            role: MessageRole.SYSTEM,
            text: `Starting session on: **${topicTitle}** (${state.mode})`,
            timestamp: Date.now()
        };

        setState(prev => ({
            ...prev,
            chatHistory: [...prev.chatHistory, startMsg]
        }));

        setIsLoadingResponse(true);

        try {
            const response = await geminiService.startTopicSession(
                topicTitle,
                state.mode === TeachingMode.GUIDED ? 'guided' : 'deep_dive',
                sectionContent // Pass the specific chapter content
            );

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: MessageRole.MODEL,
                text: response.text,
                timestamp: Date.now(),
                sourceMode: state.mode === TeachingMode.GUIDED ? "guided" : "deepDive"
            };

            setState(prev => ({
                ...prev,
                chatHistory: [...prev.chatHistory, aiMsg]
            }));
        } catch (e) {
            console.error("[App] Error starting topic session:", e);
        } finally {
            setIsLoadingResponse(false);
        }
    };

    const renderContent = () => {
        if (!state.hasFile) {
            return (
                <div className="flex-1 flex items-center justify-center p-4">
                    {state.isProcessing ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                            <p className="text-sm font-mono animate-pulse">Loading CISSP Guide...</p>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <p>Waiting for book data...</p>
                        </div>
                    )}
                </div>
            );
        }

        // 1. Assessment Test View
        if (activeTopicId === 'assessment_test' && state.processedBook?.assessmentTest) {
            return <AssessmentQuiz test={state.processedBook.assessmentTest} />;
        }

        // 2. Chapter View (Tabs)
        const chapterElements = activeTopicId ? state.processedBook?.chapterElements?.[activeTopicId] : null;
        const hasChapterElements = chapterElements && (
            chapterElements.tips.length > 0 ||
            chapterElements.summaries.length > 0 ||
            chapterElements.writtenLabs.length > 0
        );

        return (
            <div className="flex flex-col h-full">
                {/* Tab Bar (Only show if chapter elements exist) */}
                {hasChapterElements && (
                    <div className="flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 px-4">
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'chat'
                                ? 'border-emerald-500 text-emerald-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat Coach
                        </button>
                        <button
                            onClick={() => setActiveTab('essentials')}
                            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'essentials'
                                ? 'border-blue-500 text-blue-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Study Essentials
                        </button>
                        <button
                            onClick={() => setActiveTab('labs')}
                            className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'labs'
                                ? 'border-purple-500 text-purple-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <PenTool className="w-4 h-4 mr-2" />
                            Written Labs
                        </button>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-950">
                    {activeTab === 'chat' && (
                        <ChatInterface
                            messages={state.chatHistory}
                            onSendMessage={handleSendMessage}
                            isLoading={isLoadingResponse}
                            mode={state.mode}
                        />
                    )}
                    {activeTab === 'essentials' && chapterElements && (
                        <TopicExplainer
                            elements={chapterElements}
                            chapterTitle={activeTopicId || 'Chapter'}
                        />
                    )}
                    {activeTab === 'labs' && chapterElements && (
                        <LabWorkbook
                            elements={chapterElements}
                            chapterTitle={activeTopicId || 'Chapter'}
                        />
                    )}
                </div>
            </div>
        );
    };

    if (isRestoring) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-950 text-emerald-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
                    <p className="text-sm font-mono animate-pulse">Restoring Secure Session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            {/* Setup Modal */}
            {showSetup && <SetupModal onComplete={handleSetupComplete} />}

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-30">
                <div className="font-bold text-emerald-500">CISSP Coach</div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400">
                    <Menu />
                </button>
            </div>

            {/* Sidebar */}
            <Sidebar
                stats={state.stats}
                toc={state.toc}
                currentMode={state.mode}
                tokenCount={state.tokenCount}
                onModeChange={(mode) => setState(prev => ({ ...prev, mode }))}
                onTopicClick={handleTopicClick}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onResetCredentials={handleResetCredentials}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative w-full max-w-5xl mx-auto lg:pt-0 pt-16">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;