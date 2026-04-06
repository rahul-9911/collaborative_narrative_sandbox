import React from 'react';
import { Sparkles, Map, Fingerprint, GitBranch, Wand2, ChevronRight, Play, Lock, PenTool, RefreshCw } from 'lucide-react';

const QuestView = ({ 
  currentStory, 
  storyPath = [], 
  loading, 
  handleChoice, 
  customInput, 
  setCustomInput, 
  setView,
  isReadOnly,
  prepareFork
}) => {
  // Integrity Guard: Show loading state instead of crashing if path is being built
  if (!storyPath || (storyPath.length === 0 && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <RefreshCw className="w-12 h-12 text-stone-800 animate-spin" />
        <p className="text-stone-500 font-black uppercase tracking-widest text-[10px]">Reconstructing Narrative...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-32 pb-64 animate-sf-reveal">
      <div className="flex justify-center">
        {isReadOnly ? (
          <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2 flex items-center gap-3 text-stone-500 font-black text-[9px] uppercase tracking-widest">
            <Lock className="w-4 h-4" /> Narrative Archive (Read Only)
          </div>
        ) : (
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-full px-6 py-2 flex items-center gap-3 text-amber-500/60 font-black text-[9px] uppercase tracking-widest">
            <Fingerprint className="w-4 h-4" /> Active Drafting Session
          </div>
        )}
      </div>

      {storyPath.map((chapter, index) => (
        <div key={chapter?.id || index} className="animate-sf-reveal">
          <div className="flex items-center gap-6 mb-16 opacity-20 group">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/40"></div>
            <span className="text-[9px] uppercase tracking-[0.6em] font-black">Timeline Arc {index + 1}</span>
            {!isReadOnly && (
              <button 
                onClick={() => handleChoice(null, chapter)} 
                className="p-3 hover:bg-white/10 rounded-2xl text-stone-500 hover:text-amber-500 transition-all"
                title="Branch from here"
              >
                <GitBranch className="w-5 h-5" />
              </button>
            )}
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/40"></div>
          </div>
          
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter italic glow-text">
            {chapter?.title || 'Untitled Arc'}
          </h2>
          
          <div className="space-y-24">
            {(chapter?.scenes && chapter.scenes.length > 0) ? (
              chapter.scenes.map((scene, sIdx) => (
                <div key={scene?.id || sIdx} className="relative pl-12 border-l border-white/5 animate-sf-reveal group">
                  <div className="absolute -left-3 top-0 bg-black py-1 text-[8px] font-black text-stone-700 uppercase tracking-[0.2em] transition-all group-hover:text-amber-500">
                    Page {sIdx + 1}
                  </div>
                  <div className="space-y-10 text-2xl leading-[1.9] text-stone-400 font-serif">
                    {(scene?.content || '').split('\n\n').filter(Boolean).map((para, pIdx) => <p key={pIdx}>{para}</p>)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-2xl leading-[1.9] text-stone-400 font-serif">
                {(chapter?.content || '').split('\n\n').filter(Boolean).map((para, i) => <p key={i} className="animate-reveal mb-8">{para}</p>)}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading ? (
        <div className="flex flex-col items-center gap-8 py-32">
          <Wand2 className="w-12 h-12 text-amber-500 animate-pulse" />
          <p className="text-stone-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Drafting Prose...</p>
        </div>
      ) : (
        <div className="mt-48 animate-sf-reveal">
          {isReadOnly ? (
            <div className="text-center space-y-12">
              <div className="flex items-center gap-4 justify-center opacity-30">
                <div className="h-[1px] w-24 bg-white/40"></div>
                <span className="text-[10px] uppercase font-black tracking-widest text-white">End of Recorded Arc</span>
                <div className="h-[1px] w-24 bg-white/40"></div>
              </div>
              
              <div className="sf-card p-16 space-y-8 bg-amber-500/[0.02] border-amber-500/10">
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Forge a Different Path?</h3>
                <p className="text-stone-500 max-w-md mx-auto leading-relaxed text-sm">
                  You are viewing a finalized segment. Continue drafting by creating a new narrative branch.
                </p>
                <button 
                  onClick={() => storyPath.length > 0 && prepareFork(storyPath[storyPath.length - 1])}
                  className="sf-button-primary flex items-center gap-3 mx-auto px-12"
                >
                  <PenTool className="w-5 h-5" /> Start Collaborative Draft
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-12">
                <span className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-700">Collaborative Choices</span>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>
              
              <div className="grid gap-4">
                {storyPath.length > 0 && (storyPath[storyPath.length - 1].choices || []).map((choice, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleChoice(choice)} 
                    className="sf-card p-8 group flex items-center justify-between text-left hover:scale-[1.01]"
                  >
                    <span className="text-xl font-bold text-stone-300 group-hover:text-white transition-colors">{choice}</span>
                    <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-amber-500 transition-all">
                      <ChevronRight className="w-6 h-6 text-stone-600 group-hover:text-black" />
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="relative mt-16 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-2xl transition-all hover:border-white/20">
                <textarea 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Lead the narrative yourself..." 
                  className="w-full bg-transparent border-none outline-none text-2xl font-serif min-h-[160px] resize-none text-white selection:bg-amber-500/30"
                />
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button 
                    onClick={() => { if (customInput) handleChoice(customInput); }} 
                    className="bg-white text-black px-10 py-4 rounded-[1.5rem] hover:bg-amber-500 transition-all flex items-center gap-3 font-black uppercase text-xs tracking-widest active:scale-95 shadow-xl"
                  >
                    Commit to Timeline <Play className="w-5 h-5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestView;
