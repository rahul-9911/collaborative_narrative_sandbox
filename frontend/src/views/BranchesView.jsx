import React from 'react';
import { Plus, GitBranch, RefreshCw, ChevronRight, Play, CornerDownRight } from 'lucide-react';

const BranchesView = ({ 
  currentStory, 
  allChapters = [], 
  startQuestAtNode, 
  forkingNode, 
  setForkingNode, 
  prepareFork, 
  loading, 
  forkChoices = [], 
  handleChoice, 
  customInput, 
  setCustomInput 
}) => {

  // Integrity Guard
  if (!allChapters) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <RefreshCw className="w-12 h-12 text-stone-800 animate-spin" />
        <p className="text-stone-500 font-black uppercase tracking-widest text-[10px]">Accessing Timelines...</p>
      </div>
    );
  }

  const renderTreeVertical = (parentId = null, depth = 0) => {
    if (depth > 20) return null; // Safety depth
    const children = allChapters.filter(c => c?.parent_id === parentId);
    if (children.length === 0) return null;
    return (
      <div className="flex flex-col items-center">
        {depth > 0 && <div className="w-[1px] h-12 bg-white/10"></div>}
        <div className="flex gap-8 items-start">
          {children.map((chapter, idx) => (
            <div key={chapter?.id || idx} className="flex flex-col items-center">
              {children.length > 1 && (
                <div className="w-full flex h-6">
                  <div className={`flex-1 ${idx === 0 ? '' : 'border-t border-white/10'}`}></div>
                  <div className="w-[1px] border-t border-white/10"></div>
                  <div className={`flex-1 ${idx === children.length - 1 ? '' : 'border-t border-white/10'}`}></div>
                </div>
              )}
              
              <div className="relative group">
                <button 
                  onClick={() => startQuestAtNode(currentStory, chapter)} 
                  disabled={loading}
                  className={`mt-2 p-5 bg-white/5 border rounded-2xl shadow-2xl transition-all min-w-[180px] text-center
                    ${forkingNode?.id === chapter?.id ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/30'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="text-[9px] uppercase tracking-widest text-amber-500/50 font-black mb-2">Arc {depth + 1}</div>
                  <div className="text-xs font-black text-white truncate max-w-[150px] uppercase tracking-tighter">
                    {loading ? 'RECONSTRUCTING...' : (chapter?.title || 'Untitled Arc')}
                  </div>
                </button>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); prepareFork(chapter); }}
                  disabled={loading}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 bg-black border border-white/10 p-2 rounded-xl text-stone-500 hover:text-amber-500 hover:border-amber-500/50 transition-all opacity-0 group-hover:opacity-100 shadow-xl disabled:opacity-0"
                  title="Branch Narrative"
                >
                  <GitBranch className="w-4 h-4" />
                </button>
              </div>
              {renderTreeVertical(chapter?.id, depth + 1)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full animate-sf-reveal text-center pb-40">
      <div className="mb-20">
        <h2 className="text-7xl font-black text-white tracking-tighter mb-6 uppercase italic">{currentStory?.title || 'World Map'}</h2>
        <p className="text-stone-600 font-black uppercase tracking-[0.4em] text-[10px] mb-12">Select a point in the timeline to inhabit</p>
      </div>
      
      <div className="inline-block min-w-full p-16 bg-white/[0.02] rounded-[5rem] border border-white/5 shadow-inner">
        {renderTreeVertical()}
      </div>

      {forkingNode && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-12">
          <div className="max-w-3xl w-full animate-sf-reveal">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <GitBranch className="w-8 h-8 text-amber-500" />
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">New Branch</h2>
              </div>
              <button onClick={() => setForkingNode(null)} className="text-stone-500 hover:text-white font-black uppercase text-xs tracking-widest">Cancel</button>
            </div>

            <div className="sf-card p-12 mb-12 border-amber-500/20 bg-amber-500/[0.02]">
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-amber-500/40 mb-8 italic">Origin Point: {forkingNode.title}</p>
              <div className="text-xl text-stone-400 font-serif leading-relaxed line-clamp-4 italic opacity-60 text-left">
                {(() => {
                  const lastScene = (forkingNode.scenes || []).slice(-1)[0];
                  const content = lastScene?.content || forkingNode.content || '';
                  return content.length > 300 ? `...${content.substring(content.length - 300)}` : content;
                })()}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-600">Drawing Possibilities...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-700 mb-8">Choose New Narrative Path</p>
                {forkChoices?.map((choice, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleChoice(choice, forkingNode)} 
                    className="w-full text-left p-6 sf-card hover:border-amber-500/50 group flex items-center justify-between"
                  >
                    <span className="text-lg font-bold text-stone-300 group-hover:text-white">{choice}</span>
                    <ChevronRight className="w-5 h-5 text-stone-700 group-hover:text-amber-500" />
                  </button>
                ))}
                
                <div className="relative mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 flex flex-col gap-4">
                  <textarea 
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Lead the narrative yourself..." 
                    className="w-full bg-transparent border-none outline-none text-xl font-serif min-h-[120px] resize-none p-4 text-white"
                  />
                  <div className="flex justify-end p-2">
                    <button 
                      onClick={() => { if (customInput) handleChoice(customInput, forkingNode); }} 
                      className="bg-white text-black p-4 rounded-2xl hover:bg-amber-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-xl"
                    >
                      Execute <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesView;
