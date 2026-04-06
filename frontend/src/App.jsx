import React, { useState, useEffect } from 'react';
import { Sparkles, Map, PenTool, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from './services/api.service';

// Layout & Views
import Sidebar from './components/layout/Sidebar';
import HomeView from './views/HomeView';
import LibraryView from './views/LibraryView';
import QuestView from './views/QuestView';
import BranchesView from './views/BranchesView';

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
      const data = await api.getStories();
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
      await api.createStory(newStory);
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
      const chapters = await api.getChapters(story.id);
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
        const data = await api.generateAI({ 
          prompt: `Start a new story: ${story.title}. Premise: ${story.description}`, 
          context: '',
          metadata: story.metadata,
          length: pacing,
          needsTitle: true
        });
        
        const newChapter = await api.saveChapter(story.id, { title: data.title || 'Chapter 1', content: data.prose });
        setStoryPath([{ ...newChapter, choices: data.choices || [] }]);
      } else {
        // Hardened Resume Path
        const chapters = await api.getChapters(story.id);
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

        setStoryPath(path.map((c, i) => i === path.length - 1 ? { ...c, choices: [] } : c));
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
      const data = await api.generateAI({ 
        prompt: `Action: ${choice}`, 
        context: globalContext, 
        metadata: activeStory.metadata,
        length: pacing,
        needsTitle: isNewChapterNeeded
      });

      if (!isNewChapterNeeded) {
        const newScene = await api.addScene(currentChapter.id, { content: data.prose });
        const newPath = [...storyPath];
        newPath[newPath.length - 1] = { ...newPath[newPath.length - 1], scenes: [...(newPath[newPath.length - 1].scenes || []), newScene], choices: data.choices || [] };
        setStoryPath(newPath);
      } else {
        const nextChapter = await api.saveChapter(activeStory.id, { 
          title: data.title || `Branch: ${choice.substring(0, 15)}`, 
          content: data.prose,
          parent_id: currentChapter.id 
        });
        if (isManualFork) {
          await startQuestAtNode(activeStory, nextChapter);
          setView('quest'); 
        } else {
          setStoryPath([...storyPath, { ...nextChapter, choices: data.choices || [] }]);
        }
      }
      setForkingNode(null);
      setCustomInput('');
      resetPacing();
    } catch (err) {
      setError(err.message);
      setLastAttempt({ type: 'choice', choice, specificNode });
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
      const { choices } = await api.generateChoices({ content: fullContent, metadata: currentStory.metadata });
      setForkChoices(choices);
      setView('branches');
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

  return (
    <div className="min-h-screen flex bg-[#050505] text-stone-300 overflow-hidden font-sans">
      <Sidebar 
        view={view} setView={setView} resetPacing={resetPacing} 
        pacing={pacing} setPacing={setPacing} 
        showPacing={(view === 'quest' && !isReadOnly) || !!forkingNode}
      />

      <main className="flex-1 relative overflow-y-auto h-screen bg-[#050505]">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 sticky top-0 bg-black/60 backdrop-blur-2xl z-40">
          <div className="flex items-center gap-6">
            {view === 'quest' && <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />}
            <h2 className="text-xl font-black tracking-tighter text-white uppercase italic">
              {view === 'home' ? 'Welcome' : view === 'quest' ? currentStory?.title : view === 'library' ? 'The Library' : 'Version History'}
            </h2>
          </div>
          {view === 'quest' && (
            <button onClick={() => loadWorldBranches(currentStory)} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-amber-500 transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5">
              <Map className="w-4 h-4" /> Timeline Map
            </button>
          )}
        </header>

        <div className="p-12">
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

          {view === 'home' && <HomeView setView={setView} />}
          {view === 'library' && <LibraryView stories={stories} setView={setView} loadWorldBranches={loadWorldBranches} loading={loading} />}
          {view === 'branches' && (
            <BranchesView 
              currentStory={currentStory} allChapters={allChapters} startQuestAtNode={startQuestAtNode}
              forkingNode={forkingNode} setForkingNode={setForkingNode} prepareFork={prepareFork}
              loading={loading} forkChoices={forkChoices} handleChoice={handleChoice}
              customInput={customInput} setCustomInput={setCustomInput}
            />
          )}
          {view === 'quest' && (
            <QuestView 
              currentStory={currentStory} storyPath={storyPath} loading={loading}
              handleChoice={handleChoice}
              customInput={customInput} setCustomInput={setCustomInput} setView={setView}
              isReadOnly={isReadOnly} prepareFork={prepareFork}
            />
          )}

          {view === 'architect' && (
            <div className="max-w-2xl mx-auto sf-card p-20 animate-sf-reveal">
              <div className="flex items-center gap-4 mb-12"><PenTool className="w-8 h-8 text-amber-500" /><h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Story Architect</h2></div>
              <div className="space-y-12">
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-start gap-4"><Info className="w-5 h-5 text-amber-500 shrink-0 mt-1" /><p className="text-xs text-stone-500 leading-relaxed uppercase tracking-wider font-bold">Define the framework. The AI drafting engine will adhere to these constraints.</p></div>
                <div><label className="block text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mb-4">Master Title</label><input type="text" value={newStory.title} onChange={(e) => setNewStory({ ...newStory, title: e.target.value })} className="w-full sf-input text-xl" placeholder="e.g. THE NEON ABYSS" /></div>
                <div className="grid grid-cols-2 gap-10">
                  <div><label className="block text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mb-4">Genre</label><select value={newStory.metadata.genre} onChange={(e) => setNewStory({ ...newStory, metadata: { ...newStory.metadata, genre: e.target.value } })} className="w-full sf-input appearance-none"><option>Cyberpunk</option><option>Grimdark</option><option>Eldritch</option><option>Space Opera</option><option>Historical</option></select></div>
                  <div><label className="block text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mb-4">Tone</label><select value={newStory.metadata.tone} onChange={(e) => setNewStory({ ...newStory, metadata: { ...newStory.metadata, tone: e.target.value } })} className="w-full sf-input appearance-none"><option>Melancholy</option><option>Cinematic</option><option>Violent</option><option>Dreamlike</option><option>Whimsical</option></select></div>
                </div>
                <div><label className="block text-[10px] uppercase tracking-[0.3em] font-black text-stone-600 mb-4">Seed (Premise)</label><textarea value={newStory.description} onChange={(e) => setNewStory({ ...newStory, description: e.target.value })} className="w-full sf-input h-48 resize-none text-lg leading-relaxed" placeholder="Describe the spark of this existence..."></textarea></div>
                <button onClick={createStory} disabled={loading} className="sf-button-primary w-full py-8 text-2xl shadow-2xl">{loading ? 'CONSTRUCTING...' : 'BEGIN ARCHITECTURE'}</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
