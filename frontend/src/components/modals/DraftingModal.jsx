import React from 'react';
import { GitBranch, RefreshCw, Layers, Play, X } from 'lucide-react';
import { useNarrative } from '../../context/NarrativeContext';

const DraftingModal = () => {
  const { 
    forkingNode, forkChoices, loading, customInput, setCustomInput, 
    selectedModalChoice, setSelectedModalChoice, modalPacing, setModalPacing,
    cancelDrafting, handleChoice
  } = useNarrative();

  if (!forkingNode) return null;

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-[#0a0a0a] border border-white/10 rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-sf-reveal">
        
        {/* Modal Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <GitBranch className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Forge New Path</h2>
          </div>
          <button onClick={cancelDrafting} disabled={loading} className={`p-3 hover:bg-white/5 rounded-full text-stone-500 transition-all ${loading ? 'opacity-30 cursor-not-allowed' : 'hover:text-white'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <div className="flex items-center gap-4 text-amber-500/40">
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Origin Point</span>
            <div className="h-[1px] flex-1 bg-amber-500/10"></div>
            <span className="text-[10px] font-bold italic truncate max-w-[200px]">{forkingNode.title}</span>
          </div>

          {loading ? (
            <div className="py-24 space-y-12">
              <div className="flex flex-col items-center gap-6">
                <RefreshCw className="w-16 h-16 text-amber-500 animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.4em] text-amber-500 animate-pulse">Drafting Multiverse...</p>
                <p className="text-xs text-stone-500 max-w-sm text-center">The engine is weaving the next thread. This process takes a moment...</p>
              </div>
              <div className="ghost-prose max-w-xl mx-auto opacity-20">
                <div className="ghost-line w-[90%]" style={{ animationDelay: '0.1s' }}></div>
                <div className="ghost-line w-[95%]" style={{ animationDelay: '0.2s' }}></div>
                <div className="ghost-line w-[85%]" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {forkChoices?.map((choice, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setSelectedModalChoice(choice); setCustomInput(''); }} 
                    className={`w-full text-left p-6 sf-card transition-all group
                      ${selectedModalChoice === choice ? 'border-amber-500/60 bg-amber-500/[0.08] scale-[1.01]' : 'hover:border-white/10'}
                    `}
                  >
                    <span className={`text-sm font-bold transition-colors ${selectedModalChoice === choice ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'}`}>{choice}</span>
                  </button>
                ))}
              </div>
              
              <div 
                className={`relative mt-4 border rounded-[2rem] p-4 transition-all shadow-2xl
                  ${!selectedModalChoice ? 'border-amber-500/60 bg-amber-500/[0.08] scale-[1.01]' : 'border-white/5 bg-white/[0.02] hover:border-white/10'}
                `}
              >
                <textarea 
                  value={customInput}
                  onFocus={() => setSelectedModalChoice(null)}
                  onChange={(e) => { setCustomInput(e.target.value); setSelectedModalChoice(null); }}
                  placeholder="Lead the narrative yourself..." 
                  className="w-full bg-transparent border-none outline-none text-lg font-serif min-h-[100px] resize-none p-2 text-white placeholder:text-stone-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Modal Footer */}
        <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-black/60 p-2 px-6 rounded-2xl border border-white/5 shadow-inner">
            <div className="flex items-center gap-3 text-amber-500/40">
              <Layers className="w-4 h-4" />
              <span className="text-[8px] font-black uppercase tracking-widest">Pacing</span>
            </div>
            <select 
              value={modalPacing}
              onChange={(e) => setModalPacing(parseInt(e.target.value))}
              className="bg-transparent text-white font-black text-xs p-1 outline-none cursor-pointer hover:text-amber-500 transition-colors"
            >
              <option value="0" disabled>Pages</option>
              {[1,2,3,4].map(n => (
                <option key={n} value={n} className="bg-[#0a0a0a]">{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-8">
            <button onClick={cancelDrafting} disabled={loading} className={`text-[10px] font-black uppercase tracking-widest text-stone-500 transition-all ${loading ? 'opacity-30 cursor-not-allowed' : 'hover:text-white'}`}>
              Discard Draft
            </button>
            <button 
              onClick={() => { if ((selectedModalChoice || customInput) && modalPacing > 0) handleChoice(selectedModalChoice || customInput, forkingNode, modalPacing); }} 
              disabled={(!selectedModalChoice && !customInput) || modalPacing === 0}
              className={`p-5 px-12 rounded-2xl transition-all flex items-center gap-4 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl
                ${(selectedModalChoice || customInput) && modalPacing > 0 
                  ? 'bg-white text-black hover:bg-amber-500 active:scale-95' 
                  : 'bg-white/5 text-stone-800 cursor-not-allowed border border-white/5'}
              `}
            >
              Commit <Play className={`w-4 h-4 fill-current ${modalPacing > 0 && (selectedModalChoice || customInput) ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DraftingModal;
