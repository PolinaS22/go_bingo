import React, { useState, useEffect } from 'react';
import { BingoCell } from '../../types/bingo';
import { compressImage, savePhoto, getPhoto } from '../../services/storage';
import styles from './CompletionModal.module.scss';
import { motion } from 'framer-motion';

interface CompletionModalProps {
  cell: BingoCell;
  onClose: () => void;
  onComplete: (photoId?: string) => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ cell, onClose, onComplete }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    if (cell.isCompleted && cell.photoId) {
      getPhoto(cell.photoId).then((blob) => {
        if (blob) {
          url = URL.createObjectURL(blob);
          setPhotoUrl(url);
        }
      });
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [cell.isCompleted, cell.photoId]);

  const handleComplete = async () => {
    let photoId = undefined;
    if (selectedFile) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(selectedFile);
        photoId = crypto.randomUUID();
        await savePhoto(photoId, compressed);
      } catch (e) {
        console.error('Photo processing failed', e);
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
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>{cell.title}</h2>
        <div className={styles.content}>
            {cell.description && <p className={styles.description}>{cell.description}</p>}
            
            {cell.reward && (
                <div className={styles.rewardSection}>
                    <h4>Reward</h4>
                    <p className={styles.rewardTitle}>
                        {cell.reward.isMystery && !cell.isCompleted ? '🎁 Mystery Reward' : cell.reward.title}
                    </p>
                    {(!cell.reward.isMystery || cell.isCompleted) && cell.reward.description && (
                        <p className={styles.rewardDesc}>{cell.reward.description}</p>
                    )}
                </div>
            )}

            {!cell.isCompleted ? (
              <div className={styles.actionArea}>
                <div className={styles.uploadBox}>
                    <label>
                        {selectedFile ? selectedFile.name : 'Choose Photo (Required if marked)'}
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
                            hidden
                        />
                    </label>
                </div>
                <button 
                  className={styles.completeBtn}
                  disabled={isCompressing || (cell.photoRequired && !selectedFile)} 
                  onClick={handleComplete}
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
                <button className={styles.closeBtn} onClick={onClose}>Done</button>
              </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};
