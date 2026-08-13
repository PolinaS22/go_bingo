import { useState } from 'react';
import { useBingoStore } from './store/useBingoStore';
import { useBingoLogic } from './store/useBingoLogic';
import { ThemeWrapper } from './components/bingo/ThemeWrapper';
import { HomeView } from './views/HomeView';
import { EditorView } from './views/EditorView';
import { PlayView } from './views/PlayView';
import { MemoriesView } from './views/MemoriesView';
import { Home, PlusSquare, Play, Camera } from 'lucide-react';
import styles from './App.module.scss';

type View = 'home' | 'editor' | 'play' | 'memories';

function App() {
  const [view, setView] = useState<View>('home');
  const [editorCardId, setEditorCardId] = useState<string | null>(null);
  const { currentCard } = useBingoLogic();
  const { currentCardId } = useBingoStore();

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

  return (
    <ThemeWrapper theme={currentCard?.theme}>
      <div className={styles.appContainer}>
        <main className={styles.content}>
          {renderView()}
        </main>

        <nav className={styles.navigation}>
          <button
            type="button"
            className={view === 'home' ? styles.active : ''}
            onClick={() => setView('home')}
          >
            <Home />
            <span>Home</span>
          </button>

          <button
            type="button"
            className={view === 'editor' ? styles.active : ''}
            onClick={openNewEditor}
          >
            <PlusSquare />
            <span>New</span>
          </button>

          <button
            type="button"
            className={view === 'play' ? styles.active : ''}
            onClick={() => setView('play')}
            disabled={!currentCardId}
            style={{ opacity: currentCardId ? 1 : 0.5 }}
          >
            <Play />
            <span>Play</span>
          </button>

          <button
            type="button"
            className={view === 'memories' ? styles.active : ''}
            onClick={() => setView('memories')}
          >
            <Camera />
            <span>Memories</span>
          </button>
        </nav>
      </div>
    </ThemeWrapper>
  );
}

export default App;
