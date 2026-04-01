import React, { useState, useEffect } from 'react';
import { Sparkles, Map, PenTool, Info, AlertCircle, RefreshCw, Book, Compass, Library, Plus, Sliders, GitBranch, Play, ChevronRight, Wand2, Fingerprint, ScrollText, Layers, Wind, Lock, CornerDownRight } from 'lucide-react';

const App = () => {
  const [view, setView] = useState('home'); 
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [stories, setStories] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [storyPath, setStoryPath] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pacing, setPacing] = useState(3);
  const [error, setError] = useState(null);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [forkingNode, setForkingNode] = useState(null);
  const [forkChoices, setForkChoices] = useState([]);
  const [customInput, setCustomInput] = useState('');

  const [newStory, setNewStory] = useState({ 
    title: '', description: '',
    metadata: { genre: 'Fantasy', tone: 'Epic', plot_goal: '' }
  });

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/stories');
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error('Failed to fetch stories', err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const resetPacing = () => setPacing(3);

  const createStory = async () => {
    if (!newStory.title || !newStory.description) return alert('Please fill in title and description.');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory)
      });
      await fetchStories();
      setView('library');
      setNewStory({ title: '', description: '', metadata: { genre: 'Fantasy', tone: 'Epic', plot_goal: '' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadWorldBranches = async (story) => {
    setLoading(true);
    setCurrentStory(story);
    setForkingNode(null);
    resetPacing();
    try {
      const res = await fetch(`/api/stories/${story.id}/chapters`);
      const chapters = await res.json();
      setAllChapters(chapters);
      if (chapters.length === 0) {
        startQuestAtNode(story, null);
      } else {
        setView('branches');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const startQuestAtNode = async (story, leafNode) => {
    setLoading(true);
    setError(null);
    setStoryPath([]);
    resetPacing();
    
    try {
      if (!leafNode) {
        setIsReadOnly(false);
        setView('quest'); 
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `Start a new story: ${story.title}. Premise: ${story.description}`, 
            context: '',
            metadata: story.metadata,
            length: pacing,
            needsTitle: true
          })
        });
        const data = await res.json();
        
        const saveRes = await fetch(`/api/stories/${story.id}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: data.title || 'Chapter 1', content: data.prose })
        });
        const newChapter = await saveRes.json();
        setStoryPath([{ ...newChapter, choices: data.choices || [] }]);
      } else {
        const res = await fetch(`/api/stories/${story.id}/chapters`);
        const chapters = await res.json();
        let path = [];
        let current = leafNode;
        
        let safety = 0;
        while (current && safety < 100) {
          safety++;
          const fullNode = chapters.find(c => c.id === current.id);
          if (fullNode) {
            path.unshift(fullNode);
            current = fullNode.parent_id ? chapters.find(c => c.id === fullNode.parent_id) : null;
          } else {
            current = null;
          }
        }
        
        if (path.length === 0) throw new Error('Path reconstruction failed.');

        const lastChapter = path[path.length - 1];
        const fullContent = (lastChapter.scenes || []).map(s => s?.content || '').join('\n\n') || lastChapter.content || '';
        
        let choices = [];
        try {
          const choiceRes = await fetch('/api/generate/choices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: fullContent, metadata: story.metadata })
          });
          const choiceData = await choiceRes.json();
          choices = choiceData.choices || [];
        } catch (cErr) {
          choices = ["Continue exploring", "Try another path", "Wait for someone"];
        }
        
        setStoryPath(path.map((c, i) => i === path.length - 1 ? { ...c, choices } : c));
        setIsReadOnly(true); 
        setView('quest'); 
      }
    } catch (err) {
      console.error('Quest start failed', err);
      setError(err.message);
      setView('library'); 
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice, specificNode = null) => {
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
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Action: ${choice}`, context: globalContext, metadata: activeStory.metadata, length: pacing, needsTitle: isNewChapterNeeded })
      });
      const data = await res.json();

      if (!isNewChapterNeeded) {
        const sceneRes = await fetch(`/api/chapters/${currentChapter.id}/scenes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: data.prose })
        });
        const newScene = await sceneRes.json();
        const newPath = [...storyPath];
        newPath[newPath.length - 1] = { ...newPath[newPath.length - 1], scenes: [...(newPath[newPath.length - 1].scenes || []), newScene], choices: data.choices || [] };
        setStoryPath(newPath);
      } else {
        const forkRes = await fetch(`/api/stories/${currentStory.id}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: data.title || `Branch: ${choice.substring(0, 15)}`, content: data.prose, parent_id: currentChapter.id })
        });
        const nextChapter = await forkRes.json();
        if (isManualFork) {
          await startQuestAtNode(currentStory, nextChapter);
        } else {
          setStoryPath([...storyPath, { ...nextChapter, choices: data.choices || [] }]);
        }
      }
      setForkingNode(null);
      setCustomInput('');
      resetPacing();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const prepareFork = async (chapter) => {
    setLoading(true);
    setForkingNode(chapter);
    setError(null);
    resetPacing();
    try {
      const fullContent = (chapter.scenes || []).map(s => s.content).join('\n\n') || chapter.content;
      const res = await fetch('/api/generate/choices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fullContent, metadata: currentStory.metadata })
      });
      const data = await res.json();
      setForkChoices(data.choices);
      setView('branches'); // SWITCH VIEW TO SHOW THE PORTAL
    } catch (err) {
      setError("Failed to draw choices.");
    } finally {
      setLoading(false);
    }
  };

  const retryLastAction = () => {
    if (!lastAttempt) return;
    if (lastAttempt.type === 'start') startQuestAtNode(lastAttempt.story, lastAttempt.leafNode);
    if (lastAttempt.type === 'choice') handleChoice(lastAttempt.choice, lastAttempt.specificNode);
  };

  const renderTreeVertical = (parentId = null, depth = 0) => {
    const children = allChapters.filter(c => c.parent_id === parentId);
    if (children.length === 0) return null;
    return (
      <div className="flex flex-col items-center">
        {depth > 0 && <div className="w-[1px] h-12 bg-white/10"></div>}
        <div className="flex gap-8 items-start">
          {children.map((chapter, idx) => (
            <div key={chapter.id} className="flex flex-col items-center">
              {children.length > 1 && (
                <div className="w-full flex h-6">
                  <div className={`flex-1 ${idx === 0 ? '' : 'border-t border-white/10'}`}></div>
                  <div className="w-[1px] border-t border-white/10"></div>
                  <div className={`flex-1 ${idx === children.length - 1 ? '' : 'border-t border-white/10'}`}></div>
                </div>
              )}
              <div className="relative group">
                <button onClick={() => startQuestAtNode(currentStory, chapter)} className={`mt-2 p-5 bg-white/5 border rounded-2xl shadow-2xl transition-all min-w-[180px] text-center ${forkingNode?.id === chapter.id ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 hover:border-white/30'}`}>
                  <div className="text-[9px] uppercase tracking-widest text-amber-500/50 font-black mb-2">Arc {depth + 1}</div>
                  <div className="text-xs font-black text-white truncate max-w-[150px] uppercase tracking-tighter">{chapter.title}</div>
                </button>
                <button onClick={(e) => { e.stopPropagation(); prepareFork(chapter); }} className="absolute -right-3 top-1/2 -translate-y-1/2 bg-black border border-white/10 p-2 rounded-xl text-stone-500 hover:text-amber-500 opacity-0 group-hover:opacity-100 shadow-xl"><GitBranch className="w-4 h-4" /></button>
              </div>
              {renderTreeVertical(chapter.id, depth + 1)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#050505] text-stone-300 font-sans overflow-hidden">
      <aside className="w-20 lg:w-72 bg-black border-r border-white/5 flex flex-col py-10 sticky top-0 h-screen z-50">
        <div className="px-8 mb-12 cursor-pointer" onClick={() => { setView('home'); resetPacing(); }}><div className="flex items-center gap-3"><div className="bg-amber-500 p-2 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)]"><Book className="w-6 h-6 text-black" /></div><h1 className="text-2xl font-black text-white tracking-tighter hidden lg:block uppercase italic">StoryForge</h1></div></div>
        <nav className="flex-1 space-y-2 px-4">
          <button onClick={() => { setView('home'); resetPacing(); }} className={`sf-nav-item w-full ${view === 'home' ? 'sf-nav-item-active' : 'text-stone-500 hover:text-white'}`}><Compass className="w-5 h-5" /><span className="hidden lg:block">Welcome</span></button>
          <button onClick={() => { setView('library'); resetPacing(); }} className={`sf-nav-item w-full ${view === 'library' ? 'sf-nav-item-active' : 'text-stone-500 hover:text-white'}`}><Library className="w-5 h-5" /><span className="hidden lg:block">Library</span></button>
          <button onClick={() => { setView('architect'); resetPacing(); }} className={`sf-nav-item w-full ${view === 'architect' ? 'sf-nav-item-active' : 'text-stone-500 hover:text-white'}`}><Plus className="w-5 h-5" /><span className="hidden lg:block">New Story</span></button>
        </nav>
        {(view === 'quest' || forkingNode) && !isReadOnly && (
          <div className="mt-auto px-6 pb-10"><div className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col items-center gap-6 shadow-2xl"><Sliders className="w-4 h-4 text-amber-500" /><div className="h-40 flex flex-col items-center"><input type="range" min="1" max="15" orient="vertical" value={pacing === 'full' ? 15 : pacing} onChange={(e) => setPacing(parseInt(e.target.value))} className="appearance-none bg-stone-900 w-1.5 h-full rounded-full accent-amber-500" style={{ WebkitAppearance: 'slider-vertical' }} /></div><button onClick={() => setPacing(pacing === 'full' ? 3 : 'full')} className={`text-[10px] font-black uppercase tracking-tighter px-4 py-2 rounded-full transition-all ${pacing === 'full' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-stone-500 hover:text-white'}`}>{pacing === 'full' ? 'Full' : `${pacing}P`}</button></div></div>
        )}
      </aside>

      <main className="flex-1 relative overflow-y-auto h-screen bg-[#050505]">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 sticky top-0 bg-black/60 backdrop-blur-2xl z-40">
          <div className="flex items-center gap-6">
            {view === 'quest' && <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />}
            <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">{view === 'home' ? 'Welcome' : view === 'quest' ? currentStory?.title : view === 'library' ? 'The Library' : 'Version History'}</h2>
          </div>
          {view === 'quest' && <button onClick={() => setView('branches')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-amber-500 transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5"><Map className="w-4 h-4" /> Timeline Map</button>}
        </header>

        <div className="p-12">
          {error && <div className="max-w-2xl mx-auto mb-12 animate-sf-reveal"><div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl"><div className="flex items-center gap-6"><AlertCircle className="w-6 h-6 text-red-500" /><div><h3 className="font-black text-red-500 uppercase tracking-tight">The Void Resists</h3><p className="text-xs text-red-400/60 mt-1">{error}</p></div></div><button onClick={retryLastAction} className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase tracking-tighter hover:bg-amber-500 transition-all flex items-center gap-3">Retry</button></div></div>}

          {view === 'home' && (
            <div className="max-w-5xl mx-auto py-12 animate-sf-reveal">
              <div className="text-center mb-20">
                <div className="inline-block bg-amber-500/10 border border-amber-500/20 px-4 py-1 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">The GitHub for Interactive Literature</div>
                <h1 className="text-8xl font-black text-white tracking-tighter uppercase italic mb-8 leading-[0.9]">Write. Branch. <br/> <span className="text-amber-500 glow-text">Publish.</span></h1>
                <p className="text-xl text-stone-500 max-w-2xl mx-auto leading-relaxed mb-12">StoryForge is a professional collaborative authoring tool. Use the power of AI to expand your prose, fork narrative timelines like code, and prepare your multiverse for professional publication.</p>
                <div className="flex justify-center gap-6"><button onClick={() => setView('architect')} className="sf-button-primary scale-110">Start a New Story</button><button onClick={() => setView('library')} className="px-10 py-4 border border-white/10 rounded-2xl text-white font-black uppercase tracking-tighter hover:bg-white/5 transition-all">Browse Library</button></div>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="sf-card p-10 group"><PenTool className="w-6 h-6 text-amber-500 mb-8" /><h3 className="text-xl font-black text-white uppercase mb-4 italic">Narrative Design</h3><p className="text-stone-500 text-sm mb-6">Build the "World Bible." Define genre, tone, and plot constraints to ensure the AI drafting engine remains consistent.</p></div>
                <div className="sf-card p-10 group"><ScrollText className="w-6 h-6 text-amber-500 mb-8" /><h3 className="text-xl font-black text-white uppercase mb-4 italic">Drafting Engine</h3><p className="text-stone-500 text-sm mb-6">Collaborate with AI to write high-fidelity prose. Control the pace from a single paragraph to a full chapter conclusion.</p></div>
                <div className="sf-card p-10 group"><Layers className="w-6 h-6 text-amber-500 mb-8" /><h3 className="text-xl font-black text-white uppercase mb-4 italic">Version Control</h3><p className="text-stone-500 text-sm mb-6">Every decision is a branch. Use the Timeline Map to navigate through different versions of your story without losing data.</p></div>
              </div>
            </div>
          )}

          {view === 'library' && (
            <div className="animate-sf-reveal">
              <div className="flex items-center justify-between mb-16"><div><h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">The Library</h2><p className="text-stone-600 font-bold uppercase tracking-widest text-[10px] mt-2">Resume a narrative or explore parallel arcs</p></div><button onClick={() => setView('architect')} className="sf-button-primary text-[10px] px-6 py-3"><Plus className="w-4 h-4" /> Create New World</button></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {stories.map(story => (
                  <div key={story.id} className="sf-card p-10 group flex flex-col"><div className="mb-8"><span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{story.metadata?.genre}</span><h3 className="text-3xl font-black text-white mt-4 tracking-tighter group-hover:text-amber-500 transition-colors">{story.title}</h3></div><p className="text-stone-500 text-sm italic mb-12 line-clamp-3 leading-relaxed font-serif">{story.description}</p><button onClick={() => loadWorldBranches(story)} className="mt-auto sf-button-primary w-full flex items-center justify-center gap-3">Access Timeline <ChevronRight className="w-5 h-5" /></button></div>
                ))}
              </div>
            </div>
          )}

          {view === 'branches' && (
            <div className="w-full animate-sf-reveal text-center pb-40">
              <div className="mb-20"><h2 className="text-7xl font-black text-white tracking-tighter mb-6 uppercase italic">{currentStory?.title}</h2><p className="text-stone-600 font-black uppercase tracking-[0.4em] text-[10px] mb-12">Select a point in the timeline to inhabit</p></div>
              <div className="inline-block min-w-full p-16 bg-white/[0.02] rounded-[5rem] border border-white/5 shadow-inner">{renderTreeVertical()}</div>
              {forkingNode && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-12">
                  <div className="max-w-3xl w-full animate-sf-reveal">
                    <div className="flex justify-between items-center mb-12"><div className="flex items-center gap-4"><GitBranch className="w-8 h-8 text-amber-500" /><h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">New Branch</h2></div><button onClick={() => setForkingNode(null)} className="text-stone-500 hover:text-white font-black uppercase text-xs tracking-widest">Cancel</button></div>
                    <div className="sf-card p-12 mb-12 border-amber-500/20 bg-amber-500/[0.02]"><p className="text-[10px] uppercase tracking-[0.4em] font-black text-amber-500/40 mb-8 italic">Origin Point: {forkingNode.title}</p><div className="text-xl text-stone-400 font-serif leading-relaxed line-clamp-4 italic opacity-60 text-left">{(() => { const lastScene = (forkingNode.scenes || []).slice(-1)[0]; const content = lastScene?.content || forkingNode.content || ''; return content.length > 300 ? `...${content.substring(content.length - 300)}` : content; })()}</div></div>{loading ? (<div className="flex flex-col items-center gap-4 py-12"><RefreshCw className="w-8 h-8 text-amber-500 animate-spin" /><p className="text-[10px] font-black uppercase tracking-widest text-stone-600">Drawing Possibilities...</p></div>) : (<div className="space-y-4"><p className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-700 mb-8">Choose New Narrative Path</p>
                        {forkChoices?.map((choice, i) => (<button key={i} onClick={() => handleChoice(choice, forkingNode)} className="w-full text-left p-6 sf-card hover:border-amber-500/50 group flex items-center justify-between"><span className="text-lg font-bold text-stone-300 group-hover:text-white">{choice}</span><ChevronRight className="w-5 h-5 text-stone-700 group-hover:text-amber-500" /></button>))}
                        <div className="relative mt-12 bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 flex flex-col gap-4"><textarea value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Lead the narrative yourself..." className="w-full bg-transparent border-none outline-none text-xl font-serif min-h-[120px] resize-none p-4 text-white" /><div className="flex justify-end p-2"><button onClick={() => { if (customInput) handleChoice(customInput, forkingNode); }} className="bg-white text-black p-4 rounded-2xl hover:bg-amber-500 transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest active:scale-95 shadow-xl">Execute <Play className="w-4 h-4 fill-current" /></button></div></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'quest' && (
            <div className="max-w-3xl mx-auto space-y-32 pb-64">
              <div className="flex justify-center">{isReadOnly ? ( <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2 flex items-center gap-3 text-stone-500 font-black text-[9px] uppercase tracking-widest animate-reveal"><Lock className="w-4 h-4" /> Narrative Archive (Read Only)</div> ) : ( <div className="bg-amber-500/5 border border-amber-500/10 rounded-full px-6 py-2 flex items-center gap-3 text-amber-500/60 font-black text-[9px] uppercase tracking-widest animate-reveal"><Fingerprint className="w-4 h-4" /> Active Drafting Session</div> )}</div>
              {storyPath.map((chapter, index) => (
                <div key={chapter?.id || index} className="animate-sf-reveal">
                  <div className="flex items-center gap-6 mb-16 opacity-20 group"><div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/40"></div><span className="text-[9px] uppercase tracking-[0.6em] font-black">Timeline Arc {index + 1}</span>{!isReadOnly && (<button onClick={() => handleChoice(null, chapter)} className="p-3 hover:bg-white/10 rounded-2xl text-stone-500 hover:text-amber-500 transition-all"><GitBranch className="w-5 h-5" /></button>)}<div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/40"></div></div>
                  <h2 className="text-6xl font-black text-white mb-16 tracking-tighter italic glow-text">{chapter?.title || 'Untitled Arc'}</h2>
                  <div className="space-y-24">{(chapter?.scenes && chapter.scenes.length > 0) ? (chapter.scenes.map((scene, sIdx) => (<div key={scene?.id || sIdx} className="relative pl-12 border-l border-white/5 animate-sf-reveal group"><div className="absolute -left-3 top-0 bg-black py-1 text-[8px] font-black text-stone-700 uppercase tracking-[0.2em] transition-all group-hover:text-amber-500">Page {sIdx + 1}</div><div className="space-y-10 text-2xl leading-[1.9] text-stone-400 font-serif">{(scene?.content || '').split('\n\n').map((para, pIdx) => <p key={pIdx}>{para}</p>)}</div></div>))) : (<div className="text-2xl leading-[1.9] text-stone-400 font-serif">{(chapter?.content || '').split('\n\n').map((para, i) => <p key={i} className="animate-reveal mb-8">{para}</p>)}</div>)}</div>
                </div>
              ))}
              {loading ? (
                <div className="flex flex-col items-center gap-8 py-32"><Wand2 className="w-12 h-12 text-amber-500 animate-pulse" /><p className="text-stone-600 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Drafting Prose...</p></div>
              ) : (
                <div className="mt-48 animate-sf-reveal">
                  {isReadOnly ? (
                    <div className="text-center space-y-12"><div className="flex items-center gap-4 justify-center opacity-30"><div className="h-[1px] w-24 bg-white/40"></div><span className="text-[10px] uppercase font-black tracking-widest text-white">End of Recorded Arc</span><div className="h-[1px] w-24 bg-white/40"></div></div><div className="sf-card p-16 space-y-8 bg-amber-500/[0.02] border-amber-500/10"><h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Forge a Different Path?</h3><p className="text-stone-500 max-w-md mx-auto leading-relaxed">You are currently viewing a fixed point in history. You can fracture this timeline into a new, collaborative draft.</p><button onClick={() => storyPath.length > 0 && prepareFork(storyPath[storyPath.length - 1])} className="sf-button-primary flex items-center gap-3 mx-auto px-12"><PenTool className="w-5 h-5" /> Start Collaborative Draft</button></div></div>
                  ) : (
                    <div className="space-y-8"><div className="flex items-center gap-4 mb-12"><span className="text-[10px] uppercase tracking-[0.4em] font-black text-stone-700">Collaborative Choices</span><div className="h-[1px] flex-1 bg-white/5"></div></div><div className="grid gap-4">{storyPath.length > 0 && (storyPath[storyPath.length - 1].choices || []).map((choice, i) => (<button key={i} onClick={() => handleChoice(choice)} className="sf-card p-8 group flex items-center justify-between text-left hover:scale-[1.01]"><span className="text-xl font-bold text-stone-300 group-hover:text-white transition-colors">{choice}</span><div className="bg-white/5 p-4 rounded-2xl group-hover:bg-amber-500 transition-all"><ChevronRight className="w-6 h-6 text-stone-600 group-hover:text-black" /></div></button>))}</div><div className="relative mt-16 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-2xl transition-all hover:border-white/20"><textarea value={customInput} onChange={(e) => setCustomInput(e.target.value)} placeholder="Lead the narrative yourself..." className="w-full bg-transparent border-none outline-none text-2xl font-serif min-h-[160px] resize-none text-white selection:bg-amber-500/30" /><div className="flex justify-end pt-4 border-t border-white/5"><button onClick={() => { if (customInput) handleChoice(customInput); }} className="bg-white text-black px-10 py-4 rounded-[1.5rem] hover:bg-amber-500 transition-all flex items-center gap-3 font-black uppercase text-xs tracking-widest active:scale-95 shadow-xl">Commit to Timeline <Play className="w-5 h-5 fill-current" /></button></div></div></div>
                  )}
                </div>
              )}
            </div>
          )}

          {view === 'architect' && (
            <div className="max-w-2xl mx-auto sf-card p-20 animate-sf-reveal">
              <div className="flex items-center gap-4 mb-12"><PenTool className="w-8 h-8 text-amber-500" /><h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Story Architect</h2></div>
              <div className="space-y-12"><div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-start gap-4"><Info className="w-5 h-5 text-amber-500 shrink-0 mt-1" /><p className="text-xs text-stone-500 leading-relaxed uppercase tracking-wider font-bold">Define the framework. The AI drafting engine will adhere to these constraints.</p></div><div><label className="block text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mb-4">Master Title</label><input type="text" value={newStory.title} onChange={(e) => setNewStory({ ...newStory, title: e.target.value })} className="w-full sf-input text-xl" placeholder="e.g. THE NEON ABYSS" /></div><div className="grid grid-cols-2 gap-10"><div><label className="block text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mb-4">Genre</label><select value={newStory.metadata.genre} onChange={(e) => setNewStory({ ...newStory, metadata: { ...newStory.metadata, genre: e.target.value } })} className="w-full sf-input appearance-none"><option>Cyberpunk</option><option>Grimdark</option><option>Eldritch</option><option>Space Opera</option><option>Historical</option></select></div><div><label className="block text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mb-4">Tone</label><select value={newStory.metadata.tone} onChange={(e) => setNewStory({ ...newStory, metadata: { ...newStory.metadata, tone: e.target.value } })} className="w-full sf-input appearance-none"><option>Melancholy</option><option>Cinematic</option><option>Violent</option><option>Dreamlike</option><option>Whimsical</option></select></div></div><div><label className="block text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mb-4">Seed (Premise)</label><textarea value={newStory.description} onChange={(e) => setNewStory({ ...newStory, description: e.target.value })} className="w-full sf-input h-48 resize-none text-lg leading-relaxed" placeholder="Describe the spark of this existence..."></textarea></div><button onClick={createStory} disabled={loading} className="sf-button-primary w-full py-8 text-2xl shadow-2xl">{loading ? 'CONSTRUCTING...' : 'BEGIN ARCHITECTURE'}</button></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default App;
