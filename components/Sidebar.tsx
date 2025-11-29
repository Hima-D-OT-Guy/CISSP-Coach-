import React, { useState, useMemo } from 'react';
import {
  Book,
  ChevronRight,
  ChevronDown,
  Shield,
  Menu,
  X,
  CheckCircle,
  Circle,
  LayoutDashboard,
  GraduationCap
} from 'lucide-react';
import { TOCItem, DomainStats, TeachingMode, ObjectiveMapItem } from '../types';

interface SidebarProps {
  stats: DomainStats[];
  toc: TOCItem[];
  currentMode: TeachingMode;
  tokenCount?: number;
  onModeChange: (mode: TeachingMode) => void;
  onTopicClick: (topicId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onResetCredentials: () => void;
  objectiveMap?: ObjectiveMapItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  stats,
  toc,
  currentMode,
  tokenCount,
  onModeChange,
  onTopicClick,
  isOpen,
  onClose,
  onResetCredentials,
  objectiveMap
}) => {
  const [expandedDomains, setExpandedDomains] = useState<Record<string, boolean>>({});

  const toggleDomain = (domainId: string) => {
    setExpandedDomains(prev => ({ ...prev, [domainId]: !prev[domainId] }));
  };

  // Group Chapters by Domain
  const domainGroups = useMemo(() => {
    // Default structure if no map
    const groups: Record<string, { title: string, chapters: TOCItem[] }> = {};

    // Initialize 8 Domains
    for (let i = 1; i <= 8; i++) {
      groups[i.toString()] = { title: `Domain ${i}`, chapters: [] };
    }
    groups["Other"] = { title: "Appendices & Others", chapters: [] };

    // Map chapters to domains based on Objective Map or heuristics
    if (objectiveMap && objectiveMap.length > 0) {
      // Create a mapping of Chapter Number -> Domain ID
      const chapterToDomain: Record<number, string> = {};
      objectiveMap.forEach(obj => {
        const domainId = obj.domainId.split('.')[0];
        obj.chapters.forEach(chNum => {
          // Assign to first domain found (simplification)
          if (!chapterToDomain[chNum]) chapterToDomain[chNum] = domainId;
        });
      });

      toc.forEach(chapter => {
        // Extract chapter number from ID "chapter_1" -> 1
        const match = chapter.id.match(/chapter_(\d+)/);
        if (match) {
          const chNum = parseInt(match[1]);
          const domainId = chapterToDomain[chNum] || "Other";
          if (!groups[domainId]) groups[domainId] = { title: `Domain ${domainId}`, chapters: [] };
          groups[domainId].chapters.push(chapter);
        } else {
          // Appendices etc
          groups["Other"].chapters.push(chapter);
        }
      });
    } else {
      // Fallback: List all in one group
      groups["1"] = { title: "All Chapters", chapters: toc };
    }

    return groups;
  }, [toc, objectiveMap]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
                fixed top-0 left-0 h-full w-80 bg-slate-950 border-r border-slate-800 
                transform transition-transform duration-300 ease-in-out z-50
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static
            `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-100">
            <Shield className="text-emerald-500 fill-current" />
            <span>CISSP Coach</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(100vh-4rem)] p-4 space-y-6">

          {/* Main Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => onTopicClick('')} // Empty string for Dashboard
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-emerald-400 rounded-lg transition-colors"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button
              onClick={() => onTopicClick('assessment_test')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/50 hover:text-emerald-400 rounded-lg transition-colors"
            >
              <GraduationCap size={18} />
              Assessment Test
            </button>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Domains & Chapters */}
          <div className="space-y-4">
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Study Modules
            </h3>

            {Object.entries(domainGroups).map(([id, group]) => (
              group.chapters.length > 0 && (
                <div key={id} className="space-y-1">
                  <button
                    onClick={() => toggleDomain(id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 group-hover:text-emerald-500 group-hover:bg-slate-800/80 transition-colors">
                        D{id}
                      </span>
                      <span>{group.title}</span>
                    </div>
                    {expandedDomains[id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {expandedDomains[id] && (
                    <div className="pl-4 space-y-1 border-l border-slate-800 ml-3">
                      {group.chapters.map(chapter => (
                        <button
                          key={chapter.id}
                          onClick={() => {
                            onTopicClick(chapter.id);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-500 hover:text-emerald-400 hover:bg-slate-800/30 rounded transition-colors truncate"
                          title={chapter.title}
                        >
                          {chapter.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>

          {/* Footer / Settings */}
          <div className="pt-6 mt-6 border-t border-slate-800">
            <div className="px-3 py-2 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-500 mb-2">Current Mode</div>
              <select
                value={currentMode}
                onChange={(e) => onModeChange(e.target.value as TeachingMode)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2 focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value={TeachingMode.GUIDED}>Guided Course</option>
                <option value={TeachingMode.DEEP_DIVE}>Deep Dive</option>
                <option value={TeachingMode.EXAM_PRACTICE}>Exam Practice</option>
              </select>
            </div>

            <button
              onClick={onResetCredentials}
              className="w-full mt-4 text-xs text-slate-600 hover:text-red-400 transition-colors"
            >
              Reset API Key
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;