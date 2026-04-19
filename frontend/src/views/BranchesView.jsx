import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, RefreshCw, ChevronRight } from 'lucide-react';

const BranchesView = ({ 
  currentStory, 
  allChapters = [], 
  loading, 
  prepareFork 
}) => {
  const navigate = useNavigate();

  // Integrity Guard
  if (!allChapters || !currentStory) {
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
                  onClick={() => navigate(`/world/${currentStory.slug}/arc/${chapter.id}`)} 
                  disabled={loading}
                  className={`mt-2 p-5 bg-white/5 border rounded-2xl shadow-2xl transition-all min-w-[180px] text-center border-white/10 hover:border-white/30
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
                  title="Forge New Path"
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
    </div>
  );
};

export default BranchesView;
