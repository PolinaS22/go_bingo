import { useState } from 'react';
import { BingoCell } from '../../types/bingo';
import { compressImage, savePhoto } from '../../services/storage';
import { isCellCompleted, isPhotoRecommended, isPhotoRequired } from '../../core/defaults';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';
import styles from './CompletionModal.module.scss';
import { motion } from 'framer-motion';

interface CompletionModalProps {
  cell: BingoCell;
  onClose: () => void;
  onComplete: (photoId?: string) => void;
}

export const CompletionModal = ({ cell, onClose, onComplete }: CompletionModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const isCompleted = isCellCompleted(cell.completedAt);
  const photoUrl = usePhotoUrl(cell.photoId, isCompleted);
  const photoRequired = isPhotoRequired(cell.difficulty, cell.photoRequired);
  const photoRecommended = isPhotoRecommended(cell.difficulty, cell.photoRequired);
  const photoLabel = selectedFile
    ? selectedFile.name
    : photoRequired
      ? 'Photo required to complete'
      : photoRecommended
        ? 'Photo recommended'
        : 'Add a photo (optional)';

  const handleComplete = async () => {
    let photoId: string | undefined;
    if (selectedFile) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(selectedFile);
        photoId = crypto.randomUUID();
        await savePhoto(photoId, compressed);
      } catch (error) {
        console.error('Photo processing failed', error);
      } finally {
        setIsCompressing(false);
      }
    }
    onComplete(photoId);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <button type="button" className={styles.closeButton} onClick={onClose}>×</button>
        <h2>{cell.title}</h2>
        <div className={styles.content}>
          {cell.description && <p className={styles.description}>{cell.description}</p>}

          {cell.reward && (
            <div className={styles.rewardSection}>
              <h4>Reward</h4>
              <p className={styles.rewardTitle}>
                {cell.reward.isMystery && !isCompleted ? '🎁 Mystery Reward' : cell.reward.title}
              </p>
              {(!cell.reward.isMystery || isCompleted) && cell.reward.description && (
                <p className={styles.rewardDesc}>{cell.reward.description}</p>
              )}
            </div>
          )}

          {!isCompleted ? (
            <div className={styles.actionArea}>
              <div className={styles.uploadBox}>
                <label>
                  {photoLabel}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    hidden
                  />
                </label>
              </div>
              <button
                type="button"
                className={styles.completeBtn}
                disabled={isCompressing || (photoRequired && !selectedFile)}
                onClick={() => {
                  void handleComplete();
                }}
              >
                {isCompressing ? 'Processing...' : 'Complete Challenge'}
              </button>
            </div>
          ) : (
            <div className={styles.previewArea}>
              {photoUrl ? (
                <img src={photoUrl} className={styles.photo} alt="Memory" />
              ) : (
                <div className={styles.photoPlaceholder}>No photo uploaded</div>
              )}
              <button type="button" className={styles.closeBtn} onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
