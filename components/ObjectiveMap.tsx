import React from 'react';
import { Shield, Lock, Server, Globe, Users, FileSearch, Activity, Code } from 'lucide-react';
import { ObjectiveMapItem } from '../types';

interface ObjectiveMapProps {
    mapData: ObjectiveMapItem[];
    onDomainSelect: (domainId: string) => void;
}

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
    "1": <Shield className="w-6 h-6" />,
    "2": <Lock className="w-6 h-6" />,
    "3": <Server className="w-6 h-6" />,
    "4": <Globe className="w-6 h-6" />,
    "5": <Users className="w-6 h-6" />,
    "6": <FileSearch className="w-6 h-6" />,
    "7": <Activity className="w-6 h-6" />,
    "8": <Code className="w-6 h-6" />,
};

const ObjectiveMap: React.FC<ObjectiveMapProps> = ({ mapData, onDomainSelect }) => {
    // Group objectives by Domain ID (e.g., "1.1", "1.2" -> Domain "1")
    const domains = React.useMemo(() => {
        const groups: Record<string, { title: string, objectives: ObjectiveMapItem[] }> = {};

        mapData.forEach(item => {
            const domainId = item.domainId.split('.')[0]; // "1.2" -> "1"
            if (!groups[domainId]) {
                groups[domainId] = {
                    title: `Domain ${domainId}`, // Placeholder, real titles are in constants or could be passed
                    objectives: []
                };
            }
            groups[domainId].objectives.push(item);
        });
        return groups;
    }, [mapData]);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Shield className="text-emerald-500" />
                CISSP Objective Map
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(domains).map(([id, data]) => (
                    <div
                        key={id}
                        onClick={() => onDomainSelect(id)}
                        className="group relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-emerald-500 group-hover:scale-110 transition-transform">
                                {DOMAIN_ICONS[id] || <Shield />}
                            </div>
                            <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                {data.objectives.length} Objectives
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors">
                            Domain {id}
                        </h3>

                        <div className="space-y-2">
                            {data.objectives.slice(0, 2).map(obj => (
                                <div key={obj.domainId} className="text-xs text-slate-400 truncate flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                    {obj.description}
                                </div>
                            ))}
                            {data.objectives.length > 2 && (
                                <div className="text-xs text-slate-600 italic pl-3">
                                    + {data.objectives.length - 2} more...
                                </div>
                            )}
                        </div>

                        {/* Progress Bar (Mock for now) */}
                        <div className="mt-4 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-0 group-hover:w-1/3 transition-all duration-1000" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ObjectiveMap;
