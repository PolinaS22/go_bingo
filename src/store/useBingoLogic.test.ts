import { describe, it, expect, beforeEach } from 'vitest';
import { useBingoStore } from './useBingoStore';
import { useBingoLogic } from './useBingoLogic';
import { renderHook, act } from '@testing-library/react';

describe('useBingoLogic', () => {
  beforeEach(() => {
    useBingoStore.setState({
      cards: [
        {
          id: '1',
          title: 'Test Bingo',
          size: 2,
          difficulty: 'easy',
          theme: {
            id: 't1',
            name: 'Test',
            primaryColor: '#000',
            secondaryColor: '#fff',
            backgroundColor: '#eee',
            textColor: '#000',
          },
          createdAt: Date.now(),
          cells: [
            { id: 'c1', text: 'Cell 1', isCompleted: false, position: 0 },
            { id: 'c2', text: 'Cell 2', isCompleted: false, position: 1 },
            { id: 'c3', text: 'Cell 3', isCompleted: false, position: 2 },
            { id: 'c4', text: 'Cell 4', isCompleted: false, position: 3 },
          ]
        }
      ],
      currentCardId: '1',
    });
  });

  it('detects bingo when line is completed', () => {
    const { result } = renderHook(() => useBingoLogic());
    
    expect(result.current.isBingo).toBe(false);
    
    act(() => {
      result.current.toggleCell('c1');
    });
    expect(result.current.isBingo).toBe(false);

    act(() => {
      result.current.toggleCell('c2');
    });
    
    expect(result.current.isBingo).toBe(true);
  });
});
