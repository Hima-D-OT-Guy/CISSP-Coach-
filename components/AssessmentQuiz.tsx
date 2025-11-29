import React, { useState } from 'react';
import {
    CheckCircle,
    XCircle,
    ArrowRight,
    RotateCcw,
    Award,
    AlertCircle,
    HelpCircle
} from 'lucide-react';
import { AssessmentTest, QuizQuestion } from '../types';

interface AssessmentQuizProps {
    test: AssessmentTest;
}

const AssessmentQuiz: React.FC<AssessmentQuizProps> = ({ test }) => {
    const [started, setStarted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [answers, setAnswers] = useState<Record<number, boolean>>({}); // Index -> Correct/Incorrect

    const currentQuestion = test.questions[currentQuestionIndex];
    const totalQuestions = test.questions.length;

    const handleStart = () => {
        setStarted(true);
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowResults(false);
        setAnswers({});
    };

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return;

        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        if (isCorrect) setScore(prev => prev + 1);

        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: isCorrect }));
        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
        }
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 80) return 'text-emerald-500';
        if (percentage >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    if (!started) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="p-6 bg-emerald-500/10 rounded-full">
                    <Award className="w-16 h-16 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">{test.title}</h2>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Test your knowledge with {totalQuestions} practice questions designed to simulate the CISSP exam experience.
                    </p>
                </div>
                <button
                    onClick={handleStart}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                >
                    Start Assessment <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    if (showResults) {
        const percentage = Math.round((score / totalQuestions) * 100);

        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative">
                    <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-slate-800"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - percentage / 100)}
                            className={getScoreColor(percentage)}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</span>
                        <span className="text-slate-400 text-sm mt-1">Score</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-100">Assessment Complete!</h3>
                    <p className="text-slate-400">
                        You answered {score} out of {totalQuestions} questions correctly.
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleStart}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={18} /> Retake Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 h-full flex flex-col">
            {/* Header / Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4 text-sm text-slate-400">
                    <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                    <span>Score: {score}</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="flex-1 flex flex-col">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mb-6">
                    <h3 className="text-xl font-medium text-slate-100 leading-relaxed mb-8">
                        {currentQuestion.question}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => {
                            let optionClass = "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50";
                            let icon = <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-slate-400" />;

                            if (isAnswered) {
                                if (idx === currentQuestion.correctAnswer) {
                                    optionClass = "border-emerald-500 bg-emerald-500/10 text-emerald-400";
                                    icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
                                } else if (idx === selectedOption) {
                                    optionClass = "border-red-500 bg-red-500/10 text-red-400";
                                    icon = <XCircle className="w-5 h-5 text-red-500" />;
                                } else {
                                    optionClass = "border-slate-800 opacity-50";
                                }
                            } else if (selectedOption === idx) {
                                optionClass = "border-emerald-500 bg-emerald-500/5 text-emerald-400";
                                icon = <div className="w-5 h-5 rounded-full border-2 border-emerald-500 bg-emerald-500" />;
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={isAnswered}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ${optionClass}`}
                                >
                                    <div className="flex-shrink-0">{icon}</div>
                                    <span className="text-base">{option}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Feedback & Controls */}
                <div className="min-h-[100px]">
                    {isAnswered ? (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className={`p-4 rounded-lg mb-4 flex items-start gap-3 ${selectedOption === currentQuestion.correctAnswer
                                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                                    : 'bg-red-500/10 border border-red-500/20'
                                }`}>
                                {selectedOption === currentQuestion.correctAnswer
                                    ? <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                                    : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                }
                                <div>
                                    <p className={`font-semibold mb-1 ${selectedOption === currentQuestion.correctAnswer ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                        {selectedOption === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                                    </p>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {currentQuestion.explanation}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleNext}
                                className="w-full py-3 bg-slate-100 hover:bg-white text-slate-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
                            >
                                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'View Results'} <ArrowRight size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={selectedOption === null}
                            className={`w-full py-3 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${selectedOption !== null
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            Check Answer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export { AssessmentQuiz };
