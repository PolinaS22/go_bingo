import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

import { BingoCell } from '../../types/bingo';
import { compressImage, savePhoto } from '../../services/storage';
import { isCellCompleted, isPhotoRecommended, isPhotoRequired } from '../../core/defaults';
import { usePhotoUrl } from '../../hooks/usePhotoUrl';

import styles from './CompletionModal.module.scss';

interface CompletionModalProps {
  cell: BingoCell;
  onClose: () => void;
  onComplete: (photoId?: string) => void;
}

const DIFFICULTY_LABEL = {
  NORMAL: 'Normal',
  HARD: 'Hard',
  GOLDEN: 'Golden',
} as const;

const MAX_BYTES = 10 * 1024 * 1024;

export const CompletionModal = ({ cell, onClose, onComplete }: CompletionModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCompleted = isCellCompleted(cell.completedAt);
  const photoUrl = usePhotoUrl(cell.photoId, isCompleted);
  const photoRequired = isPhotoRequired(cell.difficulty, cell.photoRequired);
  const photoRecommended = isPhotoRecommended(cell.difficulty, cell.photoRequired);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const applyFile = (file: File | undefined) => {
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please choose a JPG or PNG image');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Photo must be 10 MB or smaller');
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleComplete = async () => {
    if (photoRequired && !selectedFile) {
      return;
    }

    let photoId: string | undefined;
    if (selectedFile) {
      setIsCompressing(true);
      try {
        const compressed = await compressImage(selectedFile);
        photoId = crypto.randomUUID();
        await savePhoto(photoId, compressed);
      } catch {
        setError('Could not process this photo. Try another one.');
        setIsCompressing(false);
        return;
      } finally {
        setIsCompressing(false);
      }
    }
    onComplete(photoId);
  };

  const heading = photoRequired
    ? 'Photo required'
    : photoRecommended
      ? 'Photo recommended'
      : 'Add a photo';

  const subheading = photoRequired
    ? 'This challenge needs a photo'
    : photoRecommended
      ? 'A photo would make a lovely memory'
      : 'Optional — capture this moment';

  const canSubmit = !isCompressing && (!photoRequired || selectedFile !== null);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <motion.div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        onClick={(event) => event.stopPropagation()}
        initial={{ y: 36, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 24, opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div className={styles.wash} aria-hidden />
        <img className={styles.decorPearlTop} src="/assets/main/pearl_1.png" alt="" />
        <img className={styles.decorStar} src="/assets/main/star_1.png" alt="" />
        <img className={styles.decorPearlSide} src="/assets/main/pearl.png" alt="" />
        <img className={styles.decorShell} src="/assets/main/seashel_1.png" alt="" />
        <img className={styles.decorPearlBottom} src="/assets/main/pearl_2.png" alt="" />

        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
          <X size={20} strokeWidth={2} />
        </button>

        {!isCompleted ? (
          <>
            <div className={styles.heroIcon} aria-hidden>
              <span className={styles.heroRing}>
                <Camera size={28} strokeWidth={1.6} />
              </span>
              <img className={styles.heroStar} src="/assets/main/star_pearl.png" alt="" />
            </div>

            <h2 id="completion-title" className={styles.title}>
              {heading}
              <span className={styles.titleSpark} aria-hidden>
                ✦
              </span>
            </h2>
            <p className={styles.subtitle}>
              {subheading}
              <span className={styles.heart} aria-hidden>
                ♡
              </span>
            </p>

            <div className={styles.challenge}>
              {cell.icon ? (
                <img className={styles.challengeIcon} src={cell.icon} alt="" />
              ) : (
                <span className={styles.challengeIconFallback} aria-hidden>
                  ✦
                </span>
              )}
              <div className={styles.challengeBody}>
                <div className={styles.challengeTop}>
                  <span className={styles.challengeTitle}>{cell.title}</span>
                  <span
                    className={clsx(
                      styles.badge,
                      cell.difficulty === 'HARD' && styles.badgeHard,
                      cell.difficulty === 'GOLDEN' && styles.badgeGolden
                    )}
                  >
                    {DIFFICULTY_LABEL[cell.difficulty]}
                  </span>
                </div>
                {cell.description ? (
                  <p className={styles.challengeDesc}>{cell.description}</p>
                ) : null}
              </div>
            </div>

            <div className={styles.uploadBlock}>
              <p className={styles.uploadLabel}>Add a photo</p>
              <label
                className={clsx(
                  styles.dropzone,
                  dragOver && styles.dropzoneActive,
                  previewUrl && styles.dropzoneFilled
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(false);
                  applyFile(event.dataTransfer.files?.[0]);
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="" className={styles.preview} />
                ) : (
                  <>
                    <Upload size={26} strokeWidth={1.7} className={styles.uploadIcon} />
                    <span className={styles.dropTitle}>Tap to upload or drag and drop</span>
                    <span className={styles.dropHint}>JPG, PNG up to 10 MB</span>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  hidden
                  onChange={(event) => {
                    applyFile(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
              </label>
              {error ? <p className={styles.error}>{error}</p> : null}
              {previewUrl ? (
                <button
                  type="button"
                  className={styles.changePhoto}
                  onClick={() => inputRef.current?.click()}
                >
                  Choose another photo
                </button>
              ) : null}
            </div>

            <div className={styles.tips}>
              <div className={styles.tipsCopy}>
                <p className={styles.tipsTitle}>
                  Photo tips
                  <span aria-hidden> ✦</span>
                </p>
                <p>Make sure your photo is clear and in focus</p>
                <p>Show the food or place in your photo</p>
              </div>
              <div className={styles.polaroid} aria-hidden>
                <span className={styles.polaroidShot} />
              </div>
            </div>

            <button
              type="button"
              className={styles.submit}
              disabled={!canSubmit}
              onClick={() => {
                void handleComplete();
              }}
            >
              {isCompressing ? 'Processing…' : selectedFile || photoRequired ? 'Submit photo' : 'Complete'}
              {!isCompressing ? <span aria-hidden> ✦</span> : null}
            </button>

            <button type="button" className={styles.later} onClick={onClose}>
              I&apos;ll do it later
            </button>
          </>
        ) : (
          <div className={styles.done}>
            <h2 id="completion-title" className={styles.title}>
              Memory saved
              <span className={styles.titleSpark} aria-hidden>
                ✦
              </span>
            </h2>
            <p className={styles.subtitle}>{cell.title}</p>
            {photoUrl ? (
              <img src={photoUrl} className={styles.donePhoto} alt="" />
            ) : (
              <div className={styles.doneEmpty}>No photo for this challenge</div>
            )}
            <button type="button" className={styles.submit} onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
