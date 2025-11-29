import React, { useState } from 'react';
import {
    Lightbulb,
    BookOpen,
    Key,
    Type,
    Maximize2,
    Minimize2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { ChapterElements } from '../types';

interface TopicExplainerProps {
    elements: ChapterElements;
    chapterTitle: string;
}

export const TopicExplainer: React.FC<TopicExplainerProps> = ({ elements, chapterTitle }) => {
    const [readMode, setReadMode] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        tips: true,
        summary: true,
        essentials: true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const hasContent = elements.tips.length > 0 || elements.summaries.length > 0 || elements.studyEssentials.length > 0;

    if (!hasContent) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                <p>No additional study elements found for this chapter.</p>
            </div>
        );
    }

    const containerClass = readMode
        ? "max-w-3xl mx-auto py-12 px-8 bg-slate-900 min-h-screen shadow-2xl"
        : "max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6";

    const contentClass = readMode
        ? "prose prose-invert prose-lg max-w-none"
        : "";

    return (
        <div className="relative">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 flex justify-end p-4 bg-slate-950/80 backdrop-blur border-b border-slate-800 mb-6">
                <button
                    onClick={() => setReadMode(!readMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${readMode
                            ? 'bg-emerald-500 text-white'
                            : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                        }`}
                >
                    {readMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    {readMode ? 'Exit Read Mode' : 'Read Mode'}
                </button>
            </div>

            <div className={containerClass}>
                {/* Header */}
                <div className={readMode ? "mb-12 border-b border-slate-800 pb-8" : "lg:col-span-12 mb-4"}>
                    <h2 className={`font-bold text-slate-100 ${readMode ? 'text-4xl' : 'text-2xl'}`}>
                        {chapterTitle}
                    </h2>
                    <p className="text-emerald-500 font-mono text-sm mt-2">Study Essentials & Key Concepts</p>
                </div>

                {/* Left Column (Tips & Summary) */}
                <div className={readMode ? "space-y-12" : "lg:col-span-7 space-y-6"}>

                    {/* Exam Tips */}
                    {elements.tips.length > 0 && (
                        <div className={`rounded-xl overflow-hidden transition-all duration-300 ${readMode ? 'bg-transparent' : 'bg-slate-900 border border-slate-800'
                            }`}>
                            <button
                                onClick={() => toggleSection('tips')}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                        <Lightbulb size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-200">Exam Tips</h3>
                                </div>
                                {!readMode && (
                                    expandedSections['tips'] ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />
                                )}
                            </button>

                            {(readMode || expandedSections['tips']) && (
                                <div className="p-4 pt-0 pl-16">
                                    <ul className="space-y-4">
                                        {elements.tips.map((tip, idx) => (
                                            <li key={idx} className="text-slate-300 text-sm leading-relaxed flex gap-3">
                                                <span className="text-yellow-500 mt-1">•</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary */}
                    {elements.summaries.length > 0 && (
                        <div className={`rounded-xl overflow-hidden transition-all duration-300 ${readMode ? 'bg-transparent' : 'bg-slate-900 border border-slate-800'
                            }`}>
                            <button
                                onClick={() => toggleSection('summary')}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <BookOpen size={20} />
                                    </div>
                                    <h3 className="font-bold text-slate-200">Chapter Summary</h3>
                                </div>
                                {!readMode && (
                                    expandedSections['summary'] ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />
                                )}
                            </button>

                            {(readMode || expandedSections['summary']) && (
                                <div className="p-4 pt-0 pl-16 space-y-4 text-slate-300 text-sm leading-relaxed">
                                    {elements.summaries.map((summary, idx) => (
                                        <p key={idx}>{summary}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column (Key Concepts) */}
                <div className={readMode ? "space-y-8 mt-12" : "lg:col-span-5 space-y-6"}>
                    {elements.studyEssentials.length > 0 && (
                        <div className={`rounded-xl overflow-hidden ${readMode ? 'bg-slate-800/50 p-8' : 'bg-slate-900 border border-slate-800'
                            }`}>
                            <div className="p-4 flex items-center gap-3 border-b border-slate-800/50">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                    <Key size={20} />
                                </div>
                                <h3 className="font-bold text-slate-200">Key Concepts</h3>
                            </div>

                            <div className="p-4 space-y-3">
                                {elements.studyEssentials.map((essential, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-slate-950 rounded border border-slate-800 text-sm text-slate-400 hover:text-slate-200 hover:border-emerald-500/30 transition-colors"
                                    >
                                        {essential}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
