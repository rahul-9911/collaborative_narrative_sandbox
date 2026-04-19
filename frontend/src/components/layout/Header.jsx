import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Library } from 'lucide-react';
import { useNarrative } from '../../context/NarrativeContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentStory } = useNarrative();

  const currentViewTitle = () => {
    const path = location.pathname;
    if (path === '/home' || path === '/') return 'Welcome';
    if (path === '/library') return 'The Library';
    if (path === '/architect') return 'Story Architect';
    if (path.startsWith('/world')) return currentStory?.title || 'World Map';
    return 'StoryForge';
  };

  return (
    <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-black/60 backdrop-blur-2xl shadow-2xl">
      <div className="flex items-center gap-12">
        <button onClick={() => navigate('/home')} className="flex items-center gap-3 group transition-all">
          <div className="bg-amber-500 p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-all">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase italic">StoryForge</h1>
        </button>
      </div>

      <div className="flex-1 flex justify-center">
        {location.pathname.startsWith('/world') && currentStory ? (
          <button 
            onClick={() => navigate(`/world/${currentStory.slug}`)}
            className="group flex flex-col items-center gap-1 hover:opacity-80 transition-all"
          >
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-500/40">Active World</span>
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic truncate max-w-[400px]">
              {currentStory.title}
            </h2>
          </button>
        ) : (
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">{currentViewTitle()}</h2>
        )}
      </div>

      <div className="flex items-center gap-4 justify-end min-w-[200px]">
        {location.pathname.startsWith('/world') && !location.pathname.includes('/arc/') && (
          <button 
            onClick={() => navigate('/library')} 
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-white transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5"
          >
            <Library className="w-4 h-4" /> Library
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
