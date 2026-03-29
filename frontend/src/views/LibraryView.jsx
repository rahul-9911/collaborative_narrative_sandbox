import React from 'react';
import { Plus, Wind, ChevronRight } from 'lucide-react';

const LibraryView = ({ stories, setView, loadWorldBranches }) => {
  return (
    <div className="animate-sf-reveal">
      <div className="flex items-center justify-between mb-16">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">The Library</h2>
          <p className="text-stone-600 font-bold uppercase tracking-widest text-[10px] mt-2">Resume a narrative or explore parallel arcs</p>
        </div>
        <button onClick={() => setView('architect')} className="sf-button-primary text-[10px] px-6 py-3">
          <Plus className="w-4 h-4" /> Create New World
        </button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {stories.map(story => (
          <div key={story.id} className="sf-card p-10 group flex flex-col">
            <div className="absolute top-0 right-0 p-8">
              <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:bg-amber-500 transition-all duration-500 group-hover:rotate-12">
                <Wind className="w-5 h-5 text-stone-600 group-hover:text-black" />
              </div>
            </div>
            <div className="mb-8">
              <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/20">
                {story.metadata?.genre}
              </span>
              <h3 className="text-3xl font-black text-white mt-4 tracking-tighter leading-tight group-hover:text-amber-500 transition-colors">
                {story.title}
              </h3>
            </div>
            <p className="text-stone-500 text-sm italic mb-12 line-clamp-3 leading-relaxed font-serif">
              {story.description}
            </p>
            <button 
              onClick={() => loadWorldBranches(story)} 
              className="mt-auto sf-button-primary w-full flex items-center justify-center gap-3"
            >
              Access Timeline <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;
