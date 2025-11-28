import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  GraduationCap,
  ShieldCheck,
  Menu,
  X,
  List,
  BarChart2,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  PlayCircle,
  Shield,
  Settings
} from 'lucide-react';
import { DomainStats, TeachingMode, TOCItem, TopicStatus } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

interface SidebarProps {
  stats: DomainStats[];
  toc?: TOCItem[];
  currentMode: TeachingMode;
  tokenCount?: number;
  onModeChange: (mode: TeachingMode) => void;
  onTopicClick?: (topicId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onResetCredentials?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ stats, toc, currentMode, tokenCount, onModeChange, onTopicClick, isOpen, onClose, onResetCredentials }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'content'>('content');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggleTopic = (id: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTopics(newExpanded);
  };

  const getMasteryColor = (score: number) => {
    if (score < 30) return '#ef4444'; // red-500
    if (score < 70) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const navItems = [
    { mode: TeachingMode.GUIDED, icon: BookOpen, label: 'Guided Course' },
    { mode: TeachingMode.DEEP_DIVE, icon: Target, label: 'Deep Dive' },
    { mode: TeachingMode.EXAM_PRACTICE, icon: GraduationCap, label: 'Exam Practice' },
  ];

  const renderTOCItem = (item: TOCItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedTopics.has(item.id);

    let StatusIcon = Circle;
    let statusColor = "text-slate-600";

    if (item.status === 'completed') {
      StatusIcon = CheckCircle2;
      statusColor = "text-emerald-500";
    } else if (item.status === 'in_progress') {
      StatusIcon = PlayCircle;
      statusColor = "text-indigo-400";
    }

    return (
      <div key={item.id} className="ml-2">
        <div
          className={`
            flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors
            ${item.status === 'in_progress' ? 'bg-slate-800' : 'hover:bg-slate-800/50'}
          `}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleTopic(item.id);
            if (onTopicClick) onTopicClick(item.id);
          }}
        >
          {hasChildren ? (
            <button onClick={(e) => { e.stopPropagation(); toggleTopic(item.id); }}>
              {isExpanded ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
            </button>
          ) : <span className="w-3.5" />}

          <StatusIcon size={14} className={statusColor} />

          <span className={`text-sm ${item.status === 'in_progress' ? 'text-white font-medium' : 'text-slate-300'}`}>
            {item.title}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-slate-800 pl-1 mt-1 space-y-1">
            {item.children!.map(child => renderTOCItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        w-80 bg-slate-900 border-r border-slate-700 text-slate-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">CISSP Coach</h1>
              {tokenCount && (
                <p className="text-xs text-slate-400 font-mono">
                  ~{(tokenCount / 1000).toFixed(1)}k tokens
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
              ${activeTab === 'content' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <List size={16} />
            Content
            {activeTab === 'content' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative
              ${activeTab === 'stats' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}
            `}
          >
            <BarChart2 size={16} />
            Progress
            {activeTab === 'stats' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
          </button>
        </div>

        {/* Navigation Modes */}
        <div className="p-4 space-y-2 border-b border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => {
                onModeChange(item.mode);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-xs font-medium
                ${currentMode === item.mode
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'content' ? (
            <div className="p-4">
              {toc ? (
                <div className="space-y-1">
                  {toc.map(item => renderTOCItem(item))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <p>No content loaded.</p>
                  <p className="text-xs mt-2">Upload a study guide to generate a Table of Contents.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Domain Mastery</p>

              <div className="h-40 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats}>
                    <XAxis dataKey="id" hide />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px' }}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getMasteryColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.id} className="group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-medium text-slate-300 truncate w-3/4" title={stat.name}>
                        {stat.id.toUpperCase()}: {stat.name}
                      </span>
                      <span className="text-xs font-bold" style={{ color: getMasteryColor(stat.score) }}>
                        {stat.score}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${stat.score}%`,
                          backgroundColor: getMasteryColor(stat.score)
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-3">
          {onResetCredentials && (
            <button
              onClick={onResetCredentials}
              className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-lg transition-colors"
            >
              <Settings size={14} />
              Settings / Reset Key
            </button>
          )}
          <div className="text-xs text-slate-500 text-center">
            Powered by Google Gemini 2.5 Flash
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;