import React from 'react';
import { Book, Compass, Library, Plus, Sliders } from 'lucide-react';

const Sidebar = ({ view, setView, resetPacing, pacing, setPacing, showPacing }) => {
  return (
    <aside className="w-20 lg:w-72 bg-black border-r border-white/5 flex flex-col py-10 sticky top-0 h-screen z-50">
      <div className="px-8 mb-12 group cursor-pointer" onClick={() => { setView('home'); resetPacing(); }}>
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Book className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter hidden lg:block uppercase italic">StoryForge</h1>
        </div>
      </div>
      
      <nav className="flex-1 space-y-2 px-4">
        <button 
          onClick={() => { setView('home'); resetPacing(); }} 
          className={`sf-nav-item w-full ${view === 'home' ? 'sf-nav-item-active' : 'text-stone-500 hover:text-white'}`}
        >
          <Compass className="w-5 h-5" />
          <span className="hidden lg:block">Welcome</span>
        </button>
        <button 
          onClick={() => { setView('library'); resetPacing(); }} 
          className={`sf-nav-item w-full ${view === 'library' ? 'sf-nav-item-active' : 'text-stone-500 hover:text-white'}`}
        >
          <Library className="w-5 h-5" />
          <span className="hidden lg:block">Library</span>
        </button>
        <button 
          onClick={() => { setView('architect'); resetPacing(); }} 
          className={`sf-nav-item w-full ${view === 'architect' ? 'sf-nav-item-active' : 'text-stone-500 hover:text-white'}`}
        >
          <Plus className="w-5 h-5" />
          <span className="hidden lg:block">New Story</span>
        </button>
      </nav>

      {showPacing && (
        <div className="mt-auto px-6 pb-10">
          <div className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col items-center gap-6 shadow-2xl">
            <div className="flex flex-col items-center gap-1">
              <Sliders className="w-4 h-4 text-amber-500" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-500">Pacing</span>
            </div>
            <div className="h-40 flex flex-col items-center">
              <input 
                type="range" min="1" max="15" orient="vertical"
                value={pacing === 'full' ? 15 : pacing} 
                onChange={(e) => setPacing(parseInt(e.target.value))}
                className="appearance-none bg-stone-900 w-1.5 h-full rounded-full accent-amber-500"
                style={{ WebkitAppearance: 'slider-vertical' }}
              />
            </div>
            <button 
              onClick={() => setPacing(pacing === 'full' ? 3 : 'full')}
              className={`text-[10px] font-black uppercase tracking-tighter px-4 py-2 rounded-full transition-all ${pacing === 'full' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-stone-500 hover:text-white'}`}
            >
              {pacing === 'full' ? 'Full' : `${pacing}P`}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
