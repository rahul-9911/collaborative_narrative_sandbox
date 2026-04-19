import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Map, PenTool, Info, AlertCircle, RefreshCw, Library, GitBranch, Layers, Play, ChevronRight, ChevronLeft, ChevronDown, X } from 'lucide-react';
import { api } from './services/api.service';

// Layout & Views
import AppRoutes from './AppRoutes';

// Disable browser interference
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);

  // --- STATE DECLARATIONS ---
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [stories, setStories] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [storyPath, setStoryPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(null);

  const [forkingNode, setForkingNode] = useState(null);
  const [forkChoices, setForkChoices] = useState([]);
  const [customInput, setCustomInput] = useState('');
  
  const [selectedModalChoice, setSelectedModalChoice] = useState(null);
  const [modalPacing, setModalPacing] = useState(0);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  const [newStory, setNewStory] = useState({ 
    title: '', description: '',
    metadata: { genre: 'Fantasy', tone: 'Epic', plot_goal: '' }
  });

  // --- THE SCRUBBER (Runs before paint) ---
  useLayoutEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
      mainRef.current.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // --- EFFECT BLOCKS ---
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const path = pathParts[1] || 'home';
    setError(null);

    if (path === 'world') {
      if (!pathParts[2]) {
        navigate('/library');
        return;
      }

      const loadData = async () => {
        try {
          if (!currentStory || currentStory.slug !== pathParts[2]) {
            setLoading(true);
            const story = await api.getStoryBySlug(pathParts[2]);
            if (!story) throw new Error("This world seed has not yet been planted.");
            setCurrentStory(story);
            
            const chapters = await api.getChapters(story.id);
            setAllChapters(chapters);

            if (pathParts[3] === 'arc' && pathParts[4]) {
              reconstructPath(chapters, pathParts[4]);
            } else {
              setStoryPath([]);
              setIsReadOnly(true);
            }
          } else {
            if (pathParts[3] === 'arc' && pathParts[4]) {
              const targetId = pathParts[4];
              const currentId = storyPath.length > 0 ? String(storyPath[storyPath.length - 1].id) : null;
              if (String(targetId) !== String(currentId)) {
                reconstructPath(allChapters, targetId);
              }
            } else if (pathParts[3] !== 'arc') {
              setStoryPath([]);
              setIsReadOnly(true);
            }
          }
        } catch (err) {
          setError(err.message || "This world has vanished from the archives.");
          navigate('/library');
        } finally {
          setLoading(false);
        }
      };
      loadData();
    } else {
      setForkingNode(null);
      setCurrentStory(null);
      setAllChapters([]);
      setStoryPath([]);
    }
  }, [location.pathname]);

  // Unified Adjacency Logic
  const adjacent = useMemo(() => {
    const pathParts = location.pathname.split('/');
    const arcId = pathParts[3] === 'arc' ? pathParts[4] : null;
    if (!arcId || allChapters.length === 0) return { prev: null, next: [] };
    const cleanId = String(arcId).trim().toLowerCase();
    const current = allChapters.find(c => String(c.id).trim().toLowerCase() === cleanId);
    return {
      current: current,
      prev: current?.parent_id ? String(current.parent_id).trim().toLowerCase() : null,
      next: allChapters
        .filter(c => c.parent_id && String(c.parent_id).trim().toLowerCase() === cleanId)
        .map(c => ({
          id: String(c.id).trim().toLowerCase(),
          title: c.title || 'Untitled Arc'
        }))
    };
  }, [location.pathname, allChapters]);

  const reconstructPath = (chapters, targetId) => {
    let hist = [];
    let current = chapters.find(c => String(c.id) === String(targetId));
    if (!current) {
      setError("Requested arc not found.");
      navigate(`/world/${currentStory.slug}`);
      return;
    }
    let safety = 0;
    while (current && safety < 100) {
      safety++;
      hist.unshift(current);
      current = current.parent_id ? chapters.find(c => String(c.id) === String(current.parent_id)) : null;
    }
    setStoryPath(hist);
    setIsReadOnly(true);
    setForkingNode(null);
  };

  const fetchStories = async () => {
    try {
      const data = await api.getStories();
      setStories(data);
    } catch (err) {
      console.error('Failed to fetch stories', err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const createStory = async () => {
    if (!newStory.title || !newStory.description) return alert('Please fill in title and description.');
    setLoading(true);
    setError(null);
    try {
      const story = await api.createStory(newStory);
      await fetchStories();
      navigate(`/world/${story.slug}`);
      setNewStory({ title: '', description: '', metadata: { genre: 'Fantasy', tone: 'Epic', plot_goal: '' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startQuestAtNode = async (story, leafNode) => {
    if (!leafNode) {
      setLoading(true);
      try {
        const data = await api.generateAI({ 
          prompt: `Start a new story: ${story.title}. Premise: ${story.description}`, 
          context: '', metadata: story.metadata, length: 3, needsTitle: true
        });
        const newChapter = await api.saveChapter(story.id, { title: data.title || 'Chapter 1', content: data.prose });
        navigate(`/world/${story.slug}/arc/${newChapter.id}`);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      navigate(`/world/${story.slug}/arc/${leafNode.id}`);
    }
  };

  const handleChoice = async (choice, specificNode = null, pacing = 3) => {
    const activeStory = currentStory;
    const currentChapter = specificNode || storyPath[storyPath.length - 1];
    const isManualFork = !!specificNode;
    const isNewChapterNeeded = isManualFork || (currentChapter.scenes || []).length >= 3;

    setError(null);
    setIsReadOnly(false); 
    setLoading(true);

    let globalContext = `WORLD PREMISE: ${activeStory.description}\n\n`;
    if (isManualFork) {
      globalContext += currentChapter.summary || (currentChapter.scenes || []).map(s => s.content).join('\n\n') || currentChapter.content;
    } else {
      const previousChapters = storyPath.slice(0, -1);
      previousChapters.forEach((chap, i) => {
        const chapMemory = chap.summary || (chap.scenes || []).map(s => s.content).join(' ') || chap.content;
        globalContext += `Chapter ${i + 1} (${chap.title}): ${chapMemory}\n`;
      });
      globalContext += `CURRENT CHAPTER SO FAR:\n${(currentChapter.scenes || []).map(s => s.content).join('\n\n') || currentChapter.content}`;
    }

    try {
      const data = await api.generateAI({ 
        prompt: `Action: ${choice}`, context: globalContext, metadata: activeStory.metadata, length: pacing, needsTitle: isNewChapterNeeded
      });

      if (!isNewChapterNeeded) {
        const newScene = await api.addScene(currentChapter.id, { content: data.prose });
        const chapters = await api.getChapters(activeStory.id);
        setAllChapters(chapters);
        const newPath = [...storyPath];
        newPath[newPath.length - 1] = { ...newPath[newPath.length - 1], scenes: [...(newPath[newPath.length - 1].scenes || []), newScene], choices: data.choices || [] };
        setStoryPath(newPath);
      } else {
        const nextChapter = await api.saveChapter(activeStory.id, { title: data.title || `Branch: ${choice.substring(0, 15)}`, content: data.prose, parent_id: currentChapter.id });
        const chapters = await api.getChapters(activeStory.id);
        setAllChapters(chapters);
        navigate(`/world/${activeStory.slug}/arc/${nextChapter.id}`);
      }
      setForkingNode(null);
      setCustomInput('');
      setSelectedModalChoice(null);
      setModalPacing(0);
    } catch (err) {
      setError(err.message);
      setLastAttempt({ type: 'choice', choice, specificNode, pacing });
    } finally {
      setLoading(false);
    }
  };

  const prepareFork = async (chapter) => {
    setLoading(true);
    setForkingNode(chapter);
    setError(null);
    try {
      const fullContent = (chapter.scenes || []).map(s => s.content).join('\n\n') || chapter.content;
      const { choices } = await api.generateChoices({ content: fullContent, metadata: currentStory.metadata });
      setForkChoices(choices);
    } catch (err) {
      setError("Failed to draw choices.");
      setForkingNode(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelDrafting = () => {
    setForkingNode(null);
    setCustomInput('');
    setSelectedModalChoice(null);
    setModalPacing(0);
  };

  const retryLastAction = () => {
    if (!lastAttempt) return;
    if (lastAttempt.type === 'start') startQuestAtNode(lastAttempt.story, lastAttempt.leafNode);
    if (lastAttempt.type === 'choice') handleChoice(lastAttempt.choice, lastAttempt.specificNode, lastAttempt.pacing);
  };

  const currentViewTitle = () => {
    const path = location.pathname;
    if (path === '/home' || path === '/') return 'Welcome';
    if (path === '/library') return 'The Library';
    if (path === '/architect') return 'Story Architect';
    if (path.startsWith('/world')) return currentStory?.title || 'World Map';
    return 'StoryForge';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-stone-300 overflow-hidden font-sans">
      {/* GLOBAL DRAFTING MODAL */}
      {forkingNode && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 md:p-12">
          <div className="max-w-3xl w-full animate-sf-reveal">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <GitBranch className="w-8 h-8 text-amber-500" />
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Forge New Path</h2>
              </div>
              <button onClick={cancelDrafting} className="p-4 hover:bg-white/5 rounded-full text-stone-500 hover:text-white transition-all">
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="sf-card p-8 mb-12 border-amber-500/20 bg-amber-500/[0.02]">
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-amber-500/40 mb-4 italic">Origin Point: {forkingNode.title}</p>
              <div className="text-lg text-stone-400 font-serif leading-relaxed line-clamp-3 italic opacity-60">
                {(() => {
                  const lastScene = (forkingNode.scenes || []).slice(-1)[0];
                  const content = lastScene?.content || forkingNode.content || '';
                  return content.length > 250 ? `...${content.substring(content.length - 250)}` : content;
                })()}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-6 py-20">
                <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-600">Drawing Possibilities...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-3">
                  {forkChoices?.map((choice, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setSelectedModalChoice(choice); setCustomInput(''); }} 
                      className={`w-full text-left p-6 sf-card transition-all group flex items-center justify-between
                        ${selectedModalChoice === choice ? 'border-amber-500 bg-amber-500/10 scale-[1.01]' : 'hover:border-white/10'}
                      `}
                    >
                      <span className={`text-lg font-bold transition-colors ${selectedModalChoice === choice ? 'text-white' : 'text-stone-400 group-hover:text-stone-200'}`}>{choice}</span>
                      {selectedModalChoice === choice && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,1)]"></div>}
                    </button>
                  ))}
                </div>
                
                <div className="relative mt-8 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 flex flex-col gap-4 shadow-2xl">
                  <textarea 
                    value={customInput}
                    onChange={(e) => { setCustomInput(e.target.value); setSelectedModalChoice(null); }}
                    placeholder="Lead the narrative yourself..." 
                    className="w-full bg-transparent border-none outline-none text-xl font-serif min-h-[120px] resize-none p-4 text-white"
                  />
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 border-t border-white/5">
                    <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2 px-3 text-amber-500/50">
                        <Layers className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Pages to Generate</span>
                      </div>
                      <select 
                        value={modalPacing}
                        onChange={(e) => setModalPacing(parseInt(e.target.value))}
                        className="bg-transparent text-white font-black text-xs p-2 outline-none cursor-pointer"
                      >
                        <option value="0" disabled>Select Pacing (1-10)</option>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={n} className="bg-[#0f0f0f]">{n} {n === 1 ? 'Page' : 'Pages'}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={() => { if ((selectedModalChoice || customInput) && modalPacing > 0) handleChoice(selectedModalChoice || customInput, forkingNode, modalPacing); }} 
                      disabled={(!selectedModalChoice && !customInput) || modalPacing === 0}
                      className={`p-5 px-12 rounded-2xl transition-all flex items-center gap-3 font-black uppercase text-xs tracking-widest shadow-xl
                        ${(selectedModalChoice || customInput) && modalPacing > 0 
                          ? 'bg-white text-black hover:bg-amber-500 active:scale-95' 
                          : 'bg-white/5 text-stone-700 cursor-not-allowed border border-white/5'}
                      `}
                    >
                      Commit to Timeline <Play className={`w-4 h-4 fill-current ${modalPacing > 0 && (selectedModalChoice || customInput) ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FIXED GLOBAL HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50">
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

        {/* STACKED NAVIGATION STRIP */}
        {location.pathname.includes('/arc/') && (
          <nav className="h-14 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center">
            <div className="max-w-3xl mx-auto w-full flex justify-between items-center px-6">
              <button 
                onClick={() => adjacent.prev && navigate(`/world/${currentStory.slug}/arc/${adjacent.prev}`)}
                disabled={!adjacent.prev}
                className="p-2 hover:bg-white/10 rounded-xl text-white transition-all disabled:opacity-5"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-[8px] font-black uppercase tracking-[0.4em] text-amber-500/40">ARC</span>
                <h2 className="text-xs font-black text-stone-200 uppercase tracking-tighter truncate max-w-[200px]">{adjacent.current?.title || 'Loading...'}</h2>
              </div>

              <div className="flex items-center gap-4">
                {adjacent.next.length > 1 ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                      className={`p-2 hover:bg-white/10 rounded-xl text-white transition-all flex items-center gap-2 ${isSwitcherOpen ? 'bg-white/10' : 'bg-amber-500/10'}`}
                    >
                      <GitBranch className="w-4 h-4 text-amber-500" />
                      <ChevronDown className={`w-3 h-3`} />
                    </button>
                    {isSwitcherOpen && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]">
                        <div className="max-h-64 overflow-y-auto">
                          {adjacent.next.map((branch) => (
                            <button
                              key={branch.id}
                              onClick={() => { navigate(`/world/${currentStory.slug}/arc/${branch.id}`); setIsSwitcherOpen(false); }}
                              className="w-full text-left p-4 hover:bg-white/5 transition-all group border-b border-white/5 last:border-none"
                            >
                              <div className="text-[8px] font-black uppercase text-amber-500/40 mb-1 group-hover:text-amber-500">Jump to Path</div>
                              <div className="text-xs font-bold text-stone-300 group-hover:text-white truncate">{branch.title}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => adjacent.next.length === 1 && navigate(`/world/${currentStory.slug}/arc/${adjacent.next[0].id}`)}
                    disabled={adjacent.next.length === 0}
                    className="p-2 hover:bg-white/10 rounded-xl text-white transition-all disabled:opacity-5"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>

      {/* SCROLLABLE MAIN CONTENT */}
      <main 
        id="sf-main-container" 
        ref={mainRef}
        className={`flex-1 relative overflow-y-auto h-screen bg-[#050505] ${location.pathname.includes('/arc/') ? 'pt-[152px]' : 'pt-24'}`}
      >
        <div key={location.pathname} className="p-12">
          {error && (
            <div className="max-w-2xl mx-auto mb-12 animate-sf-reveal">
              <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-6">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div><h3 className="font-black text-red-500 uppercase tracking-tight">The Void Resists</h3><p className="text-xs text-red-400/60 mt-1">{error}</p></div>
                </div>
                <button onClick={retryLastAction} className="sf-button-primary text-xs px-8 py-3">Retry</button>
              </div>
            </div>
          )}

          <AppRoutes 
            stories={stories} loading={loading}
            currentStory={currentStory} allChapters={allChapters} startQuestAtNode={startQuestAtNode}
            forkingNode={forkingNode} setForkingNode={setForkingNode} prepareFork={prepareFork}
            forkChoices={forkChoices} handleChoice={handleChoice}
            customInput={customInput} setCustomInput={setCustomInput}
            storyPath={storyPath} isReadOnly={isReadOnly}
            cancelDrafting={cancelDrafting}
            newStory={newStory} setNewStory={setNewStory} createStory={createStory}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
