import React from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

interface ExamTipCardProps {
    content: string;
}

const ExamTipCard: React.FC<ExamTipCardProps> = ({ content }) => {
    // Content is likely a list of bullets
    const tips = content.split('\n').filter(line => line.trim().length > 0).map(line => line.replace(/^-\s*/, '').trim());

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-indigo-500/30 bg-indigo-950/60 backdrop-blur-sm shadow-lg shadow-indigo-900/20">
            <div className="bg-indigo-900/50 px-5 py-3 border-b border-indigo-500/20 flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-indigo-300" />
                </div>
                <h3 className="font-bold text-indigo-50 text-lg">Exam Tips</h3>
            </div>

            <div className="p-5">
                <ul className="space-y-3">
                    {tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-indigo-100">
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExamTipCard;
