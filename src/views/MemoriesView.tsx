import React, { useEffect, useState } from 'react';
import { useBingoStore } from '../store/useBingoStore';
import { getPhoto, downloadBackup, uploadBackup } from '../services/storage';
import styles from './MemoriesView.module.scss';
import { Camera, Download, Upload, Trash2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemoriesView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { cards, importBackup } = useBingoStore();
  const [photos, setPhotos] = useState<{ id: string; url: string; text: string }[]>([]);

  useEffect(() => {
    const loadPhotos = async () => {
      const allPhotos: { id: string; url: string; text: string }[] = [];
      for (const card of cards) {
        for (const cell of card.cells) {
          if (cell.photoId) {
            const blob = await getPhoto(cell.photoId);
            if (blob) {
              allPhotos.push({
                id: cell.photoId,
                url: URL.createObjectURL(blob),
                text: cell.text
              });
            }
          }
        }
      }
      setPhotos(allPhotos);
    };
    loadPhotos();
  }, [cards]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadBackup(file, importBackup);
      window.location.reload();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={onBack} className={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1>Memories</h1>
        <div className={styles.actions}>
          <label className={styles.actionButton}>
            <Upload size={20} />
            <input type="file" accept=".json" onChange={handleFileUpload} hidden />
          </label>
          <button onClick={downloadBackup} className={styles.actionButton}>
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
              <img src={photo.url} alt={photo.text} />
              <div className={styles.caption}>{photo.text}</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoriesView;
