import { useCallback, useState } from 'react';
import { Plus } from 'lucide-react';
import { BingoPreviewCard, CreateBingoCard } from '../components/home/BingoPreviewCard';
import { deletePhoto } from '../services/storage';
import { useBingoStore } from '../store/useBingoStore';
import styles from './HomeView.module.scss';

interface HomeViewProps {
  onCreateNew: () => void;
  onPlay: () => void;
  onEdit: (cardId: string) => void;
}

export const HomeView = ({ onCreateNew, onPlay, onEdit }: HomeViewProps) => {
  const { cards, setCurrentCard, deleteCard, resetCard } = useBingoStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const closeMenu = useCallback(() => setOpenMenuId(null), []);

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

  const bingoLabel = cards.length === 1 ? 'bingo' : 'bingos';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>
            My Bingos
            <span className={styles.titleSparkle} aria-hidden="true" />
          </h1>
          <p className={styles.count}>
            {cards.length} {bingoLabel}
          </p>
        </div>

        <button type="button" className={styles.newButton} onClick={onCreateNew}>
          <Plus size={16} strokeWidth={2.4} />
          <span>New Bingo</span>
        </button>
      </header>

      {cards.length === 0 ? (
        <p className={styles.emptyHint}>No bingo cards yet. Create one to start playing!</p>
      ) : null}

      <div className={styles.grid}>
        {cards.map((card) => (
          <BingoPreviewCard
            key={card.id}
            card={card}
            menuOpen={openMenuId === card.id}
            onPlay={() => handlePlay(card.id)}
            onEdit={() => {
              closeMenu();
              onEdit(card.id);
            }}
            onReset={() => {
              closeMenu();
              void handleReset(card.id);
            }}
            onDelete={() => {
              closeMenu();
              void handleDelete(card.id);
            }}
            onToggleMenu={() =>
              setOpenMenuId((current) => (current === card.id ? null : card.id))
            }
            onCloseMenu={closeMenu}
          />
        ))}
        <CreateBingoCard onCreate={onCreateNew} />
      </div>
    </div>
  );
};
