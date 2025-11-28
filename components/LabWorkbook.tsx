import React, { useState } from 'react';
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

    const handleAnswerChange = (index: number, value: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [index]: value
        }));
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
        return <div className="p-6 text-gray-500">No written labs found for this chapter.</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Written Labs: {chapterTitle}</h2>
            <div className="space-y-8">
                {elements.writtenLabs.map((lab, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Lab {index + 1}</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">{lab.question}</p>

                        <textarea
                            value={userAnswers[index] || ''}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                        />

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => handleGetFeedback(index, lab.question)}
                                disabled={loadingFeedback === index || !userAnswers[index]?.trim()}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loadingFeedback === index ? (
                                    <>
                                        <span className="animate-spin mr-2">⟳</span> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        📝 Evaluate My Answer
                                    </>
                                )}
                            </button>
                        </div>

                        {feedback[index] && (
                            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md animate-fade-in">
                                <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-2">Expert Feedback:</h4>
                                <div className="prose dark:prose-invert text-sm max-w-none">
                                    {feedback[index]}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
