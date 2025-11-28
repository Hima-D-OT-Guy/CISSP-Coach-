import React from 'react';
import { ChapterElements } from '../types';

interface TopicExplainerProps {
    elements: ChapterElements;
    chapterTitle: string;
}

export const TopicExplainer: React.FC<TopicExplainerProps> = ({ elements, chapterTitle }) => {
    const hasContent = elements.tips.length > 0 || elements.summaries.length > 0 || elements.studyEssentials.length > 0;

    if (!hasContent) {
        return <div className="p-6 text-gray-500">No additional study elements found for this chapter.</div>;
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Study Essentials: {chapterTitle}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Tips & Summaries */}
                <div className="space-y-6">
                    {elements.tips.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-md shadow-sm">
                            <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center">
                                <span className="text-xl mr-2">💡</span> Exam Tips
                            </h3>
                            <ul className="space-y-3">
                                {elements.tips.map((tip, idx) => (
                                    <li key={idx} className="text-gray-700 dark:text-gray-300 text-sm">
                                        • {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {elements.summaries.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 rounded-r-md shadow-sm">
                            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-3">
                                📝 Chapter Summary
                            </h3>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
                                {elements.summaries.map((summary, idx) => (
                                    <p key={idx}>{summary}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Study Essentials */}
                <div className="space-y-6">
                    {elements.studyEssentials.length > 0 && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-6 shadow-md">
                            <h3 className="text-lg font-bold text-indigo-800 dark:text-indigo-200 mb-4 flex items-center">
                                <span className="text-xl mr-2">🔑</span> Key Concepts
                            </h3>
                            <div className="space-y-4">
                                {elements.studyEssentials.map((essential, idx) => (
                                    <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded border border-indigo-100 dark:border-indigo-900/50 text-sm text-gray-700 dark:text-gray-300 shadow-sm">
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
