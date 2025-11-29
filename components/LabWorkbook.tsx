import React, { useState } from 'react';
import { PenTool, Sparkles, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { ChapterElements } from '../types';
import { geminiService } from '../services/geminiService';

interface LabWorkbookProps {
    elements: ChapterElements;
    chapterTitle: string;
}

export const LabWorkbook: React.FC<LabWorkbookProps> = ({ elements, chapterTitle }) => {
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<Record<number, string>>({});
    const [loadingFeedback, setLoadingFeedback] = useState<number | null>(null);
    const [savedStatus, setSavedStatus] = useState<Record<number, boolean>>({});

    const handleAnswerChange = (index: number, value: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [index]: value
        }));
        // Reset saved status on change
        if (savedStatus[index]) {
            setSavedStatus(prev => ({ ...prev, [index]: false }));
        }
    };

    const handleSave = (index: number) => {
        // In a real app, this would persist to DB/Storage
        setSavedStatus(prev => ({ ...prev, [index]: true }));
        // Mock save delay
        setTimeout(() => setSavedStatus(prev => ({ ...prev, [index]: false })), 2000);
    };

    const handleGetFeedback = async (index: number, question: string) => {
        const answer = userAnswers[index];
        if (!answer?.trim()) return;

        setLoadingFeedback(index);
        try {
            const prompt = `
I am doing a Written Lab for CISSP Chapter: "${chapterTitle}".
Lab Question: "${question}"

My Answer: "${answer}"

Please evaluate my answer. Is it correct? What did I miss? Provide a model answer.
            `.trim();

            const response = await geminiService.sendMessage(prompt);
            setFeedback(prev => ({
                ...prev,
                [index]: response.text
            }));
        } catch (error) {
            console.error("Failed to get feedback", error);
            setFeedback(prev => ({
                ...prev,
                [index]: "Failed to generate feedback. Please try again."
            }));
        } finally {
            setLoadingFeedback(null);
        }
    };

    if (!elements.writtenLabs || elements.writtenLabs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <PenTool className="w-12 h-12 mb-4 opacity-20" />
                <p>No written labs found for this chapter.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <PenTool className="text-emerald-500" />
                    Written Labs
                </h2>
                <p className="text-slate-400 mt-2">
                    Practice your knowledge by answering these scenarios. Use the AI assistant to evaluate your responses.
                </p>
            </div>

            <div className="space-y-8">
                {elements.writtenLabs.map((lab, index) => (
                    <div key={index} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-slate-700">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                            <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">
                                Lab Scenario {index + 1}
                            </h3>
                            <p className="text-slate-200 font-medium leading-relaxed">
                                {lab.question}
                            </p>
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-slate-900">
                            <textarea
                                value={userAnswers[index] || ''}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                placeholder="Type your detailed answer here..."
                                className="w-full h-48 p-4 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-none transition-all"
                            />

                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs text-slate-500">
                                    {userAnswers[index]?.length || 0} characters
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleSave(index)}
                                        className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        {savedStatus[index] ? <CheckCircle size={16} className="text-emerald-500" /> : <Save size={16} />}
                                        {savedStatus[index] ? 'Saved' : 'Save Draft'}
                                    </button>
                                    <button
                                        onClick={() => handleGetFeedback(index, lab.question)}
                                        disabled={loadingFeedback === index || !userAnswers[index]?.trim()}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loadingFeedback === index ? (
                                            <>
                                                <span className="animate-spin">⟳</span> Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={16} /> Evaluate Answer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Section */}
                        {feedback[index] && (
                            <div className="border-t border-slate-800 bg-slate-950/30 p-6 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 mb-4 text-emerald-400">
                                    <Sparkles size={18} />
                                    <h4 className="font-bold text-sm uppercase tracking-wider">AI Coach Feedback</h4>
                                </div>
                                <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                                    {feedback[index].split('\n').map((line, i) => (
                                        <p key={i} className="mb-2">{line}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
