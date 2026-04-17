import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { PenTool, Info } from 'lucide-react';
import HomeView from './views/HomeView';
import LibraryView from './views/LibraryView';
import QuestView from './views/QuestView';
import BranchesView from './views/BranchesView';

const AppRoutes = ({ 
  stories, 
  loadWorldBranches, 
  loading,
  currentStory,
  allChapters,
  startQuestAtNode,
  forkingNode,
  setForkingNode,
  prepareFork,
  forkChoices,
  handleChoice,
  customInput,
  setCustomInput,
  storyPath,
  isReadOnly,
  cancelDrafting,
  newStory,
  setNewStory,
  createStory
}) => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<HomeView setView={(v) => navigate(`/${v}`)} />} />
      <Route path="/home" element={<HomeView setView={(v) => navigate(`/${v}`)} />} />
      <Route path="/library" element={<LibraryView stories={stories} setView={(v) => navigate(`/${v}`)} loadWorldBranches={loadWorldBranches} loading={loading} />} />
      <Route path="/world/:slug" element={
        <BranchesView 
          currentStory={currentStory} allChapters={allChapters} startQuestAtNode={startQuestAtNode}
          forkingNode={forkingNode} setForkingNode={setForkingNode} prepareFork={prepareFork}
          loading={loading} forkChoices={forkChoices} handleChoice={handleChoice}
          customInput={customInput} setCustomInput={setCustomInput}
          cancelDrafting={cancelDrafting}
        />
      } />
      <Route path="/world/:slug/arc/:id" element={
        <QuestView 
          currentStory={currentStory} storyPath={storyPath} loading={loading}
          handleChoice={handleChoice}
          customInput={customInput} setCustomInput={setCustomInput} setView={(v) => navigate(`/${v}`)}
          isReadOnly={isReadOnly} prepareFork={prepareFork}
          cancelDrafting={cancelDrafting}
        />
      } />
      <Route path="/architect" element={
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
      } />
      <Route path="*" element={<Navigate to="/library" replace />} />
    </Routes>
  );
};

export default AppRoutes;
