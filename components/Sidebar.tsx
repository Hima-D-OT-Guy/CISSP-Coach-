import React from 'react';
import { 
  BookOpen, 
  Target, 
  GraduationCap, 
  ShieldCheck, 
  Menu,
  X
} from 'lucide-react';
import { DomainStats, TeachingMode } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

interface SidebarProps {
  stats: DomainStats[];
  currentMode: TeachingMode;
  onModeChange: (mode: TeachingMode) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ stats, currentMode, onModeChange, isOpen, onClose }) => {
  
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
        w-72 bg-slate-900 border-r border-slate-700 text-slate-100 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <div>
              <h1 className="font-bold text-lg leading-tight">CISSP Coach</h1>
              <p className="text-xs text-slate-400">AI Tutor</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Learning Modes</p>
          {navItems.map((item) => (
            <button
              key={item.mode}
              onClick={() => {
                onModeChange(item.mode);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
                ${currentMode === item.mode 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Domain Mastery</p>
          
          <div className="h-40 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats}>
                <XAxis dataKey="id" hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50">
           <div className="text-xs text-slate-500 text-center">
             Powered by Google Gemini 2.5 Flash
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;