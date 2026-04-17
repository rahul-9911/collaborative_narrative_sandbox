import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Map, PenTool, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from './services/api.service';

// Layout & Views
import Sidebar from './components/layout/Sidebar';
import AppRoutes from './AppRoutes';

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [view, setView] = useState('home'); 

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const path = pathParts[1] || 'home';
    setView(path);
    setError(null);

    // Deep-linking restoration
    if (path === 'world') {
      if (!pathParts[2]) {
        navigate('/library');
        return;
      }

      if (!currentStory || currentStory.slug !== pathParts[2]) {
        const restoreStory = async () => {
          try {
            setLoading(true);
            const story = await api.getStoryBySlug(pathParts[2]);
            if (!story) throw new Error("This world seed has not yet been planted.");
            
            setCurrentStory(story);
            const chapters = await api.getChapters(story.id);
            setAllChapters(chapters);

            // Reconstruct path if Arc ID present
            if (pathParts[3] === 'arc') {
              if (!pathParts[4]) {
                navigate(`/world/${pathParts[2]}`);
                return;
              }

              let hist = [];
              let current = chapters.find(c => c.id === pathParts[4]);
              if (!current) throw new Error("This specific arc does not exist.");

              let safety = 0;
              while (current && safety < 100) {
                safety++;
                hist.unshift(current);
                current = current.parent_id ? chapters.find(c => c.id === current.parent_id) : null;
              }
              setStoryPath(hist);
              setIsReadOnly(true);
            }
          } catch (err) {
            setError(err.message || "This world has vanished from the archives.");
            navigate('/library');
          } finally {
            setLoading(false);
          }
        };
        restoreStory();
      } else if (pathParts[3] === 'arc') {
        if (!pathParts[4]) {
          navigate(`/world/${pathParts[2]}`);
          return;
        }

        // Story already loaded, just reconstruct path for new Arc
        let hist = [];
        let current = allChapters.find(c => c.id === pathParts[4]);
        if (!current) {
          setError("Requested arc not found.");
          navigate(`/world/${pathParts[2]}`);
        } else {
          let safety = 0;
          while (current && safety < 100) {
            safety++;
            hist.unshift(current);
            current = current.parent_id ? allChapters.find(c => c.id === current.parent_id) : null;
          }
          setStoryPath(hist);
          setIsReadOnly(true);
        }
      } else {
        // Story already loaded, and we are on the World Map root (/world/:slug)
        // Ensure internal state reflects the Map view
        setView('world'); 
        if (!forkingNode) {
          setIsReadOnly(true);
          setStoryPath([]);
        }
      }
    }
  }, [location]);

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
    if (!leafNode) {
      // New story start
      setLoading(true);
      try {
        const data = await api.generateAI({ 
          prompt: `Start a new story: ${story.title}. Premise: ${story.description}`, 
          context: '', metadata: story.metadata, length: pacing, needsTitle: true
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
      navigate(`/world/${currentStory.slug}`);
    } catch (err) {
      setError("Failed to draw choices.");
    } finally {
      setLoading(false);
    }
  };

  const cancelDrafting = () => {
    setForkingNode(null);
    setIsReadOnly(true);
    setCustomInput('');
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
              {view === 'home' ? 'Welcome' : view === 'world' ? currentStory?.title : view === 'library' ? 'The Library' : 'Version History'}
            </h2>
          </div>
          {location.pathname.includes('/arc/') && (
            <button 
              onClick={() => navigate(`/world/${currentStory.slug}`)} 
              className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-amber-500 transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5"
            >
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

          <AppRoutes 
            stories={stories} loadWorldBranches={loadWorldBranches} loading={loading}
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
