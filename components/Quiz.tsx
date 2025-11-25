import React, { useState } from 'react';
import { QuizPayload, QuizQuestion } from '../types';
import { CheckCircle2, XCircle, ChevronRight, AlertCircle, Award } from 'lucide-react';

interface QuizProps {
  data: QuizPayload;
}

const Quiz: React.FC<QuizProps> = ({ data }) => {
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(userAnswers).length < data.questions.length) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) return;
    }
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    data.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / data.questions.length) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden my-4 max-w-3xl">
      {/* Quiz Header */}
      <div className="bg-slate-900 text-white p-6">
        <h3 className="text-xl font-bold mb-2">{data.title}</h3>
        {data.description && <p className="text-slate-300 text-sm">{data.description}</p>}
        {isSubmitted && (
          <div className="mt-4 flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
            <Award className="text-yellow-400" size={24} />
            <div>
              <p className="text-sm text-slate-400 font-medium">Your Score</p>
              <p className="text-2xl font-bold text-white">{calculateScore()}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="p-6 space-y-8">
        {data.questions.map((q, idx) => {
          const isCorrect = userAnswers[q.id] === q.correctIndex;
          const userAnswer = userAnswers[q.id];
          
          return (
            <div key={q.id} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
              <div className="flex gap-3 mb-4">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 text-lg leading-relaxed">{q.question}</h4>
                  <div className="flex gap-2 mt-2">
                    {q.difficulty && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium border
                        ${q.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' : 
                          q.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-red-50 text-red-700 border-red-200'}`}>
                        {q.difficulty.toUpperCase()}
                      </span>
                    )}
                    {q.domain && (
                      <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {q.domain}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIdx) => {
                  let optionClass = "w-full text-left p-3 rounded-lg border transition-all text-sm flex justify-between items-center ";
                  
                  if (!isSubmitted) {
                    optionClass += userAnswer === optIdx 
                      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 text-emerald-900" 
                      : "border-slate-200 hover:bg-slate-50 text-slate-700";
                  } else {
                    // Result state
                    if (optIdx === q.correctIndex) {
                      optionClass += "border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500";
                    } else if (userAnswer === optIdx) {
                      optionClass += "border-red-500 bg-red-50 text-red-800";
                    } else {
                      optionClass += "border-slate-100 text-slate-400 opacity-60";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={isSubmitted}
                      className={optionClass}
                    >
                      <span className="font-medium">{opt}</span>
                      {isSubmitted && optIdx === q.correctIndex && <CheckCircle2 size={18} className="text-green-600" />}
                      {isSubmitted && userAnswer === optIdx && optIdx !== q.correctIndex && <XCircle size={18} className="text-red-500" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {isSubmitted && (
                <div className={`mt-4 ml-9 p-4 rounded-lg text-sm border ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-2 mb-2 font-semibold text-slate-800">
                    <AlertCircle size={16} className="text-slate-500" />
                    Explanation
                  </div>
                  <p className="text-slate-700 leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {!isSubmitted && (
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Submit Quiz
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;