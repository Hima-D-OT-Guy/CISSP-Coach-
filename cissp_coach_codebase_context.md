# CISSP Coach Application - Full Codebase Context

Generated on: 2025-11-26T17:52:55.749Z

## File: package.json
```json
{
  "name": "cissp-coach-ai",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@google/genai": "^1.30.0",
    "idb-keyval": "^6.2.2",
    "lucide-react": "^0.554.0",
    "mermaid": "latest",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-markdown": "^10.1.0",
    "recharts": "^3.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}

```

## File: project_changes_log.md
```md
# CISSP Coach - Recent Changes Log

## 1. Critical Stability Fixes (Phase 0)
**Goal**: Prevent browser crashes and "White Screen of Death".

*   **Persistence Engine Upgrade**:
    *   **Old**: `localStorage` (Synchronous, 5MB limit). Caused crashes with large PDFs.
    *   **New**: `IndexedDB` via `idb-keyval` (Asynchronous, GBs capacity).
    *   **Implementation**: Created `services/storageService.ts` to handle data safely.
*   **Async Loading State**:
    *   Added a "Restoring Study Session..." loading screen to `App.tsx`.
    *   Prevents the app from rendering before data is fully retrieved from the database.

## 2. Codebase Repair
**Goal**: Fix build errors and corruption caused by previous edits.

*   **`types.ts`**: Removed duplicate interface definitions that were causing TypeScript errors.
*   **`App.tsx`**: Rewrote the file to fix missing imports, syntax errors (broken template literals), and logic gaps.
*   **`Sidebar.tsx`**: Fixed syntax errors to ensure the Table of Contents and Token Counter render correctly.
*   **`index.html`**: Restored the missing `<script>` tag that was preventing the React app from mounting.

## 3. New Features
**Goal**: Enhance user experience and visibility.

*   **Token Counter**:
    *   Added a real-time estimator in the Sidebar (e.g., `~450.2k tokens`).
    *   Helps track usage against the Gemini 1.5 Flash 1M token limit.
*   **UI Contrast Improvements**:
    *   Updated `KeyConceptCard`, `ExamTipCard`, and `WarningCard`.
    *   Now uses darker backgrounds with lighter text for better readability in Dark Mode.

## 4. Technical Improvements
*   **Context Generation**: Created `scripts/generate_context.js` to bundle the entire codebase into a single Markdown file (`cissp_coach_codebase_context.md`) for easier AI assistance.
*   **Environment Config**: Verified `.env` setup for API keys.

## Files Modified
*   `App.tsx`
*   `types.ts`
*   `components/Sidebar.tsx`
*   `services/storageService.ts` (New)
*   `services/geminiService.ts`
*   `components/cards/*.tsx`

## 5. Phase 1: Intelligence Routing (Hybrid Model)
**Goal**: Optimize for speed vs. depth by switching models based on teaching mode.

*   **Model Strategy**:
    *   **Guided/Chat**: `gemini-2.5-flash` (Fast, cached).
    *   **Deep Dive/Exam**: `gemini-3.0-pro` (High reasoning).
*   **Implementation**:
    *   **`geminiService.ts`**: Added `switchModel` method. It preserves chat history and re-injects file context when switching models.
    *   **`App.tsx`**: Updated `handleTopicClick` and `handleSendMessage` to pass the current mode to the service.
*   **Verification**:
    *   Confirmed build success.
    *   Verified model switching logs in browser console.

```

## File: tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "types": [
      "node"
    ],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
```

## File: vite.config.ts
```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

```

## File: index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CISSP Coach AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      // Configure PDF.js worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    </script>
    <style>
      /* Custom scrollbar for chat container */
      .scrollbar-hide::-webkit-scrollbar {
          display: none;
      }
      .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #1e293b; 
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #475569; 
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #64748b; 
      }
      /* Mermaid styling adjustments */
      .mermaid {
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.30.0",
    "lucide-react": "https://aistudiocdn.com/lucide-react@^0.554.0",
    "react-markdown": "https://aistudiocdn.com/react-markdown@^10.1.0",
    "recharts": "https://aistudiocdn.com/recharts@^3.5.0",
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CISSP Coach AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      // Configure PDF.js worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    </script>
    <style>
      /* Custom scrollbar for chat container */
      .scrollbar-hide::-webkit-scrollbar {
          display: none;
      }
      .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #1e293b; 
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #475569; 
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #64748b; 
      }
      /* Mermaid styling adjustments */
      .mermaid {
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react": "https://aistudiocdn.com/react@^19.2.0",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.2.0/",
    "react/": "https://aistudiocdn.com/react@^19.2.0/",
    "@google/genai": "https://aistudiocdn.com/@google/genai@^1.30.0",
    "lucide-react": "https://aistudiocdn.com/lucide-react@^0.554.0",
    "react-markdown": "https://aistudiocdn.com/react-markdown@^10.1.0",
    "recharts": "https://aistudiocdn.com/recharts@^3.5.0",
    "mermaid": "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.0/mermaid.esm.min.mjs"
  }
}
</script>
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```

## File: index.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## File: App.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import FileUpload from './components/FileUpload';
import SetupModal from './components/SetupModal';
import { AppState, DomainStats, TeachingMode, Message, MessageRole, TOCItem, UserSettings, ProcessedBook } from './types';
import { INITIAL_DOMAINS } from './constants';
import { geminiService } from './services/geminiService';
import { storageService } from './services/storageService';

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

    // Initialize chat when file is processed
    const handleFileProcessed = async (content: any, fileName: string) => {
        const processedBook = content as ProcessedBook;
        const fullText = processedBook.fullText;

        console.log(`[App] File Processed: ${fileName} (${fullText.length} chars)`);
        console.log(`[App] Chapters found: ${processedBook.toc.length}`);

        setState(prev => ({ ...prev, isProcessing: true }));

        try {
            await geminiService.initializeSession(fullText);

            // Use the generated TOC from the file processor instead of generating one via AI if available
            const toc = processedBook.toc.length > 1 ? processedBook.toc : await geminiService.generateTOC();
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
                        text: `**I have successfully ingested ${fileName}.**\n\nI found **${processedBook.toc.length}** chapters/sections.\n\nI am ready to act as your CISSP Coach.\n\nWe can:\n1. Start specifically with **Domain 1: Security and Risk Management**.\n2. Create a **Baseline Assessment Quiz** to gauge your level.\n3. Jump straight into a topic of your choice.\n\n*How would you like to proceed?*`,
                        timestamp: Date.now()
                    }
                ]
            }));
        } catch (e) {
            console.error("[App] Initialization failed", e);
            // Reset processing state on error would happen here in a real app
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
                {!state.hasFile ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <FileUpload onFileProcessed={handleFileProcessed} isProcessing={state.isProcessing} />
                    </div>
                ) : (
                    <ChatInterface
                        messages={state.chatHistory}
                        onSendMessage={handleSendMessage}
                        isLoading={isLoadingResponse}
                        mode={state.mode}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
```

## File: types.ts
```typescript
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domain?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface QuizPayload {
  title: string;
  description?: string;
  questions: QuizQuestion[];
}

export type DiagramType = "mermaid-flowchart" | "mermaid-sequence" | "ascii";

export interface ConceptVisualization {
  title: string;
  purpose: string;
  diagramType: DiagramType;
  diagramCode: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  isThinking?: boolean;
  timestamp: number;
  quizPayload?: QuizPayload;
  visualizations?: ConceptVisualization[];
  selectionContext?: string;
  sourceMode?: "guided" | "deepDive" | "exam";
}

export enum Domain {
  D1 = "Security and Risk Management",
  D2 = "Asset Security",
  D3 = "Security Architecture and Engineering",
  D4 = "Communication and Network Security",
  D5 = "Identity and Access Management (IAM)",
  D6 = "Security Assessment and Testing",
  D7 = "Security Operations",
  D8 = "Software Development Security"
}

export interface DomainStats {
  id: string;
  name: string;
  score: number;
  questionsAnswered: number;
  masteryLevel: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
}

export enum TeachingMode {
  GUIDED = "Guided Course",
  DEEP_DIVE = "Topic Deep Dive",
  EXAM_PRACTICE = "Exam Practice"
}

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export interface TOCItem {
  id: string;
  title: string;
  level: number; // 1 for Domain, 2 for Topic
  status: TopicStatus;
  children?: TOCItem[];
}

export interface ProcessedBook {
  fullText: string;
  sections: Record<string, string>;
  toc: TOCItem[];
}

export type AccountTier = 'free' | 'paid';

export interface UserSettings {
  userName: string;
  apiKey: string;
  tier: AccountTier;
}

export interface AppState {
  hasFile: boolean;
  fileName: string | null;
  fileContent: string | null;
  isProcessing: boolean;
  mode: TeachingMode;
  chatHistory: Message[];
  stats: DomainStats[];
  toc?: TOCItem[];
  apiKeyValid: boolean;
  tokenCount?: number;
  userSettings?: UserSettings;
  processedBook?: ProcessedBook;
}
```

## File: constants.ts
```typescript
import { Domain, DomainStats } from "./types";

export const INITIAL_DOMAINS: DomainStats[] = [
  { id: 'd1', name: Domain.D1, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd2', name: Domain.D2, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd3', name: Domain.D3, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd4', name: Domain.D4, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd5', name: Domain.D5, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd6', name: Domain.D6, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd7', name: Domain.D7, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
  { id: 'd8', name: Domain.D8, score: 0, questionsAnswered: 0, masteryLevel: 'Novice' },
];

export const SYSTEM_INSTRUCTION_BASE = `
You are an expert CISSP Coach and Tutor. Your goal is to help the user prepare for the CISSP exam.
You have access to the user's uploaded study guide content. Use this content to answer questions, explain concepts, and generate quizzes.

STRUCTURED OUTPUT RULES:
You must use specific Markdown directive blocks to highlight key information. Do NOT use JSON for these, and do NOT use HTML tags.

1. **Key Concepts**:
:::key-concept
Title: <Short Title>
Summary: <2-4 sentence explanation>
Why it matters: <1-2 sentence relevance to CISSP exam>
:::

2. **Exam Tips**:
:::exam-tip
- <bullet tip 1>
- <bullet tip 2>
:::

3. **Warnings / Common Pitfalls**:
:::warning
<short explanation of what students usually get wrong>
:::

When explaining topics, be clear, concise, and exam-focused.
Use the "Deep Space" theme aesthetic in your language (professional, authoritative, yet encouraging).
`;

export const WELCOME_MESSAGE = `
**Welcome to your AI CISSP Coach.**

Once you upload your book, I can:
*   **Guide you** chapter-by-chapter.
*   **Deep dive** into complex topics like Kerberos or Cryptography.
*   **Quiz you** with exam-style scenario questions.
*   **Track your progress** across all 8 domains.

Please upload your PDF to get started.
`;
```

## File: prompts.ts
```typescript
export const GUIDED_COURSE_PROMPT = `
You are my CISSP study assistant. For the topic "[TOPIC_NAME]", follow this exact structure:

1. **Simple explanation** (for a beginner or 10-year-old)
2. **CISSP-level explanation**, exam tone, managerial and governance perspective
3. **Real-world examples** (enterprise + optional OT/ICS if relevant)
4. **Summary notes** in bullet form
5. **Mnemonics, analogies, and memory tricks**
6. **5 CISSP-style practice questions** (one at a time, wait for my reply)
7. **Create 10 flashcards** from the topic
8. **At the end, quiz me** with a short active recall exercise

Always correct my reasoning and teach me how to think like a CISSP manager, not a technical implementer.
Start by presenting sections 1-5. Then ask the first question and WAIT for my answer.
`;

export const DEEP_DIVE_PROMPT = `
You are my CISSP Deep Mode Mentor. For the topic "[TOPIC_NAME]", follow this exact multi-layer deep analysis workflow:

### 1. FOUNDATIONAL LAYER (Simple Mode)
- Explain the topic in the simplest possible language (kid-friendly).
- Provide a real-life analogy.
- Explain why the concept matters in everyday digital life.

### 2. TECHNICAL LAYER (Engineer Mode)
- Break down the underlying technical principles.
- Use diagrams (Mermaid), flow steps, and internal workings.
- Include how the concept works in IT and OT (ICS/SCADA) where applicable.

### 3. CISSP MANAGERIAL LAYER (Exam Mode)
- Explain the concept using CISSP exam language.
- Focus on governance, policies, risk management, and decision-making.
- Avoid heavy implementation details (CISSP is not a hands-on exam).

### 4. FRAMEWORK & STANDARD MAPPING
Map the topic to:
- NIST CSF
- NIST SP 800-53
- ISO 27001
- COBIT
- IEC 62443 (optional if OT relevant)

### 5. DEEP DIVE (Deep Mode)
Perform an advanced deep analysis:
- Root cause
- Threat model
- Attack vectors
- Failure modes
- Risk implications
- Detection mechanisms
- Prevention & mitigation hierarchy
- Impact on confidentiality, integrity, and availability (CIA)
- OT vs IT difference (if relevant)
- Real-world case studies

### 6. MEMORY ENGINE (Retention Mode)
- Summarize in bullet points.
- Generate analogies + mnemonics.
- Provide a 30-second cheat sheet.
- Create a spaced repetition flashcard set (10 flashcards).

### 7. INTERACTIVE LEARNING (Socratic Mode)
Ask me 3 open-ended questions to check whether I truly understand the concept.

### 8. EXAM PRACTICE (CISSP MCQs)
Create 5 CISSP-style scenario-based MCQs:
- Wait for my answer after each question.
- After my answer, explain:
  - Why my choice is correct or incorrect.
  - Why each wrong option is wrong.
  - Which CISSP principle applied.

### 9. TEACH-BACK MODE
Ask me to explain the concept to you in my own words.
Then evaluate my explanation and correct/improve my gaps.

### 10. CONTINUOUS LEARNING
At the end, provide:
- 3 recommended related CISSP subtopics I should study next.
- How this concept connects to the broader CISSP domains.

---------------------

Follow this structure EXACTLY. Do NOT shorten or skip steps.
Start by presenting sections 1-6. Then proceed to the Interactive Learning phase.
`;

```

## File: services/geminiService.ts
```typescript
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message, MessageRole, QuizPayload, ConceptVisualization, TOCItem, AccountTier } from "../types";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";
import { GUIDED_COURSE_PROMPT, DEEP_DIVE_PROMPT } from "../prompts";

// --- CONFIGURATION UPDATES (NOV 2025 STANDARDS) ---

// 1. FLASH_MODEL: 'gemini-2.5-flash'
//    This is the current STABLE fast model. It supports ~1M TPM on Free Tier.
const FLASH_MODEL = 'gemini-2.5-flash';

// 2. PRO_MODEL_PAID: 'gemini-3-pro-preview'
//    This is the smartest model available. Requires Paid Tier 1 for high rate limits.
const PRO_MODEL_PAID = 'gemini-3-pro-preview';

// 3. PRO_MODEL_FREE: 'gemini-2.5-flash'
//    On Free Tier, we stick to Flash to ensure we can handle the 800k context without 429s.
const PRO_MODEL_FREE = 'gemini-2.5-flash';

// 4. FALLBACK: 'gemini-2.5-pro'
//    If 3-Pro fails, this is the reliable stable alternative.
const FALLBACK_MODEL = 'gemini-2.5-pro';

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private chatSession: Chat | null = null;
  private fileContext: string = "";
  private currentModelName = FLASH_MODEL;

  // User Config State
  private apiKey: string = "";
  private userTier: AccountTier = 'free';

  constructor() {
    // Initially null.
  }

  setCredentials(apiKey: string, tier: AccountTier) {
    this.apiKey = apiKey;
    this.userTier = tier;
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    console.log(`[GeminiService] Credentials Configured. Tier: ${tier}, Key Length: ${apiKey.length}`);
  }

  private getProModelName(): string {
    if (this.userTier === 'paid') {
      return PRO_MODEL_PAID;
    }
    return PRO_MODEL_FREE;
  }

  async initializeSession(fileContent: string): Promise<void> {
    console.log(`[GeminiService] Initializing Session. Content Length: ${fileContent.length} chars`);

    if (!this.ai) {
      console.error("[GeminiService] Initialization Failed: API Key not configured.");
      throw new Error("API Key not configured.");
    }

    this.fileContext = fileContent;
    this.currentModelName = FLASH_MODEL;

    // Safe truncation to stay within ~1M context limits
    const safeLimit = 950000;
    const truncatedContent = fileContent.length > safeLimit
      ? fileContent.substring(0, safeLimit) + "\n...[Content Truncated]..."
      : fileContent;

    if (fileContent.length > safeLimit) {
      console.warn(`[GeminiService] Content truncated from ${fileContent.length} to ${safeLimit} chars.`);
    }

    try {
      this.chatSession = this.ai.chats.create({
        model: FLASH_MODEL,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_BASE,
          temperature: 0.3,
        },
        history: [
          {
            role: "user",
            parts: [{ text: `Here is the content of the CISSP Study Guide. Ingest this now. \n\n --- BEGIN CONTENT ---\n${truncatedContent}\n--- END CONTENT ---` }],
          },
          {
            role: "model",
            parts: [{ text: "I have ingested the study guide. I am ready to act as your CISSP Coach." }],
          }
        ],
      });
      console.log(`[GeminiService] Session initialized successfully with ${FLASH_MODEL}`);
    } catch (error) {
      console.error("[GeminiService] Failed to initialize session:", error);
      throw error;
    }
  }

  private async switchModel(targetMode: 'guided' | 'deep_dive' | 'exam_practice') {
    if (!this.chatSession || !this.ai) {
      console.warn("[GeminiService] switchModel called but session/AI is null.");
      return;
    }

    // Determine target model based on Mode AND Tier
    let targetModelName = FLASH_MODEL;

    if (targetMode === 'deep_dive' || targetMode === 'exam_practice') {
      targetModelName = this.getProModelName();
    }

    // If we are already on the target model, do nothing
    if (targetModelName === this.currentModelName) {
      console.log(`[GeminiService] Already on target model (${targetModelName}). No switch needed.`);
      return;
    }

    console.log(`[GeminiService] Switching Model: ${this.currentModelName} -> ${targetModelName} (Mode: ${targetMode}, Tier: ${this.userTier})`);

    try {
      const rawHistory = await this.chatSession.getHistory();

      // Sanitize History 
      const cleanHistory = rawHistory.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: h.parts
      }));

      try {
        this.chatSession = this.ai.chats.create({
          model: targetModelName,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_BASE,
            temperature: 0.4,
          },
          history: cleanHistory
        });
        this.currentModelName = targetModelName;
        console.log(`[GeminiService] Successfully switched to ${targetModelName}`);
      } catch (primaryError) {
        console.warn(`[GeminiService] Failed to switch to ${targetModelName}. Error:`, primaryError);

        // Fallback Logic: Try Stable Pro, then Flash
        const fallbackTarget = (targetModelName === PRO_MODEL_PAID) ? FALLBACK_MODEL : FLASH_MODEL;

        if (targetModelName !== fallbackTarget) {
          console.log(`[GeminiService] Attempting fallback to ${fallbackTarget}...`);
          this.chatSession = this.ai.chats.create({
            model: fallbackTarget,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION_BASE,
              temperature: 0.4,
            },
            history: cleanHistory
          });
          this.currentModelName = fallbackTarget;
          console.log(`[GeminiService] Fallback successful: Now using ${fallbackTarget}`);
        } else {
          throw primaryError;
        }
      }

    } catch (criticalError) {
      console.error(`[GeminiService] CRITICAL: Could not switch models. Staying on ${this.currentModelName}`, criticalError);
    }
  }

  async startTopicSession(topicName: string, mode: 'guided' | 'deep_dive', sectionContent?: string): Promise<{ text: string }> {
    console.log(`[GeminiService] startTopicSession: Topic="${topicName}", Mode="${mode}", HasContext=${!!sectionContent}`);
    if (!this.chatSession) throw new Error("Session not initialized.");

    await this.switchModel(mode);

    let promptTemplate = mode === 'guided' ? GUIDED_COURSE_PROMPT : DEEP_DIVE_PROMPT;
    let prompt = promptTemplate.replace("[TOPIC_NAME]", topicName);

    if (sectionContent) {
      prompt += `\n\n[SYSTEM]: I am providing the specific text for this topic below. Use ONLY this text as your source if possible.\n\n--- TOPIC CONTENT ---\n${sectionContent}\n--- END TOPIC CONTENT ---`;
    } else {
      prompt += `\n\n[SYSTEM]: Locate "${topicName}" in the uploaded text. Use that section as your primary source.`;
    }

    try {
      const result = await this.chatSession.sendMessage({ message: prompt });
      console.log("[GeminiService] Topic session response received.");
      return this.parseResponse(result.text || "");
    } catch (error) {
      console.error("[GeminiService] Error starting topic session:", error);
      return { text: "I encountered an error processing this topic. This might be due to API rate limits or model availability." };
    }
  }

  async sendMessage(message: string, context?: string, mode?: 'guided' | 'deep_dive' | 'exam_practice'): Promise<{ text: string, quiz?: QuizPayload, visualizations?: ConceptVisualization[] }> {
    console.log(`[GeminiService] sendMessage: Length=${message.length}, Context=${context ? 'Yes' : 'No'}, Mode=${mode}`);

    if (!this.chatSession) throw new Error("Session not initialized. Please upload a file first.");

    if (mode) {
      await this.switchModel(mode);
    }

    try {
      let finalPrompt = message;
      if (context) {
        finalPrompt = `User selection: """${context}"""\n\nQuestion: ${message}`;
      }

      const result: GenerateContentResponse = await this.chatSession.sendMessage({
        message: finalPrompt
      });
      console.log("[GeminiService] Message response received.");
      const rawText = result.text || "";
      return this.parseResponse(rawText);
    } catch (error) {
      console.error("[GeminiService] Error sending message:", error);
      return { text: "I encountered an error communicating with the AI service. Please check your API key." };
    }
  }

  async generateQuiz(domain: string, count: number = 5): Promise<{ text: string, quiz?: QuizPayload }> {
    console.log(`[GeminiService] generateQuiz: Domain="${domain}", Count=${count}`);
    if (!this.chatSession) return { text: "" };
    const prompt = `Generate a structured quiz for Domain: ${domain}. Create ${count} multiple-choice questions. Format strictly as JSON.`;
    try {
      const result: GenerateContentResponse = await this.chatSession.sendMessage({ message: prompt });
      console.log("[GeminiService] Quiz generated successfully.");
      return this.parseResponse(result.text || "");
    } catch (e) {
      console.error("[GeminiService] Quiz generation failed", e);
      return { text: "Failed to generate quiz." };
    }
  }

  async generateTOC(): Promise<TOCItem[]> {
    console.log("[GeminiService] Generating Table of Contents...");
    if (!this.chatSession) return [];
    const prompt = `Generate a JSON Table of Contents (TOC) for this book. Structure: { "toc": [{ "id": "d1", "title": "Domain 1...", "children": [] }] }`;
    try {
      const result = await this.chatSession.sendMessage({ message: prompt });
      const text = result.text || "";
      const match = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (match) {
        const parsed = JSON.parse(match[1]);
        console.log(`[GeminiService] TOC Generated. Items: ${parsed.toc?.length || 0}`);
        return parsed.toc || [];
      }
    } catch (e) {
      console.error("[GeminiService] Failed to generate TOC", e);
    }
    return [];
  }

  private parseResponse(text: string): { text: string, quiz?: QuizPayload, visualizations?: ConceptVisualization[] } {
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    let match;
    let cleanText = text;
    let quiz: QuizPayload | undefined;
    const visualizations: ConceptVisualization[] = [];

    codeBlockRegex.lastIndex = 0;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      try {
        const jsonStr = match[1];
        const parsed = JSON.parse(jsonStr);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          quiz = parsed as QuizPayload;
          cleanText = cleanText.replace(match[0], "");
        } else if (parsed.type === "visualization" || parsed.diagramType) {
          visualizations.push(parsed as ConceptVisualization);
          cleanText = cleanText.replace(match[0], "");
        }
      } catch (e) {
        console.warn("[GeminiService] Failed to parse JSON block in response", e);
      }
    }
    return {
      text: cleanText.trim(),
      quiz,
      visualizations: visualizations.length > 0 ? visualizations : undefined
    };
  }
}

export const geminiService = new GeminiService();
```

## File: services/storageService.ts
```typescript
import { get, set, del } from 'idb-keyval';
import { AppState, UserSettings } from '../types';

const DB_KEY = 'cissp_coach_data';
const DB_KEY_USER = 'cissp_coach_user';

export const storageService = {
    // Save the heavy state (Book content + History)
    async saveState(state: AppState) {
        // Create a lean object to save (exclude transient UI states like isProcessing)
        const stateToSave = {
            hasFile: state.hasFile,
            fileName: state.fileName,
            fileContent: state.fileContent, // HUGE STRING - IDB handles this fine
            mode: state.mode,
            chatHistory: state.chatHistory,
            stats: state.stats,
            toc: state.toc,
            tokenCount: state.tokenCount
        };
        console.log(`[Storage] Saving App State. History Items: ${state.chatHistory.length}`);
        await set(DB_KEY, stateToSave);
    },

    // Load the state
    async loadState(): Promise<Partial<AppState> | undefined> {
        console.log("[Storage] Loading App State...");
        return await get(DB_KEY);
    },

    // Clear state (New Book)
    async clearState() {
        console.log("[Storage] Clearing App State.");
        await del(DB_KEY);
    },

    // --- User Settings (BYOK) ---
    async saveUserSettings(settings: UserSettings) {
        console.log("[Storage] Saving User Settings.");
        await set(DB_KEY_USER, settings);
    },

    async loadUserSettings(): Promise<UserSettings | undefined> {
        console.log("[Storage] Loading User Settings...");
        return await get(DB_KEY_USER);
    },

    async clearUserSettings() {
        console.log("[Storage] Clearing User Settings.");
        await del(DB_KEY_USER);
    }
};

```

## File: services/fileProcessor.ts
```typescript
import { ProcessedBook, TOCItem } from '../types';

/**
 * Extracts text from a File object and splits it into chapters.
 * Supports .txt, .md, and .pdf
 */
export async function extractTextFromFile(file: File): Promise<ProcessedBook> {
  let fullText = "";
  const fileType = file.type;

  if (fileType === "text/plain" || fileType === "text/markdown" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
    fullText = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  } else if (fileType === "application/pdf") {
    fullText = await extractTextFromPDF(file);
  } else {
    throw new Error("Unsupported file type. Please upload PDF, TXT, or MD.");
  }

  return splitTextByChapters(fullText);
}

function splitTextByChapters(fullText: string): ProcessedBook {
  const sections: Record<string, string> = {};
  const toc: TOCItem[] = [];

  // Regex to find Chapter/Domain/Module headers
  // Looks for "Chapter X", "Domain X", "Module X" at start of line
  // Captures: 1=Type (Chapter), 2=Number, 3=Title (optional)
  const headerRegex = /(?:^|\n)((?:Chapter|Domain|Module)\s+(\d+|[IVX]+))(?::|\s+)([^\n]+)?/gi;

  let match;
  let lastIndex = 0;
  let lastId = "";
  let lastTitle = "";

  while ((match = headerRegex.exec(fullText)) !== null) {
    const currentIdx = match.index;

    // If we have a previous section, save it
    if (lastId) {
      sections[lastId] = fullText.substring(lastIndex, currentIdx).trim();
    } else if (currentIdx > 0) {
      // Capture preamble/intro text if any
      const intro = fullText.substring(0, currentIdx).trim();
      if (intro) {
        sections['intro'] = intro;
        toc.push({ id: 'intro', title: 'Introduction', level: 1, status: 'not_started' });
      }
    }

    // Prepare for next section
    const type = match[1]; // e.g. "Chapter 1"
    const num = match[2];  // e.g. "1"
    const title = match[3] ? match[3].trim() : "";

    lastId = `section_${num.toLowerCase()}`;
    lastTitle = title ? `${type}: ${title}` : type;
    lastIndex = currentIdx; // Include the header in the section text

    toc.push({
      id: lastId,
      title: lastTitle,
      level: 1,
      status: 'not_started'
    });
  }

  // Capture the last section
  if (lastId) {
    sections[lastId] = fullText.substring(lastIndex).trim();
  } else {
    // Fallback: No chapters found, treat as single document
    sections['full'] = fullText;
    toc.push({ id: 'full', title: 'Full Document', level: 1, status: 'not_started' });
  }

  return {
    fullText,
    sections,
    toc
  };
}

async function extractTextFromPDF(file: File): Promise<string> {
  // @ts-ignore - PDFJS is loaded via CDN in index.html
  const pdfjsLib = window.pdfjsLib;

  if (!pdfjsLib) {
    throw new Error("PDF.js library not loaded. Please refresh or check connection.");
  }

  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";

    // Iterate through all pages
    const maxPages = pdf.numPages;

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += `\n` + pageText; // Removed "--- Page X ---" to avoid confusing the regex
    }

    return fullText;
  } catch (error) {
    console.error("PDF Parsing Error", error);
    throw new Error("Failed to parse PDF. Please ensure it is a valid PDF document.");
  }
}
```

## File: components/ChatInterface.tsx
```typescript
import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Message, MessageRole, TeachingMode } from '../types';
import Quiz from './Quiz';
import ConceptVisualizationPanel from './ConceptVisualizationPanel';
import LessonReader from './LessonReader';
import SelectionQuestionModal from './SelectionQuestionModal';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, context?: string) => void;
  isLoading: boolean;
  mode: TeachingMode;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, mode }) => {
  const [input, setInput] = useState('');
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleAskAboutSelection = (text: string) => {
    setCurrentSelection(text);
    setSelectionModalOpen(true);
  };

  const handleSelectionSubmit = (question: string) => {
    onSendMessage(question, currentSelection);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{mode}</h2>
          <p className="text-sm text-slate-500">
            {mode === TeachingMode.GUIDED && "Step-by-step chapter progression"}
            {mode === TeachingMode.DEEP_DIVE && "In-depth explanation of specific topics"}
            {mode === TeachingMode.EXAM_PRACTICE && "Scenario-based questions and analysis"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-5xl mx-auto ${
              msg.role === MessageRole.USER ? 'flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm
              ${msg.role === MessageRole.USER ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}
            `}>
              {msg.role === MessageRole.USER ? <User size={20} /> : <Bot size={20} />}
            </div>

            {/* Bubble & Content */}
            <div className={`flex flex-col gap-3 max-w-[90%] md:max-w-[85%] ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
              
              {/* Text Content */}
              {msg.text && (
                 <div className={`
                   rounded-2xl shadow-sm w-full overflow-hidden transition-all
                   ${msg.role === MessageRole.USER 
                     ? 'bg-indigo-600 text-white rounded-tr-none p-4' 
                     : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none p-6 md:p-8'}
                 `}>
                   {/* Context display for User Selection messages */}
                   {msg.role === MessageRole.USER && msg.selectionContext && (
                     <div className="mb-3 text-sm bg-indigo-700/50 p-3 rounded-lg border border-indigo-500/30">
                       <p className="opacity-70 text-xs uppercase font-bold mb-1">Regarding selection:</p>
                       <p className="italic line-clamp-2">"...{msg.selectionContext}..."</p>
                     </div>
                   )}

                   {/* Use LessonReader for Model messages to enable selection, simple div for User */}
                   {msg.role === MessageRole.MODEL ? (
                     <LessonReader 
                       content={msg.text} 
                       onAskAboutSelection={handleAskAboutSelection}
                       role={msg.role}
                     />
                   ) : (
                     <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                   )}

                   <div className={`text-xs mt-4 ${msg.role === MessageRole.USER ? 'text-indigo-200' : 'text-slate-400'}`}>
                     {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                 </div>
              )}

              {/* Visualizations */}
              {msg.visualizations && msg.visualizations.length > 0 && (
                <div className="w-full">
                  {msg.visualizations.map((viz, idx) => (
                    <ConceptVisualizationPanel key={idx} viz={viz} />
                  ))}
                </div>
              )}

              {/* Quiz UI */}
              {msg.quizPayload && (
                 <div className="w-full">
                    <Quiz data={msg.quizPayload} />
                 </div>
              )}

            </div>
          </div>
        ))}

        {isLoading && (
           <div className="flex gap-4 max-w-5xl mx-auto">
             <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={20} />
             </div>
             <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-6 shadow-sm flex items-center gap-3">
                <Loader2 className="animate-spin text-emerald-600" size={20} />
                <span className="text-slate-600 font-medium">Consulting knowledge base...</span>
             </div>
           </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-5xl mx-auto relative">
          <form onSubmit={handleSubmit} className="relative group">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question, request a quiz, or ask for an explanation..."
              rows={1}
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none max-h-32 shadow-inner text-slate-800 placeholder-slate-400 text-base transition-all"
              style={{ minHeight: '56px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-xs text-slate-400">
                AI can make mistakes. Cross-reference with your official guide.
            </p>
          </div>
        </div>
      </div>

      {/* Selection Question Modal */}
      <SelectionQuestionModal
        isOpen={selectionModalOpen}
        selectionText={currentSelection}
        onClose={() => setSelectionModalOpen(false)}
        onSubmit={handleSelectionSubmit}
      />
    </div>
  );
};

export default ChatInterface;
```

## File: components/ConceptVisualizationPanel.tsx
```typescript
import React, { useEffect, useRef } from "react";
import { ConceptVisualization } from "../types";
import mermaid from "mermaid";

interface ConceptVisualizationPanelProps {
  viz: ConceptVisualization;
}

const ConceptVisualizationPanel: React.FC<ConceptVisualizationPanelProps> = ({ viz }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viz.diagramType.startsWith("mermaid-") && chartRef.current) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
      });
      
      const renderChart = async () => {
        try {
          // Generate a unique ID for the mermaid graph
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, viz.diagramCode);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid rendering failed:", error);
          if (chartRef.current) {
            chartRef.current.innerHTML = `<div class="text-red-500 text-sm">Failed to render diagram. Code error.</div><pre class="text-xs bg-slate-100 p-2 mt-2">${viz.diagramCode}</pre>`;
          }
        }
      };

      renderChart();
    }
  }, [viz.diagramCode, viz.diagramType]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm my-4 max-w-3xl">
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
        <h4 className="font-semibold text-indigo-900 text-sm flex items-center gap-2">
          Visualization: {viz.title}
        </h4>
        <p className="text-xs text-indigo-700 mt-0.5">{viz.purpose}</p>
      </div>

      <div className="p-4 flex justify-center bg-white">
        {viz.diagramType.startsWith("mermaid-") ? (
          <div ref={chartRef} className="mermaid w-full flex justify-center" />
        ) : (
          <pre className="whitespace-pre-wrap text-xs font-mono bg-slate-900 text-green-400 p-4 rounded-lg w-full overflow-x-auto">
            {viz.diagramCode}
          </pre>
        )}
      </div>
    </div>
  );
};

export default ConceptVisualizationPanel;
```

## File: components/FileUpload.tsx
```typescript
import React, { useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { extractTextFromFile } from '../services/fileProcessor';

interface FileUploadProps {
  onFileProcessed: (content: any, fileName: string) => void;
  isProcessing?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, isProcessing: externalProcessing = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [internalProcessing, setInternalProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isProcessing = externalProcessing || internalProcessing;

  const processFile = async (file: File) => {
    setInternalProcessing(true);
    setError(null);

    try {
      const text = await extractTextFromFile(file);
      // text is now ProcessedBook, but we check length of fullText if possible, or just assume it's good if it didn't throw
      // Actually extractTextFromFile returns ProcessedBook which has fullText
      if (text.fullText.length < 100) {
        throw new Error("The file appears to be empty or unreadable.");
      }
      onFileProcessed(text, file.name);
    } catch (err: any) {
      setError(err.message || "Failed to process file");
      setInternalProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-700">
        <div className="text-center mb-8">
          <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Upload Study Guide</h1>
          <p className="text-slate-400">
            Upload your CISSP PDF, Text, or Markdown file to begin your personalized coaching session.
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative
            ${isDragging
              ? 'border-emerald-500 bg-emerald-500/5'
              : 'border-slate-600 hover:border-emerald-500/50 hover:bg-slate-700/50'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center py-4">
              <Loader2 className="animate-spin text-emerald-500 mb-2" size={32} />
              <p className="text-emerald-500 font-medium">Extracting content...</p>
              <p className="text-xs text-slate-500 mt-1">Large PDFs may take a moment</p>
            </div>
          ) : (
            <>
              <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300 font-medium mb-1">
                Click to browse or drag file here
              </p>
              <p className="text-xs text-slate-500">
                Supports PDF (Standard Text), TXT, MD
              </p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">What happens next?</h3>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              AI analyzes your document structure
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              Knowledge bank is created in memory
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-500">•</span>
              Interactive training session begins
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
```

## File: components/LessonReader.tsx
```typescript
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageRole } from '../types';
import { MessageCircleQuestion } from 'lucide-react';
import KeyConceptCard from './cards/KeyConceptCard';
import ExamTipCard from './cards/ExamTipCard';
import WarningCard from './cards/WarningCard';

interface LessonReaderProps {
  content: string;
  onAskAboutSelection: (text: string) => void;
  role: MessageRole;
}

const LessonReader: React.FC<LessonReaderProps> = ({ content, onAskAboutSelection, role }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        setButtonPosition(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();

      // Filter out invalid selections
      if (!text || text.length < 3 || text.length > 800) {
        setButtonPosition(null);
        setSelectedText('');
        return;
      }

      // Ensure selection is inside this specific component
      if (containerRef.current && !containerRef.current.contains(selection.anchorNode)) {
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Calculate position relative to viewport, but we might want it fixed/absolute
      // Using client coordinates for fixed positioning of the button
      setButtonPosition({
        top: rect.top - 40, // Place above the selection
        left: rect.left + (rect.width / 2) // Center horizontally
      });
      setSelectedText(text);
    };

    // We attach listener to document to handle clearing selection when clicking outside
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedText) {
      onAskAboutSelection(selectedText);
      // Clear selection after action
      window.getSelection()?.removeAllRanges();
      setButtonPosition(null);
      setSelectedText('');
    }
  };

  const isModel = role === MessageRole.MODEL;

  // Custom Parsing Logic for Directives
  const renderContent = () => {
    // Regex to find blocks: :::type \n content \n :::
    // We use capturing group for type and content
    const regex = /:::(key-concept|exam-tip|warning)([\s\S]*?):::/g;

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      // Push text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'markdown',
          content: content.substring(lastIndex, match.index)
        });
      }

      // Push the directive
      parts.push({
        type: match[1], // key-concept, exam-tip, warning
        content: match[2].trim()
      });

      lastIndex = regex.lastIndex;
    }

    // Push remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'markdown',
        content: content.substring(lastIndex)
      });
    }

    return parts.map((part, idx) => {
      if (part.type === 'markdown') {
        return (
          <ReactMarkdown
            key={idx}
            components={{
              code({ node, className, children, ...props }) {
                return (
                  <code className={`${className} bg-slate-800 text-slate-100 px-1.5 py-0.5 rounded text-sm`} {...props}>
                    {children}
                  </code>
                );
              },
              pre({ node, children, ...props }) {
                return (
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm my-4 shadow-inner" {...props}>
                    {children}
                  </pre>
                );
              },
              h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-2 text-slate-800 border-b pb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-6 text-slate-800">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 text-slate-800">{children}</h3>,
              p: ({ children }) => <p className="mb-4 text-slate-700">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-700">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-slate-700">{children}</ol>,
              li: ({ children }) => <li className="pl-1">{children}</li>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 my-4 bg-emerald-50 text-slate-700 italic rounded-r">{children}</blockquote>
            }}
          >
            {part.content}
          </ReactMarkdown>
        );
      }

      switch (part.type) {
        case 'key-concept':
          return <KeyConceptCard key={idx} content={part.content} />;
        case 'exam-tip':
          return <ExamTipCard key={idx} content={part.content} />;
        case 'warning':
          return <WarningCard key={idx} content={part.content} />;
        default:
          return null;
      }
    });
  };

  return (
    <div className="relative group" ref={containerRef}>
      <div className={`
        prose max-w-none text-base leading-relaxed
        ${isModel ? 'prose-slate' : 'prose-invert'}
`}>
        {renderContent()}
      </div>

      {/* Floating Action Button */}
      {buttonPosition && isModel && (
        <div
          className="fixed z-50 transform -translate-x-1/2 animate-in fade-in zoom-in duration-200"
          style={{ top: buttonPosition.top, left: buttonPosition.left }}
        >
          <button
            onClick={handleButtonClick}
            className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-xl hover:bg-emerald-600 transition-colors text-xs font-semibold whitespace-nowrap ring-2 ring-white"
          >
            <MessageCircleQuestion size={14} />
            Ask about this
          </button>
          {/* Triangle pointer */}
          <div className="absolute left-1/2 -bottom-1.5 w-3 h-3 bg-slate-900 transform -translate-x-1/2 rotate-45" />
        </div>
      )}
    </div>
  );
};

export default LessonReader;
```

## File: components/Quiz.tsx
```typescript
import React, { useState } from 'react';
import { QuizPayload, QuizQuestion } from '../types';
import { CheckCircle2, XCircle, ChevronRight, AlertCircle, Award } from 'lucide-react';

interface QuizProps {
  data: QuizPayload;
}

const Quiz: React.FC<QuizProps> = ({ data }) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < data.questions.length) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) return;
    }
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    data.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / data.questions.length) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden my-4 max-w-3xl">
      {/* Quiz Header */}
      <div className="bg-slate-900 text-white p-6">
        <h3 className="text-xl font-bold mb-2">{data.title}</h3>
        {data.description && <p className="text-slate-300 text-sm">{data.description}</p>}
        {isSubmitted && (
          <div className="mt-4 flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
            <Award className="text-yellow-400" size={24} />
            <div>
              <p className="text-sm text-slate-400 font-medium">Your Score</p>
              <p className="text-2xl font-bold text-white">{calculateScore()}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="p-6 space-y-8">
        {data.questions.map((q, idx) => {
          const isCorrect = userAnswers[q.id] === q.correctIndex;
          const userAnswer = userAnswers[q.id];
          
          return (
            <div key={q.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
              <div className="flex gap-3 mb-4">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 text-lg leading-relaxed">{q.question}</h4>
                  <div className="flex gap-2 mt-2">
                    {q.difficulty && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium border
                        ${q.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' : 
                          q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-red-50 text-red-700 border-red-200'}`}>
                        {q.difficulty.toUpperCase()}
                      </span>
                    )}
                    {q.domain && (
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {q.domain}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIdx) => {
                  let optionClass = "w-full text-left p-3 rounded-lg border transition-all text-sm flex justify-between items-center ";
                  
                  if (!isSubmitted) {
                    optionClass += userAnswer === optIdx 
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 text-emerald-900" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700";
                  } else {
                    // Result state
                    if (optIdx === q.correctIndex) {
                      optionClass += "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
                    } else if (userAnswer === optIdx) {
                      optionClass += "border-red-500 bg-red-50 text-red-800";
                    } else {
                      optionClass += "border-slate-100 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={isSubmitted}
                      className={optionClass}
                    >
                      <span className="font-medium">{opt}</span>
                      {isSubmitted && optIdx === q.correctIndex && <CheckCircle2 size={18} className="text-green-600" />}
                      {isSubmitted && userAnswer === optIdx && optIdx !== q.correctIndex && <XCircle size={18} className="text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isSubmitted && (
                <div className={`mt-4 ml-9 p-4 rounded-lg text-sm border ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2 mb-2 font-semibold text-slate-800">
                    <AlertCircle size={16} className="text-slate-500" />
                    Explanation
                  </div>
                  <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {!isSubmitted && (
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Submit Quiz
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
```

## File: components/SelectionQuestionModal.tsx
```typescript
import React, { useState, useEffect } from 'react';
import { X, MessageCircleQuestion, Quote } from 'lucide-react';

interface SelectionQuestionModalProps {
  isOpen: boolean;
  selectionText: string;
  onClose: () => void;
  onSubmit: (question: string) => void;
}

const SelectionQuestionModal: React.FC<SelectionQuestionModalProps> = ({ 
  isOpen, 
  selectionText, 
  onClose, 
  onSubmit 
}) => {
  const [question, setQuestion] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuestion("Explain this concept to me in simple terms and relate it to CISSP exam questions.");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onSubmit(question);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <MessageCircleQuestion className="text-emerald-600" size={20} />
            <h3 className="font-bold text-lg">Ask about selection</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          {/* Selected Context */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Context from lesson
            </label>
            <div className="bg-slate-50 border-l-4 border-emerald-500 p-4 rounded-r-lg text-slate-700 text-sm italic relative">
              <Quote size={16} className="text-emerald-200 absolute top-2 right-2" />
              <p className="line-clamp-4 leading-relaxed">
                "{selectionText}"
              </p>
            </div>
          </div>

          {/* Question Input */}
          <div className="mb-2">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Your Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none min-h-[120px] text-slate-800 text-base resize-none bg-white"
              placeholder="Type your question here..."
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!question.trim()}
              className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-sm shadow-emerald-200 disabled:opacity-50 transition-all transform active:scale-95"
            >
              Ask Coach
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectionQuestionModal;
```

## File: components/SetupModal.tsx
```typescript
import React, { useState } from 'react';
import { UserSettings, AccountTier } from '../types';
import { Key, User, Shield, Check, AlertCircle } from 'lucide-react';

interface SetupModalProps {
    onComplete: (settings: UserSettings) => void;
}

const SetupModal: React.FC<SetupModalProps> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [tier, setTier] = useState<AccountTier>('free');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const trimmedKey = apiKey.trim();

        if (!name.trim()) {
            setError("Please enter your name.");
            return;
        }
        if (!trimmedKey) {
            setError("Please enter your Google Gemini API Key.");
            return;
        }
        if (trimmedKey.length < 30) {
            setError("That API key looks too short. Please check it again.");
            return;
        }

        onComplete({
            userName: name.trim(),
            apiKey: trimmedKey,
            tier: tier
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="bg-slate-900/50 p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        CISSP Coach Setup
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Configure your secure learning environment.
                    </p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Your Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Agent Smith"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* API Key Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">Gemini API Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIzaSy..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            Your key is stored locally in your browser. We never see it.
                        </p>
                    </div>

                    {/* Tier Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-300">Select Account Tier</label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Free Tier Card */}
                            <button
                                type="button"
                                onClick={() => setTier('free')}
                                className={`relative p-3 rounded-xl border text-left transition-all ${tier === 'free'
                                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                                        : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="font-semibold text-slate-200 text-sm">Free Tier</div>
                                <div className="text-xs text-slate-400 mt-1">Standard Speed</div>
                                <div className="text-[10px] text-slate-500 mt-2">Uses Gemini 1.5 Flash</div>
                                {tier === 'free' && (
                                    <div className="absolute top-2 right-2 text-emerald-500">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </button>

                            {/* Paid Tier Card */}
                            <button
                                type="button"
                                onClick={() => setTier('paid')}
                                className={`relative p-3 rounded-xl border text-left transition-all ${tier === 'paid'
                                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                                        : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="font-semibold text-slate-200 text-sm">Paid Tier</div>
                                <div className="text-xs text-slate-400 mt-1">Deep Reasoning</div>
                                <div className="text-[10px] text-slate-500 mt-2">Unlocks Gemini 1.5 Pro</div>
                                {tier === 'paid' && (
                                    <div className="absolute top-2 right-2 text-emerald-500">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                    >
                        Start Coaching
                    </button>

                </form>
            </div>
        </div>
    );
};

export default SetupModal;

```

## File: components/Sidebar.tsx
```typescript
import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  GraduationCap,
  ShieldCheck,
  Menu,
  X,
  List,
  BarChart2,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  PlayCircle,
  Shield,
  Settings
} from 'lucide-react';
import { DomainStats, TeachingMode, TOCItem, TopicStatus } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

interface SidebarProps {
  stats: DomainStats[];
  toc?: TOCItem[];
  currentMode: TeachingMode;
  tokenCount?: number;
  onModeChange: (mode: TeachingMode) => void;
  onTopicClick?: (topicId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onResetCredentials?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ stats, toc, currentMode, tokenCount, onModeChange, onTopicClick, isOpen, onClose, onResetCredentials }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'content'>('content');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggleTopic = (id: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTopics(newExpanded);
  };

  const getMasteryColor = (score: number) => {
    if (score < 30) return '#ef4444'; // red-500
    if (score < 70) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const navItems = [
    { mode: TeachingMode.GUIDED, icon: BookOpen, label: 'Guided Course' },
    { mode: TeachingMode.DEEP_DIVE, icon: Target, label: 'Deep Dive' },
    { mode: TeachingMode.EXAM_PRACTICE, icon: GraduationCap, label: 'Exam Practice' },
  ];

  const renderTOCItem = (item: TOCItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedTopics.has(item.id);

    let StatusIcon = Circle;
    let statusColor = "text-slate-600";

    if (item.status === 'completed') {
      StatusIcon = CheckCircle2;
      statusColor = "text-emerald-500";
    } else if (item.status === 'in_progress') {
      StatusIcon = PlayCircle;
      statusColor = "text-indigo-400";
    }

    return (
      <div key={item.id} className="ml-2">
        <div
          className={`
            flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
            ${item.status === 'in_progress' ? 'bg-slate-800' : 'hover:bg-slate-800/50'}
          `}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleTopic(item.id);
            if (onTopicClick) onTopicClick(item.id);
          }}
        >
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); toggleTopic(item.id); }}>
              {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
            </button>
          ) : <span className="w-3.5" />}

          <StatusIcon size={14} className={statusColor} />

          <span className={`text-sm ${item.status === 'in_progress' ? 'text-white font-medium' : 'text-slate-300'}`}>
            {item.title}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-slate-800 pl-1 mt-1 space-y-1">
            {item.children!.map(child => renderTOCItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        w-80 bg-slate-900 border-r border-slate-700 text-slate-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">CISSP Coach</h1>
              {tokenCount && (
                <p className="text-xs text-slate-400 font-mono">
                  ~{(tokenCount / 1000).toFixed(1)}k tokens
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
              ${activeTab === 'content' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <List size={16} />
            Content
            {activeTab === 'content' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
              ${activeTab === 'stats' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <BarChart2 size={16} />
            Progress
            {activeTab === 'stats' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
        </div>

        {/* Navigation Modes */}
        <div className="p-4 space-y-2 border-b border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => {
                onModeChange(item.mode);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-xs font-medium
                ${currentMode === item.mode
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'content' ? (
            <div className="p-4">
              {toc ? (
                <div className="space-y-1">
                  {toc.map(item => renderTOCItem(item))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <p>No content loaded.</p>
                  <p className="text-xs mt-2">Upload a study guide to generate a Table of Contents.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Domain Mastery</p>

              <div className="h-40 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <XAxis dataKey="id" hide />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getMasteryColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.id} className="group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-medium text-slate-300 truncate w-3/4" title={stat.name}>
                        {stat.id.toUpperCase()}: {stat.name}
                      </span>
                      <span className="text-xs font-bold" style={{ color: getMasteryColor(stat.score) }}>
                        {stat.score}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${stat.score}%`,
                          backgroundColor: getMasteryColor(stat.score)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-3">
          {onResetCredentials && (
            <button
              onClick={onResetCredentials}
              className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors"
            >
              <Settings size={14} />
              Settings / Reset Key
            </button>
          )}
          <div className="text-xs text-slate-500 text-center">
            Powered by Google Gemini 2.5 Flash
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
```

## File: components/cards/KeyConceptCard.tsx
```typescript
import React from 'react';
import { Lightbulb, Target } from 'lucide-react';

interface KeyConceptCardProps {
    content: string;
}

const KeyConceptCard: React.FC<KeyConceptCardProps> = ({ content }) => {
    // Parse content: Expected format "Title: ... \n Summary: ... \n Why it matters: ..."
    const lines = content.split('\n');
    let title = "Key Concept";
    let summary = "";
    let whyItMatters = "";

    let currentSection = "";

    lines.forEach(line => {
        if (line.startsWith("Title:")) {
            title = line.replace("Title:", "").trim();
        } else if (line.startsWith("Summary:")) {
            currentSection = "summary";
            summary += line.replace("Summary:", "").trim();
        } else if (line.startsWith("Why it matters:")) {
            currentSection = "why";
            whyItMatters += line.replace("Why it matters:", "").trim();
        } else {
            if (currentSection === "summary") summary += " " + line.trim();
            if (currentSection === "why") whyItMatters += " " + line.trim();
        }
    });

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-950/60 backdrop-blur-sm shadow-lg shadow-emerald-900/20">
            <div className="bg-emerald-900/50 px-5 py-3 border-b border-emerald-500/20 flex items-center gap-3">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-emerald-300" />
                </div>
                <h3 className="font-bold text-emerald-50 text-lg">{title}</h3>
            </div>

            <div className="p-5 space-y-4">
                <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Summary</h4>
                    <p className="text-slate-100 leading-relaxed text-sm">{summary}</p>
                </div>

                {whyItMatters && (
                    <div className="bg-emerald-900/40 rounded-lg p-3 border border-emerald-500/20">
                        <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Exam Relevance</h4>
                                <p className="text-emerald-100 text-sm italic">{whyItMatters}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeyConceptCard;

```

## File: components/cards/ExamTipCard.tsx
```typescript
import React from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

interface ExamTipCardProps {
    content: string;
}

const ExamTipCard: React.FC<ExamTipCardProps> = ({ content }) => {
    // Content is likely a list of bullets
    const tips = content.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^-\s*/, '').trim());

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-indigo-500/30 bg-indigo-950/60 backdrop-blur-sm shadow-lg shadow-indigo-900/20">
            <div className="bg-indigo-900/50 px-5 py-3 border-b border-indigo-500/20 flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="font-bold text-indigo-50 text-lg">Exam Tips</h3>
            </div>

            <div className="p-5">
                <ul className="space-y-3">
                    {tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-indigo-100">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExamTipCard;

```

## File: components/cards/WarningCard.tsx
```typescript
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningCardProps {
    content: string;
}

const WarningCard: React.FC<WarningCardProps> = ({ content }) => {
    return (
        <div className="my-6 rounded-xl overflow-hidden border border-red-500/30 bg-red-950/60 backdrop-blur-sm shadow-lg shadow-red-900/20">
            <div className="p-4 flex items-start gap-4">
                <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Common Pitfall</h4>
                    <p className="text-red-100 text-sm leading-relaxed">{content}</p>
                </div>
            </div>
        </div>
    );
};

export default WarningCard;

```

