import { useState } from 'react';
import { useBingoStore } from './store/useBingoStore';
import { useBingoLogic } from './store/useBingoLogic';
import { BingoGrid } from './components/bingo/BingoGrid';
import { ThemeWrapper } from './components/bingo/ThemeWrapper';
import MemoriesView from './views/MemoriesView';
import { Camera } from 'lucide-react';

function App() {
  const [view, setView] = useState<'play' | 'memories'>('play');
  const { currentCard, toggleCell } = useBingoLogic();
  const { addCard, setCurrentCard } = useBingoStore();

  if (view === 'memories') {
    return <MemoriesView onBack={() => setView('play')} />;
  }

  if (!currentCard) return <div>Loading...</div>;

  return (
    <ThemeWrapper theme={currentCard.theme}>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--background-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative'
      }}>
        <button 
          onClick={() => setView('memories')}
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <Camera size={24} />
        </button>
        <BingoGrid card={currentCard} onCellClick={toggleCell} />
      </div>
    </ThemeWrapper>
  );
}

export default App;
