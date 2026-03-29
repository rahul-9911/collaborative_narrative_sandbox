import React from 'react';
import { Sparkles, Map, Fingerprint, GitBranch, Wand2, ChevronRight, Play } from 'lucide-react';

const QuestView = ({ 
  currentStory, 
  storyPath, 
  loading, 
  handleChoice, 
  handleManualFork, 
  customInput, 
  setCustomInput, 
  setView 
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-32 pb-64">
      <div className="flex justify-center">
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-full px-6 py-2 flex items-center gap-3 text-amber-500/60 font-black text-[9px] uppercase tracking-widest animate-reveal">
          <Fingerprint className="w-4 h-4" /> Active Drafting Session
        </div>
      </div>

      {storyPath.map((chapter, index) => (
        <div key={chapter.id} className="animate-sf-reveal">
          <div className="flex items-center gap-6 mb-16 opacity-20 group">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/40"></div>
            <span className="text-[9px] uppercase tracking-[0.6em] font-black">Timeline Arc {index + 1}</span>
            <button onClick={() => handleManualFork(chapter)} title="Fork Timeline" className="p-3 hover:bg-white/10 rounded-2xl text-stone-500 hover:text-amber-500 transition-all">
              <GitBranch className="w-5 h-5" />
            </button>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/40"></div>
          </div>
          
          <h2 className="text-6xl font-black text-white mb-16 tracking-tighter italic glow-text">{chapter.title}</h2>
          
          <div className="space-y-24">
            {(chapter.scenes && chapter.scenes.length > 0) ? (
              chapter.scenes.map((scene, sIdx) => (
                <div key={scene.id || sIdx} className="relative pl-12 border-l border-white/5 animate-sf-reveal group">
                  <div className="absolute -left-3 top-0 bg-black py-1 text-[8px] font-black text-stone-700 uppercase tracking-[0.2em] transition-all group-hover:text-amber-500">
                    Page {sIdx + 1}
                  </div>
                  <div className="space-y-10 text-2xl leading-[1.9] text-stone-400 font-serif">
                    {scene.content.split('\n\n').map((para, pIdx) => <p key={pIdx}>{para}</p>)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-2xl leading-[1.9] text-stone-400 font-serif">
                {(chapter.content || '').split('\n\n').map((para, i) => <p key={i} className="animate-reveal mb-8">{para}</p>)}
              </div>
            )}
          </div>
        </div>
      ))}

      {loading ? (
        <div className="flex flex-col items-center gap-8 py-32">
          <div className="relative">
            <Wand2 className="w-12 h-12 text-amber-500 animate-pulse" />
            <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 animate-pulse"></div>
          </div>
          <p className="text-stone-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Drafting Prose...</p>
        </div>
      ) : (
        <div className="mt-48 space-y-8 animate-sf-reveal">
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
  );
};

export default QuestView;
