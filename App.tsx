import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import FileUpload from './components/FileUpload';
import { AppState, DomainStats, TeachingMode, Message, MessageRole } from './types';
import { INITIAL_DOMAINS } from './constants';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    hasFile: false,
    fileName: null,
    fileContent: null,
    isProcessing: false,
    mode: TeachingMode.GUIDED,
    chatHistory: [],
    stats: INITIAL_DOMAINS,
    apiKeyValid: !!process.env.API_KEY,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  // Initialize chat when file is processed
  const handleFileProcessed = async (content: string, fileName: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    try {
        await geminiService.initializeSession(content);
        
        setState(prev => ({
            ...prev,
            hasFile: true,
            fileName: fileName,
            fileContent: content,
            isProcessing: false,
            chatHistory: [
                {
                    id: 'welcome',
                    role: MessageRole.MODEL,
                    text: `**I have successfully ingested ${fileName}.**\n\nI am ready to act as your CISSP Coach. \n\nWe can:\n1. Start specifically with **Domain 1: Security and Risk Management**.\n2. Create a **Baseline Assessment Quiz** to gauge your level.\n3. Jump straight into a topic of your choice.\n\n*How would you like to proceed?*`,
                    timestamp: Date.now()
                }
            ]
        }));
    } catch (e) {
        console.error("Initialization failed", e);
        // Reset processing state on error would happen here in a real app
    }
  };

  const handleSendMessage = async (text: string, context?: string) => {
    // Add User Message
    const userMsg: Message = {
        id: Date.now().toString(),
        role: MessageRole.USER,
        text: text,
        selectionContext: context,
        timestamp: Date.now()
    };

    setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, userMsg]
    }));

    setIsLoadingResponse(true);

    try {
        let promptToSend = text;
        
        // Append context hint based on mode if needed
        if (state.mode === TeachingMode.EXAM_PRACTICE) {
            promptToSend += "\n\n(Context: User is in Exam Practice mode. Provide questions or exam-focused analysis.)";
        } else if (state.mode === TeachingMode.GUIDED) {
            promptToSend += "\n\n(Context: User is in Guided Course mode. Teach sequentially.)";
        }

        // Pass context to service
        const response = await geminiService.sendMessage(promptToSend, context);

        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: MessageRole.MODEL,
            text: response.text,
            quizPayload: response.quiz,
            visualizations: response.visualizations,
            timestamp: Date.now()
        };

        setState(prev => ({
            ...prev,
            chatHistory: [...prev.chatHistory, aiMsg]
        }));

        // Analyze response to update stats (Mock logic for demonstration)
        updateMockStats(text);

    } catch (error) {
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: MessageRole.MODEL,
            text: "I'm sorry, I encountered an issue connecting to the knowledge base. Please try asking again.",
            timestamp: Date.now()
        };
        setState(prev => ({
            ...prev,
            chatHistory: [...prev.chatHistory, errorMsg]
        }));
    } finally {
        setIsLoadingResponse(false);
    }
  };

  const updateMockStats = (userText: string) => {
      // Very basic keyword matching to simulate "engagement" with a domain
      // Real implementation would parse AI structured output
      const lowerText = userText.toLowerCase();
      setState(prev => {
          const newStats = prev.stats.map(d => {
              if (lowerText.includes(d.name.toLowerCase().split(' ')[0].toLowerCase())) {
                  return { ...d, score: Math.min(100, d.score + 5) };
              }
              return d;
          });
          return { ...prev, stats: newStats };
      });
  };

  const handleModeChange = (mode: TeachingMode) => {
      setState(prev => ({ ...prev, mode }));
      // Optionally insert a system message indicating mode switch
      const switchMsg: Message = {
          id: Date.now().toString(),
          role: MessageRole.MODEL,
          text: `**Switched to ${mode} mode.**\n\n${getModeIntro(mode)}`,
          timestamp: Date.now()
      };
      setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, switchMsg]
    }));
  };

  const getModeIntro = (mode: TeachingMode) => {
      switch(mode) {
          case TeachingMode.GUIDED: return "I will guide you through the chapters sequentially. Ready for the next section?";
          case TeachingMode.DEEP_DIVE: return "Ask me about any specific concept (e.g., 'Kerberos', 'Biba Model', 'SDLC').";
          case TeachingMode.EXAM_PRACTICE: return "I will present scenario-based questions. I'll analyze your answers for the 'BEST' or 'MOST' likely choices.";
          default: return "";
      }
  };

  if (!state.hasFile) {
    return <FileUpload onFileProcessed={handleFileProcessed} />;
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden text-slate-100 font-sans">
      <Sidebar 
        stats={state.stats}
        currentMode={state.mode}
        onModeChange={handleModeChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 text-white p-4 flex items-center gap-3 border-b border-slate-700">
             <button onClick={() => setIsSidebarOpen(true)}>
                 <Menu size={24} />
             </button>
             <span className="font-bold">CISSP Coach</span>
        </div>

        <ChatInterface 
          messages={state.chatHistory}
          onSendMessage={handleSendMessage}
          isLoading={isLoadingResponse}
          mode={state.mode}
        />
      </div>
    </div>
  );
};

export default App;