import React, { useState } from 'react';
import { AssessmentTest, QuizQuestion } from '../types';
import { geminiService } from '../services/geminiService';

interface AssessmentQuizProps {
    test: AssessmentTest;
}

export const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ test }) => {
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
    const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
    const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null);

    const handleAskGemini = async (question: QuizQuestion) => {
        setLoadingExplanation(question.id);
        try {
            const prompt = `
I am taking a CISSP assessment test.
Question: ${question.question}

Please explain the concepts in this question and help me understand the correct answer.
            `.trim();

            const response = await geminiService.sendMessage(prompt);
            setAiExplanations(prev => ({
                ...prev,
                [question.id]: response.text
            }));
        } catch (error) {
            console.error("Failed to get explanation", error);
            setAiExplanations(prev => ({
                ...prev,
                [question.id]: "Failed to load explanation. Please try again."
            }));
        } finally {
            setLoadingExplanation(null);
        }
    };

    const toggleQuestion = (id: string) => {
        if (expandedQuestionId === id) {
            setExpandedQuestionId(null);
        } else {
            setExpandedQuestionId(id);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{test.title}</h2>
            <div className="space-y-4">
                {test.questions.map((q) => (
                    <div key={q.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        <div
                            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex justify-between items-start"
                            onClick={() => toggleQuestion(q.id)}
                        >
                            <div className="flex-1">
                                <span className="font-semibold text-blue-600 dark:text-blue-400 mr-2">Q{q.id.replace('q', '')}.</span>
                                <span className="text-gray-800 dark:text-gray-200">{q.question.split('\n')[0]}</span>
                            </div>
                            <span className="text-gray-400 ml-4">
                                {expandedQuestionId === q.id ? '▲' : '▼'}
                            </span>
                        </div>

                        {expandedQuestionId === q.id && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <div className="mb-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {q.question}
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAskGemini(q);
                                        }}
                                        disabled={loadingExplanation === q.id}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex items-center"
                                    >
                                        {loadingExplanation === q.id ? (
                                            <>
                                                <span className="animate-spin mr-2">⟳</span> Asking Gemini...
                                            </>
                                        ) : (
                                            <>
                                                ✨ Ask Gemini to Explain
                                            </>
                                        )}
                                    </button>
                                </div>

                                {aiExplanations[q.id] && (
                                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-md">
                                        <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2">Gemini Explanation:</h4>
                                        <div className="prose dark:prose-invert text-sm max-w-none">
                                            {aiExplanations[q.id]}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
