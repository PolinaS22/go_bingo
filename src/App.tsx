import { useState } from 'react';
import { useBingoStore } from './store/useBingoStore';
import { useBingoLogic } from './store/useBingoLogic';
import { ThemeWrapper } from './components/bingo/ThemeWrapper';
import { HomeView } from './views/HomeView';
import { EditorView } from './views/EditorView';
import { PlayView } from './views/PlayView';
import MemoriesView from './views/MemoriesView';
import { Home, PlusSquare, Play, Camera } from 'lucide-react';
import styles from './App.module.scss';

type View = 'home' | 'editor' | 'play' | 'memories';

function App() {
  const [view, setView] = useState<View>('home');
  const { currentCard } = useBingoLogic();
  const { currentCardId } = useBingoStore();

  const renderView = () => {
    switch (view) {
      case 'home':
        return (
          <HomeView 
            onCreateNew={() => setView('editor')} 
            onPlay={() => setView('play')} 
          />
        );
      case 'editor':
        return <EditorView onSave={() => setView('home')} />;
      case 'play':
        return <PlayView />;
      case 'memories':
        return <MemoriesView onBack={() => setView('home')} />;
      default:
        return <HomeView onCreateNew={() => setView('editor')} onPlay={() => setView('play')} />;
    }
  };

  return (
    <ThemeWrapper theme={currentCard?.theme as any}>
      <div className={styles.appContainer}>
        <main className={styles.content}>
          {renderView()}
        </main>

        <nav className={styles.navigation}>
          <button 
            className={view === 'home' ? styles.active : ''} 
            onClick={() => setView('home')}
          >
            <Home />
            <span>Home</span>
          </button>
          
          <button 
            className={view === 'editor' ? styles.active : ''} 
            onClick={() => setView('editor')}
          >
            <PlusSquare />
            <span>New</span>
          </button>

          <button 
            className={view === 'play' ? styles.active : ''} 
            onClick={() => setView('play')}
            disabled={!currentCardId}
            style={{ opacity: currentCardId ? 1 : 0.5 }}
          >
            <Play />
            <span>Play</span>
          </button>

          <button 
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
