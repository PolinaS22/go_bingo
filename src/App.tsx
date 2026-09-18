import { useState } from 'react';
import { ThemeWrapper } from './components/bingo/ThemeWrapper';
import { AppNav } from './components/layout/AppNav';
import { useBingoLogic } from './store/useBingoLogic';
import { EditorView } from './views/EditorView';
import { HomeView } from './views/HomeView';
import { MemoriesView } from './views/MemoriesView';
import { PlayView } from './views/PlayView';
import styles from './App.module.scss';

type View = 'home' | 'editor' | 'play' | 'memories';

function App() {
  const [view, setView] = useState<View>('home');
  const [editorCardId, setEditorCardId] = useState<string | null>(null);
  const { currentCard } = useBingoLogic();

  const openNewEditor = () => {
    setEditorCardId(null);
    setView('editor');
  };

  const openEditor = (cardId: string) => {
    setEditorCardId(cardId);
    setView('editor');
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <HomeView
            onCreateNew={openNewEditor}
            onPlay={() => setView('play')}
            onEdit={openEditor}
          />
        );
      case 'editor':
        return (
          <EditorView
            onSave={() => setView('home')}
            onBack={() => setView('home')}
            cardId={editorCardId}
          />
        );
      case 'play':
        return <PlayView onMemories={() => setView('memories')} />;
      case 'memories':
        return <MemoriesView onBack={() => setView('home')} />;
      default: {
        const _exhaustive: never = view;
        return _exhaustive;
      }
    }
  };

  const navActive = view === 'home' || view === 'memories' ? view : null;

  return (
    <ThemeWrapper theme={currentCard?.theme}>
      <div className={styles.appContainer}>
        <AppNav
          active={navActive}
          onHome={() => setView('home')}
          onMemories={() => setView('memories')}
        />
        <main className={styles.content}>
          {renderView()}
        </main>
      </div>
    </ThemeWrapper>
  );
}

export default App;
