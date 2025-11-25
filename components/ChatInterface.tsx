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