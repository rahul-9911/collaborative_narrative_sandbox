import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useNarrative } from '../../context/NarrativeContext';

const NavigationStrip = () => {
  const navigate = useNavigate();
  const { currentStory, adjacent, isSwitcherOpen, setIsSwitcherOpen } = useNarrative();

  if (!adjacent) return null;

  return (
    <nav className="h-14 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center">
      <div className="max-w-3xl mx-auto w-full flex justify-between items-center px-6">
        <button 
          onClick={() => adjacent.prev && navigate(`/world/${currentStory.slug}/arc/${adjacent.prev}`)}
          disabled={!adjacent.prev}
          className="p-2 hover:bg-white/10 rounded-xl text-white transition-all disabled:opacity-5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-500/40">ARC</span>
          <h2 className="text-xs font-black text-stone-200 uppercase tracking-tighter truncate max-w-[200px]">{adjacent.current?.title || 'Loading...'}</h2>
        </div>

        <div className="flex items-center gap-4">
          {adjacent.next.length > 1 ? (
            <div className="relative">
              <button 
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className={`p-2 hover:bg-white/10 rounded-xl text-white transition-all flex items-center gap-2 ${isSwitcherOpen ? 'bg-white/10' : 'bg-amber-500/10'}`}
              >
                <GitBranch className="w-4 h-4 text-amber-500" />
                <ChevronDown className="w-3 h-3" />
              </button>
              {isSwitcherOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                  <div className="max-h-64 overflow-y-auto">
                    {adjacent.next.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => { navigate(`/world/${currentStory.slug}/arc/${branch.id}`); setIsSwitcherOpen(false); }}
                        className="w-full text-left p-4 hover:bg-white/5 transition-all group border-b border-white/5 last:border-none"
                      >
                        <div className="text-[8px] font-black uppercase text-amber-500/40 mb-1 group-hover:text-amber-500">Jump to Path</div>
                        <div className="text-xs font-bold text-stone-300 group-hover:text-white truncate">{branch.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => adjacent.next.length === 1 && navigate(`/world/${currentStory.slug}/arc/${adjacent.next[0].id}`)}
              disabled={adjacent.next.length === 0}
              className="p-2 hover:bg-white/10 rounded-xl text-white transition-all disabled:opacity-5"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationStrip;
