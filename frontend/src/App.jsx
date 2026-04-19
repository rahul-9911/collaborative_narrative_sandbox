import React from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { NarrativeProvider, useNarrative } from './context/NarrativeContext';

// Layout & Views
import Header from './components/layout/Header';
import NavigationStrip from './components/navigation/NavigationStrip';
import DraftingModal from './components/modals/DraftingModal';
import AppRoutes from './AppRoutes';

const AppContent = () => {
  const location = useLocation();
  const { 
    stories, loading, currentStory, allChapters, startQuestAtNode,
    forkingNode, setForkingNode, prepareFork, forkChoices, handleChoice,
    customInput, setCustomInput, storyPath, isReadOnly, cancelDrafting,
    newStory, setNewStory, createStory, error, retryLastAction
  } = useNarrative();

  const isArcView = location.pathname.includes('/arc/');

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-stone-300 overflow-hidden font-sans">
      <DraftingModal />

      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
        {isArcView && <NavigationStrip />}
      </div>

      <main 
        id="sf-main-container" 
        className={`flex-1 relative overflow-y-auto h-screen bg-[#050505] transition-all duration-500
          ${isArcView ? 'pt-[152px]' : 'pt-24'}
        `}
      >
        <div key={location.pathname} className="p-12">
          {error && (
            <div className="max-w-2xl mx-auto mb-12 animate-sf-reveal">
              <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-6">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="font-black text-red-500 uppercase tracking-tight">The Void Resists</h3>
                    <p className="text-xs text-red-400/60 mt-1">{error}</p>
                  </div>
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

const App = () => (
  <NarrativeProvider>
    <AppContent />
  </NarrativeProvider>
);

export default App;
