import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { BingoCell as BingoCellType } from '../../types/bingo'
import { getPhoto } from '../../services/storage'
import styles from './BingoCell.module.scss'

interface BingoCellProps {
  cell: BingoCellType
  onClick: (id: string) => void
  isGolden?: boolean
}

export const BingoCell: React.FC<BingoCellProps> = ({ cell, onClick, isGolden }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const isCompleted = cell.isCompleted || !!cell.completedAt
  const effectiveDifficulty = isGolden ? 'GOLDEN' : cell.difficulty || 'NORMAL'

  useEffect(() => {
    let url: string | null = null
    if (isCompleted && cell.photoId) {
      getPhoto(cell.photoId).then((blob) => {
        if (blob) {
          url = URL.createObjectURL(blob)
          setPhotoUrl(url)
        }
      })
    }
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [isCompleted, cell.photoId])

  const customStyle: React.CSSProperties = {}
  if (cell.customBackground) {
    if (cell.customBackground.type === 'color' || cell.customBackground.type === 'gradient') {
      customStyle.background = cell.customBackground.value
    } else if (cell.customBackground.type === 'image') {
      customStyle.backgroundImage = `url(${cell.customBackground.value})`
    }
  } else if (cell.customImage) {
    customStyle.backgroundImage = `url(${cell.customImage})`
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={clsx(styles.cell, {
        [styles.completed]: isCompleted,
        [styles.difficultyNormal]: effectiveDifficulty === 'NORMAL',
        [styles.difficultyHard]: effectiveDifficulty === 'HARD',
        [styles.difficultyGolden]: effectiveDifficulty === 'GOLDEN',
        [styles.hasCustomBackground]: !!(cell.customBackground || cell.customImage),
      })}
      style={customStyle}
      onClick={() => onClick(cell.id)}
      role="button"
      aria-pressed={isCompleted}
    >
      {photoUrl && isCompleted && (
        <img src={photoUrl} className={styles.photoBackground} alt="" />
      )}

      <div className={styles.content}>
        {cell.icon && <span className={styles.icon}>{cell.icon}</span>}
        {cell.title && <span className={styles.title}>{cell.title}</span>}
        <span className={styles.text}>{cell.text || cell.description}</span>
      </div>
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={styles.overlay}
          >
            <div className={styles.checkMark}>✓</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
