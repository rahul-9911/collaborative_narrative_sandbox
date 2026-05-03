import React, { createContext, useContext, useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api.service';

const NarrativeContext = createContext();

export const NarrativeProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);

  // --- STATE ---
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

  // --- UTILS ---
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

  // --- HANDLERS ---
  const createStory = async () => {
    if (!newStory.title || !newStory.description) return alert('Please fill in title and description.');
    setLoading(true);
    setError(null);
    try {
      const story = await api.createStory(newStory);
      await fetchStories();
      setCurrentStory(story);
      // Immediately start the first chapter generation
      await startQuestAtNode(story, null);
      setNewStory({ title: '', description: '', metadata: { genre: 'Fantasy', tone: 'Epic', plot_goal: '' } });
    } catch (err) {
      setError(err.message);
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
        const chapters = await api.getChapters(story.id);
        setAllChapters(chapters);
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

  // --- EFFECTS ---
  useLayoutEffect(() => {
    const mainContainer = document.getElementById('sf-main-container');
    if (mainContainer) mainContainer.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const path = pathParts[1] || 'home';
    setError(null);

    if (path === 'world') {
      if (!pathParts[2]) return navigate('/library');

      const loadData = async () => {
        try {
          if (!currentStory || currentStory.slug !== pathParts[2] || allChapters.length === 0) {
            setLoading(true);
            const story = currentStory?.slug === pathParts[2] ? currentStory : await api.getStoryBySlug(pathParts[2]);
            if (!story) throw new Error("Seed not found.");
            setCurrentStory(story);
            const chapters = await api.getChapters(story.id);
            setAllChapters(chapters);

            if (pathParts[3] === 'arc' && pathParts[4]) {
              reconstructPath(chapters, pathParts[4]);
            } else {
              setStoryPath([]);
              setIsReadOnly(true);
            }
          } else if (pathParts[3] === 'arc' && pathParts[4]) {
            const targetId = pathParts[4];
            const currentId = storyPath.length > 0 ? String(storyPath[storyPath.length - 1].id) : null;
            if (String(targetId) !== String(currentId)) reconstructPath(allChapters, targetId);
          } else if (pathParts[3] !== 'arc') {
            setStoryPath([]);
            setIsReadOnly(true);
          }
        } catch (err) {
          setError(err.message);
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

  useEffect(() => { fetchStories(); }, []);

  const adjacent = useMemo(() => {
    const pathParts = location.pathname.split('/');
    const arcId = pathParts[3] === 'arc' ? pathParts[4] : null;
    if (!arcId || allChapters.length === 0) return { prev: null, next: [] };
    const cleanId = String(arcId).trim().toLowerCase();
    const current = allChapters.find(c => String(c.id).trim().toLowerCase() === cleanId);
    return {
      current,
      prev: current?.parent_id ? String(current.parent_id).trim().toLowerCase() : null,
      next: allChapters
        .filter(c => c.parent_id && String(c.parent_id).trim().toLowerCase() === cleanId)
        .map(c => ({ id: String(c.id).trim().toLowerCase(), title: c.title || 'Untitled' }))
    };
  }, [location.pathname, allChapters]);

  const value = {
    isReadOnly, setIsReadOnly, stories, currentStory, allChapters, storyPath, loading, error, forkingNode, forkChoices,
    customInput, setCustomInput, selectedModalChoice, setSelectedModalChoice, modalPacing, setModalPacing,
    isSwitcherOpen, setIsSwitcherOpen, newStory, setNewStory, adjacent,
    createStory, startQuestAtNode, handleChoice, prepareFork, cancelDrafting, retryLastAction
  };

  return <NarrativeContext.Provider value={value}>{children}</NarrativeContext.Provider>;
};

export const useNarrative = () => useContext(NarrativeContext);
