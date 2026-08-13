import { useBingoStore } from '../store/useBingoStore';
import { hasCardProgress, isCellCompleted } from '../core/defaults';
import { deletePhoto } from '../services/storage';
import styles from './HomeView.module.scss';

interface HomeViewProps {
  onCreateNew: () => void;
  onPlay: () => void;
  onEdit: (cardId: string) => void;
}

export const HomeView = ({ onCreateNew, onPlay, onEdit }: HomeViewProps) => {
  const { cards, setCurrentCard, deleteCard, resetCard } = useBingoStore();

  const handlePlay = (cardId: string) => {
    setCurrentCard(cardId);
    onPlay();
  };

  const handleDelete = async (cardId: string) => {
    const card = cards.find((item) => item.id === cardId);
    if (!card) {
      return;
    }

    const photoIds = card.cells
      .map((cell) => cell.photoId)
      .filter((photoId): photoId is string => photoId !== undefined);

    deleteCard(cardId);
    await Promise.all(photoIds.map((photoId) => deletePhoto(photoId)));
  };

  const handleReset = async (cardId: string) => {
    const card = cards.find((item) => item.id === cardId);
    if (!card) {
      return;
    }

    const photoIds = card.cells
      .map((cell) => cell.photoId)
      .filter((photoId): photoId is string => photoId !== undefined);

    resetCard(cardId);
    await Promise.all(photoIds.map((photoId) => deletePhoto(photoId)));
  };

  return (
    <div className={styles.container}>
      <h1>My Bingo Cards</h1>

      {cards.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No bingo cards yet. Create one to start playing!</p>
          <button type="button" className={styles.createButton} onClick={onCreateNew}>
            Create New Bingo
          </button>
        </div>
      ) : (
        <div className={styles.cardList}>
          {cards.map((card) => {
            const completedCount = card.cells.filter((cell) =>
              isCellCompleted(cell.completedAt)
            ).length;

            return (
              <div key={card.id} className={styles.cardItem}>
                <div className={styles.cardHeader}>
                  <button
                    type="button"
                    className={styles.cardMain}
                    onClick={() => handlePlay(card.id)}
                  >
                    <h3>{card.title}</h3>
                    <p>
                      {completedCount}/{card.cells.length} completed
                    </p>
                    {card.isFrozen && <span className={styles.frozenBadge}>In play</span>}
                  </button>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.iconButton}
                      onClick={() => onEdit(card.id)}
                    >
                      {card.isFrozen ? 'View' : 'Edit'}
                    </button>
                    {hasCardProgress(card.cells) && (
                      <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => {
                          void handleReset(card.id);
                        }}
                      >
                        Reset
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.iconButtonDanger}
                      onClick={() => {
                        void handleDelete(card.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" className={styles.createButton} onClick={onCreateNew}>
            Create New Bingo
          </button>
        </div>
      )}
    </div>
  );
};
