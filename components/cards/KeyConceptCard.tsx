import React from 'react';
import { Lightbulb, Target } from 'lucide-react';

interface KeyConceptCardProps {
    content: string;
}

const KeyConceptCard: React.FC<KeyConceptCardProps> = ({ content }) => {
    // Parse content: Expected format "Title: ... \n Summary: ... \n Why it matters: ..."
    const lines = content.split('\n');
    let title = "Key Concept";
    let summary = "";
    let whyItMatters = "";

    let currentSection = "";

    lines.forEach(line => {
        if (line.startsWith("Title:")) {
            title = line.replace("Title:", "").trim();
        } else if (line.startsWith("Summary:")) {
            currentSection = "summary";
            summary += line.replace("Summary:", "").trim();
        } else if (line.startsWith("Why it matters:")) {
            currentSection = "why";
            whyItMatters += line.replace("Why it matters:", "").trim();
        } else {
            if (currentSection === "summary") summary += " " + line.trim();
            if (currentSection === "why") whyItMatters += " " + line.trim();
        }
    });

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-emerald-500/30 bg-emerald-950/60 backdrop-blur-sm shadow-lg shadow-emerald-900/20">
            <div className="bg-emerald-900/50 px-5 py-3 border-b border-emerald-500/20 flex items-center gap-3">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-emerald-300" />
                </div>
                <h3 className="font-bold text-emerald-50 text-lg">{title}</h3>
            </div>

            <div className="p-5 space-y-4">
                <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Summary</h4>
                    <p className="text-slate-100 leading-relaxed text-sm">{summary}</p>
                </div>

                {whyItMatters && (
                    <div className="bg-emerald-900/40 rounded-lg p-3 border border-emerald-500/20">
                        <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-emerald-300 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">Exam Relevance</h4>
                                <p className="text-emerald-100 text-sm italic">{whyItMatters}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeyConceptCard;
