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