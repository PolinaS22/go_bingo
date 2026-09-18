import { useEffect, useMemo, useState } from 'react';
import { useBingoStore } from '../store/useBingoStore';
import { getPhoto } from '../services/storage';
import {
  downloadBingoCardImage,
  downloadMemoryPhotosZip,
  downloadPhotoFile,
} from '../core/exportMemories';
import styles from './MemoriesView.module.scss';
import { Archive, Camera, ImageDown, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface MemoryPhoto {
  id: string;
  cardId: string;
  cardTitle: string;
  url: string;
  title: string;
  completedAt?: number;
}

interface MemoriesViewProps {
  onBack: () => void;
}

export const MemoriesView = ({ onBack }: MemoriesViewProps) => {
  const { cards } = useBingoStore();
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);
  const [busy, setBusy] = useState(false);

  const completedCards = useMemo(
    () => cards.filter((card) => card.completedAt !== undefined),
    [cards]
  );

  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];

    const loadPhotos = async () => {
      const loaded: MemoryPhoto[] = [];

      for (const card of cards) {
        for (const cell of card.cells) {
          if (!cell.photoId) {
            continue;
          }

          const blob = await getPhoto(cell.photoId);
          if (!blob) {
            continue;
          }

          const url = URL.createObjectURL(blob);
          objectUrls.push(url);

          if (cancelled) {
            URL.revokeObjectURL(url);
            continue;
          }

          loaded.push({
            id: cell.photoId,
            cardId: card.id,
            cardTitle: card.title,
            url,
            title: cell.title,
            completedAt: cell.completedAt,
          });
        }
      }

      if (!cancelled) {
        setPhotos(loaded);
      }
    };

    void loadPhotos();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [cards]);

  const handleZipDownload = async () => {
    setBusy(true);
    try {
      await downloadMemoryPhotosZip(cards);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1>Memories</h1>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionButton}
            aria-label="Download photos as zip"
            title="Download photos as zip"
            disabled={busy || photos.length === 0}
            onClick={() => {
              void handleZipDownload();
            }}
          >
            <Archive size={20} />
          </button>
        </div>
      </header>

      {completedCards.length > 0 ? (
        <section className={styles.exports}>
          <h2>Completed bingo</h2>
          <p>Save the finished card as an image — cells and photos as you see them.</p>
          <ul className={styles.exportList}>
            {completedCards.map((card) => (
              <li key={card.id}>
                <span>{card.title}</span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void downloadBingoCardImage(card).finally(() => setBusy(false));
                  }}
                >
                  <ImageDown size={16} />
                  Save image
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {photos.length === 0 ? (
        <div className={styles.empty}>
          <Camera size={48} />
          <p>No memories yet. Complete challenges with photos to see them here!</p>
        </div>
      ) : (
        <div className={styles.masonry}>
          {photos.map((photo, index) => (
            <motion.div
              key={`${photo.cardId}-${photo.id}`}
              className={styles.item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <img src={photo.url} alt={photo.title} />
              <div className={styles.caption}>
                <span>{photo.title}</span>
                {photo.completedAt !== undefined && (
                  <time dateTime={new Date(photo.completedAt).toISOString()}>
                    {new Date(photo.completedAt).toLocaleDateString()}
                  </time>
                )}
                <button
                  type="button"
                  className={styles.downloadOne}
                  onClick={() => {
                    void downloadPhotoFile(photo.id, photo.title);
                  }}
                >
                  Download
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
