import React from 'react';
import { RefreshCw, PenTool } from 'lucide-react';

const QuestView = ({ 
  currentStory, 
  storyPath = [], 
  loading, 
  prepareFork
}) => {
  if (!storyPath || (storyPath.length === 0 && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-6">
        <RefreshCw className="w-12 h-12 text-stone-800 animate-spin" />
        <p className="text-stone-500 font-black uppercase tracking-widest text-[10px]">Reconstructing Narrative...</p>
      </div>
    );
  }

  const currentChapter = storyPath[storyPath.length - 1];

  return (
    <div className="max-w-3xl mx-auto pb-64 animate-sf-reveal">
      <div className="space-y-32">
        {(currentChapter?.scenes && currentChapter.scenes.length > 0) ? (
          currentChapter.scenes.map((scene, sIdx) => (
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
            {(currentChapter?.content || '').split('\n\n').filter(Boolean).map((para, i) => <p key={i} className="animate-reveal mb-8">{para}</p>)}
          </div>
        )}
      </div>

      <div className="mt-48 animate-sf-reveal">
        <div className="text-center space-y-12">
          <div className="flex items-center gap-4 justify-center opacity-30">
            <div className="h-[1px] w-24 bg-white/40"></div>
            <span className="text-[10px] uppercase font-black tracking-widest text-white">Narrative Junction</span>
            <div className="h-[1px] w-24 bg-white/40"></div>
          </div>
          
          <div className="sf-card p-16 space-y-8 bg-amber-500/[0.02] border-amber-500/10">
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Forge the Next Chapter?</h3>
            <p className="text-stone-500 max-w-md mx-auto leading-relaxed text-sm">
              Collaborate with the engine to expand this timeline or explore a different narrative path.
            </p>
            <button 
              onClick={() => storyPath.length > 0 && prepareFork(storyPath[storyPath.length - 1])}
              className="sf-button-primary flex items-center gap-3 mx-auto px-12"
            >
              <PenTool className="w-5 h-5" /> Forge New Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestView;
