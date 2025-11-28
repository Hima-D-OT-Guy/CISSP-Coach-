import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningCardProps {
    content: string;
}

const WarningCard: React.FC<WarningCardProps> = ({ content }) => {
    return (
        <div className="my-6 rounded-xl overflow-hidden border border-red-500/30 bg-red-950/60 backdrop-blur-sm shadow-lg shadow-red-900/20">
            <div className="p-4 flex items-start gap-4">
                <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Common Pitfall</h4>
                    <p className="text-red-100 text-sm leading-relaxed">{content}</p>
                </div>
            </div>
        </div>
    );
};

export default WarningCard;
