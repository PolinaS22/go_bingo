import { useEffect } from 'react';
import { useBingoStore } from './store/useBingoStore';
import { useBingoLogic } from './store/useBingoLogic';
import { BingoGrid } from './components/bingo/BingoGrid';
import { ThemeWrapper } from './components/bingo/ThemeWrapper';
import { BingoCard } from './types/bingo';

function App() {
  const { currentCard, toggleCell } = useBingoLogic();
  const { addCard, setCurrentCard } = useBingoStore();

  useEffect(() => {
    if (!currentCard) {
      const demoCard: BingoCard = {
        id: 'demo-card',
        title: 'Daily Habits Bingo',
        size: 3,
        difficulty: 'easy',
        theme: {
          id: 'modern-blue',
          name: 'Modern Blue',
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
          backgroundColor: '#f8fafc',
          textColor: '#1e293b',
        },
        cells: [
          { id: '1', text: 'Drink Water', isCompleted: false, position: 0 },
          { id: '2', text: 'Exercise', isCompleted: false, position: 1 },
          { id: '3', text: 'Read', isCompleted: false, position: 2 },
          { id: '4', text: 'Meditate', isCompleted: false, position: 3 },
          { id: '5', text: 'Walk', isCompleted: false, position: 4 },
          { id: '6', text: 'Code', isCompleted: false, position: 5 },
          { id: '7', text: 'Sleep 8h', isCompleted: false, position: 6 },
          { id: '8', text: 'Eat Healthy', isCompleted: false, position: 7 },
          { id: '9', text: 'Journal', isCompleted: false, position: 8 },
        ],
        createdAt: Date.now(),
      };
      addCard(demoCard);
      setCurrentCard(demoCard.id);
    }
  }, [currentCard, addCard, setCurrentCard]);

  if (!currentCard) return <div>Loading...</div>;

  return (
    <ThemeWrapper theme={currentCard.theme}>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--background-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <BingoGrid card={currentCard} onCellClick={toggleCell} />
      </div>
    </ThemeWrapper>
  );
}

export default App;
