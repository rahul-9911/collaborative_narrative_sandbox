import React, { useState, useEffect } from 'react';
import { Book, Plus, GitBranch, Play, Save, ChevronRight, Settings, History, Map } from 'lucide-react';

const App = () => {
  const [view, setView] = useState('library');
  const [stories, setStories] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);
  const [branches, setBranches] = useState([]);
  const [storyPath, setStoryPath] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const [newStory, setNewStory] = useState({ 
    title: '', 
    description: '',
    metadata: { genre: 'Fantasy', tone: 'Epic', plot_goal: 'Defeat the Shadow King' }
  });

  const createStory = async () => {
    if (!newStory.title || !newStory.description) return alert('Please fill in title and description.');
    setLoading(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory)
      });
      if (res.ok) {
        await fetchStories();
        setView('library');
        setNewStory({ title: '', description: '', metadata: { genre: 'Fantasy', tone: 'Epic', plot_goal: '' } });
      }
    } catch (err) {
      console.error('Failed to create story', err);
    } finally {
      setLoading(false);
    }
  };

  const loadWorldBranches = async (story) => {
    setLoading(true);
    setCurrentStory(story);
    try {
      const res = await fetch(`/api/stories/${story.id}/branches`);
      const data = await res.json();
      
      if (data.length === 0) {
        // Start fresh
        startQuestAtNode(story, null);
      } else if (data.length === 1) {
        // Auto-resume only path
        startQuestAtNode(story, data[0]);
      } else {
        // Show Branch Selector
        setBranches(data);
        setView('branches');
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load branches', err);
      setLoading(false);
    }
  };

  const startQuestAtNode = async (story, leafNode) => {
    setLoading(true);
    setView('quest');
    setStoryPath([]);
    
    try {
      if (!leafNode) {
        // Start NEW Journey
        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: `Start a new story: ${story.title}. Premise: ${story.description}`, 
            context: '',
            metadata: story.metadata
          })
        });
        const data = await genRes.json();
        
        const saveRes = await fetch(`/api/stories/${story.id}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Chapter 1', content: data.prose })
        });
        const newChapter = await saveRes.json();
        setStoryPath([{ ...newChapter, choices: data.choices || [] }]);
      } else {
        // RESUME Journey from leaf node
        // 1. Fetch ALL chapters for story
        const res = await fetch(`/api/stories/${story.id}/chapters`);
        const allChapters = await res.json();
        
        // 2. Trace path from leaf back to root
        let path = [];
        let currentNode = leafNode;
        while (currentNode) {
          const chapterWithScenes = allChapters.find(c => c.id === currentNode.id);
          path.unshift(chapterWithScenes);
          currentNode = allChapters.find(c => c.id === currentNode.parent_id);
        }
        
        // 3. Generate choices for the last chapter
        const lastChapter = path[path.length - 1];
        const fullContent = (lastChapter.scenes || []).map(s => s.content).join('\n\n') || lastChapter.content;
        
        const choicesRes = await fetch('/api/generate/choices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: fullContent, metadata: story.metadata })
        });
        const { choices } = await choicesRes.json();
        
        setStoryPath(path.map((c, i) => i === path.length - 1 ? { ...c, choices } : c));
      }
    } catch (err) {
      console.error('Quest start failed', err);
      setView('library');
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice) => {
    const currentChapter = storyPath[storyPath.length - 1];
    const sceneLimit = 3;
    const currentSceneCount = (currentChapter.scenes || []).length;

    let globalContext = `WORLD PREMISE: ${currentStory.description}\n\n`;
    const previousChapters = storyPath.slice(0, -1);
    if (previousChapters.length > 0) {
      globalContext += "PREVIOUS JOURNEY:\n";
      previousChapters.forEach((chap, i) => {
        const chapContent = (chap.scenes || []).map(s => s.content).join(' ') || chap.content;
        globalContext += `Chapter ${i + 1} (${chap.title}): ${chapContent.substring(0, 300)}...\n`;
      });
      globalContext += "\n";
    }

    const currentChapterContext = (currentChapter.scenes || [])
      .map(s => s.content)
      .join('\n\n') || currentChapter.content;
    globalContext += `CURRENT CHAPTER SO FAR:\n${currentChapterContext}`;

    setLoading(true);
    try {
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `User action: ${choice}`, context: globalContext, metadata: currentStory.metadata })
      });
      const data = await genRes.json();

      if (currentSceneCount < sceneLimit) {
        const sceneRes = await fetch(`/api/chapters/${currentChapter.id}/scenes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: data.prose })
        });
        const newScene = await sceneRes.json();
        const newPath = [...storyPath];
        newPath[newPath.length - 1] = {
          ...newPath[newPath.length - 1],
          scenes: [...(newPath[newPath.length - 1].scenes || []), newScene],
          choices: data.choices || []
        };
        setStoryPath(newPath);
      } else {
        const forkRes = await fetch(`/api/chapters/${currentChapter.id}/fork`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `Chapter ${storyPath.length + 1}`, content: data.prose })
        });
        const nextChapter = await forkRes.json();
        setStoryPath([...storyPath, { ...nextChapter, choices: data.choices || [] }]);
      }
    } catch (err) {
      console.error('Choice failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualFork = async (chapter) => {
    const customAction = prompt("Manual branch point:");
    if (!customAction) return;
    const fullChapterContext = (chapter.scenes || []).map(s => s.content).join('\n\n') || chapter.content;
    setLoading(true);
    try {
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customAction, context: fullChapterContext, metadata: currentStory.metadata })
      });
      const data = await genRes.json();
      const forkRes = await fetch(`/api/chapters/${chapter.id}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Fork: ${customAction.substring(0, 20)}`, content: data.prose })
      });
      const nextChapter = await forkRes.json();
      const chapterIndex = storyPath.findIndex(c => c.id === chapter.id);
      setStoryPath([...storyPath.slice(0, chapterIndex + 1), { ...nextChapter, choices: data.choices || [] }]);
    } catch (err) {
      console.error('Fork failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#1A1A1A] font-serif flex flex-col items-center py-8 px-4">
      <header className="max-w-4xl w-full flex justify-between items-center mb-12 border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 flex items-center gap-2">
          <Book className="w-8 h-8 text-amber-900" /> StoryForge
        </h1>
        <div className="flex gap-4">
          <button onClick={() => { setView('library'); setStoryPath([]); }} className="text-sm font-medium hover:text-amber-900">Library</button>
          <button onClick={() => setView('architect')} className="flex items-center gap-1 bg-stone-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition-all">
            <Plus className="w-4 h-4" /> New World
          </button>
        </div>
      </header>

      <main className="max-w-4xl w-full">
        {loading && view === 'library' && (
          <div className="flex justify-center py-20 text-stone-400 animate-pulse italic">Scanning the multiverse...</div>
        )}

        {view === 'library' && !loading && (
          <div className="grid md:grid-cols-2 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 hover:border-stone-400 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{story.title}</h3>
                  <span className="px-2 py-1 bg-stone-100 rounded text-[10px] uppercase font-bold tracking-tighter text-stone-500">{story.metadata?.genre || 'General'}</span>
                </div>
                <p className="text-stone-600 mb-6 text-sm italic line-clamp-2">{story.description}</p>
                <button onClick={() => loadWorldBranches(story)} className="flex items-center gap-2 text-amber-900 font-bold hover:gap-3 transition-all">
                  Enter World <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {view === 'branches' && (
          <div className="max-w-xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold mb-8">Choose a path to resume</h2>
            {branches.map(branch => (
              <button 
                key={branch.id} 
                onClick={() => startQuestAtNode(currentStory, branch)}
                className="w-full text-left p-6 bg-white rounded-2xl border border-stone-200 hover:border-stone-900 transition-all group flex justify-between items-center"
              >
                <div>
                  <div className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-1">Created {new Date(branch.created_at).toLocaleDateString()}</div>
                  <div className="text-lg font-bold group-hover:text-amber-900 transition-colors">{branch.title}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
            <button 
              onClick={() => startQuestAtNode(currentStory, null)}
              className="w-full text-center p-4 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl hover:bg-stone-50 hover:text-stone-900 transition-all italic text-sm"
            >
              + Start a new timeline
            </button>
          </div>
        )}

        {view === 'quest' && storyPath.length > 0 && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-700">
            {storyPath.map((chapter, index) => (
              <div key={chapter.id} className="mb-16 relative">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Section {index + 1}</span>
                  <button onClick={() => handleManualFork(chapter)} className="flex items-center gap-1 text-stone-400 text-xs hover:text-amber-700 transition-colors">
                    <GitBranch className="w-3 h-3" /> Branch from here
                  </button>
                </div>
                <h2 className="text-3xl font-bold mb-8 text-stone-900 leading-tight">{chapter.title}</h2>
                <div className="story-text text-lg text-stone-800 space-y-12 leading-relaxed border-l-[1px] border-stone-200 pl-8">
                  {(chapter.scenes && chapter.scenes.length > 0) ? (
                    chapter.scenes.map((scene, sIdx) => (
                      <div key={scene.id || sIdx} className="space-y-6">
                        {scene.content.split('\n\n').map((para, pIdx) => <p key={pIdx}>{para}</p>)}
                      </div>
                    ))
                  ) : (
                    (chapter.content || '').split('\n\n').map((para, i) => <p key={i}>{para}</p>)
                  )}
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex justify-center py-12 text-stone-400 animate-pulse italic">The weaver draws a new thread...</div>
            ) : (
              <div className="mt-16 space-y-4 bg-stone-50 p-8 rounded-2xl border border-stone-100">
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-6">Forge the Next Path</p>
                {(storyPath[storyPath.length - 1].choices || []).map((choice, i) => (
                  <button key={i} onClick={() => handleChoice(choice)} className="w-full text-left p-5 rounded-xl border border-stone-200 bg-white hover:border-stone-900 hover:shadow-md transition-all flex items-center justify-between group">
                    <span className="font-medium text-stone-700">{choice}</span>
                    <Play className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-all" />
                  </button>
                ))}
                <div className="mt-8 pt-6 border-t border-stone-100">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-4 italic text-center">Or forge your own destiny</p>
                  <div className="flex gap-2">
                    <input type="text" id="customActionInput" placeholder="e.g. He draws his hidden dagger..." className="flex-1 p-4 rounded-xl border border-stone-200 focus:border-stone-900 outline-none font-serif text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value) { handleChoice(e.target.value); e.target.value = ''; } }} />
                    <button onClick={() => { const input = document.getElementById('customActionInput'); if (input.value) { handleChoice(input.value); input.value = ''; } }} className="bg-stone-900 text-white px-6 rounded-xl hover:bg-black transition-all"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'architect' && (
          <div className="max-w-xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-stone-100">
            <h2 className="text-3xl font-bold mb-8 text-stone-900">Architect a New World</h2>
            <div className="space-y-6">
              <div><label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">World Title</label><input type="text" value={newStory.title} onChange={(e) => setNewStory({ ...newStory, title: e.target.value })} className="w-full p-4 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all" placeholder="e.g. The Clockwork Empire" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Genre</label><select value={newStory.metadata.genre} onChange={(e) => setNewStory({ ...newStory, metadata: { ...newStory.metadata, genre: e.target.value } })} className="w-full p-4 rounded-xl border border-stone-200 outline-none appearance-none bg-stone-50"><option>Fantasy</option><option>Sci-Fi</option><option>Noir</option><option>Horror</option><option>Historical</option></select></div>
                <div><label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Tone</label><select value={newStory.metadata.tone} onChange={(e) => setNewStory({ ...newStory, metadata: { ...newStory.metadata, tone: e.target.value } })} className="w-full p-4 rounded-xl border border-stone-200 outline-none appearance-none bg-stone-50"><option>Epic</option><option>Gritty</option><option>Whimsical</option><option>Suspenseful</option></select></div>
              </div>
              <div><label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Primary Narrative Goal</label><input type="text" value={newStory.metadata.plot_goal} onChange={(e) => setNewStory({ ...newStory, metadata: { ...newStory.metadata, plot_goal: e.target.value } })} className="w-full p-4 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all" placeholder="e.g. Find the missing starship" /></div>
              <div><label className="block text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Foundational Premise</label><textarea value={newStory.description} onChange={(e) => setNewStory({ ...newStory, description: e.target.value })} className="w-full p-4 h-32 rounded-xl border border-stone-200 focus:border-stone-900 outline-none transition-all resize-none" placeholder="The world is cold, and the stars are going out..."></textarea></div>
              <button onClick={createStory} disabled={loading} className="w-full bg-stone-900 text-white font-bold py-5 rounded-2xl hover:bg-black transition-all shadow-lg flex justify-center items-center gap-2">{loading ? 'Forging...' : 'Forge the Foundation'}</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
