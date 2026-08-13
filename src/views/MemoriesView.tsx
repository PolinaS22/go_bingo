import { useEffect, useState } from 'react';
import { useBingoStore } from '../store/useBingoStore';
import { downloadBackup, getPhoto, uploadBackup } from '../services/storage';
import styles from './MemoriesView.module.scss';
import { Camera, Download, Upload, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface MemoryPhoto {
  id: string;
  url: string;
  title: string;
  completedAt?: number;
}

interface MemoriesViewProps {
  onBack: () => void;
}

export const MemoriesView = ({ onBack }: MemoriesViewProps) => {
  const { cards, currentCardId, importBackup } = useBingoStore();
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const backup = await uploadBackup(file);
    importBackup(backup);
    event.target.value = '';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button type="button" onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1>Memories</h1>
        <div className={styles.actions}>
          <label className={styles.actionButton}>
            <Upload size={20} />
            <input type="file" accept=".json" onChange={(event) => void handleFileUpload(event)} hidden />
          </label>
          <button
            type="button"
            onClick={() => {
              void downloadBackup({ cards, currentCardId });
            }}
            className={styles.actionButton}
          >
            <Download size={20} />
          </button>
        </div>
      </header>

      {photos.length === 0 ? (
        <div className={styles.empty}>
          <Camera size={48} />
          <p>No memories yet. Complete challenges with photos to see them here!</p>
        </div>
      ) : (
        <div className={styles.masonry}>
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
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
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
