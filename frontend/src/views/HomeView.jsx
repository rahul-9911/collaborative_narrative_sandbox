import React from 'react';
import { PenTool, ScrollText, Layers } from 'lucide-react';

const HomeView = ({ setView }) => {
  return (
    <div className="max-w-5xl mx-auto py-12 animate-sf-reveal">
      <div className="text-center mb-20">
        <div className="inline-block bg-amber-500/10 border border-amber-500/20 px-4 py-1 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
          The GitHub for Interactive Literature
        </div>
        <h1 className="text-8xl font-black text-white tracking-tighter uppercase italic mb-8 leading-[0.9]">
          Write. Branch. <br/> <span className="text-amber-500 glow-text">Publish.</span>
        </h1>
        <p className="text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12">
          StoryForge is a professional collaborative authoring tool. Use the power of AI to expand your prose, fork narrative timelines like code, and prepare your multiverse for professional publication.
        </p>
        <div className="flex justify-center gap-6">
          <button onClick={() => setView('architect')} className="sf-button-primary scale-110">Start a New Story</button>
          <button onClick={() => setView('library')} className="px-10 py-4 border border-white/10 rounded-2xl text-white font-black uppercase tracking-tighter hover:bg-white/5 transition-all">Browse Library</button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="sf-card p-10 group">
          <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-8 border border-amber-500/20 group-hover:bg-amber-500 transition-all">
            <PenTool className="w-6 h-6 text-amber-500 group-hover:text-black" />
          </div>
          <h3 className="text-xl font-black text-white uppercase mb-4 italic">Narrative Design</h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">Build the "World Bible." Define genre, tone, and plot constraints to ensure the AI drafting engine remains consistent.</p>
        </div>
        <div className="sf-card p-10 group">
          <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-8 border border-amber-500/20 group-hover:bg-amber-500 transition-all">
            <ScrollText className="w-6 h-6 text-amber-500 group-hover:text-black" />
          </div>
          <h3 className="text-xl font-black text-white uppercase mb-4 italic">Drafting Engine</h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">Collaborate with AI to write high-fidelity prose. Control the pace from a single paragraph to a full chapter conclusion.</p>
        </div>
        <div className="sf-card p-10 group">
          <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-8 border border-amber-500/20 group-hover:bg-amber-500 transition-all">
            <Layers className="w-6 h-6 text-amber-500 group-hover:text-black" />
          </div>
          <h3 className="text-xl font-black text-white uppercase mb-4 italic">Version Control</h3>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">Every decision is a branch. Use the Timeline Map to navigate through different versions of your story without losing data.</p>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
