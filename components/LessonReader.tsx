import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageRole } from '../types';
import { MessageCircleQuestion } from 'lucide-react';

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

  return (
    <div className="relative group" ref={containerRef}>
      <div className={`
        prose max-w-none text-base leading-relaxed
        ${isModel ? 'prose-slate' : 'prose-invert'}
      `}>
        <ReactMarkdown
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
            h1: ({children}) => <h1 className="text-2xl font-bold mb-4 mt-2 text-slate-800 border-b pb-2">{children}</h1>,
            h2: ({children}) => <h2 className="text-xl font-bold mb-3 mt-6 text-slate-800">{children}</h2>,
            h3: ({children}) => <h3 className="text-lg font-bold mb-2 mt-4 text-slate-800">{children}</h3>,
            p: ({children}) => <p className="mb-4 text-slate-700">{children}</p>,
            ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1 text-slate-700">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-slate-700">{children}</ol>,
            li: ({children}) => <li className="pl-1">{children}</li>,
            blockquote: ({children}) => <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 my-4 bg-emerald-50 text-slate-700 italic rounded-r">{children}</blockquote>
          }}
        >
          {content}
        </ReactMarkdown>
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