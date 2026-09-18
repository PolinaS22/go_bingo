import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Pencil, Plus, RotateCcw, Star, Trash2 } from 'lucide-react'

import { cardAccentColor } from '../../core/cardAppearance'
import { hasCardProgress } from '../../core/defaults'
import { getCardCover, getHomeCardStatus } from '../../core/homeCard'
import { getCardStats } from '../../core/stats'
import { BingoCard } from '../../types/bingo'

import styles from './BingoPreviewCard.module.scss'

const cornerStarSrc = `${import.meta.env.BASE_URL}assets/main/star_pearl.png`

const STATUS_LABEL: Record<ReturnType<typeof getHomeCardStatus>, string> = {
  active: 'Active',
  draft: 'Draft',
  completed: 'Completed',
}

export const HomeCardFace = ({ card }: { card: BingoCard }) => {
  const cover = getCardCover(card)
  const status = getHomeCardStatus(card)
  const stats = getCardStats(card)
  const progress =
    stats.playableCount === 0 ? 0 : Math.round((stats.completedCount / stats.playableCount) * 100)
  const accent = cardAccentColor(card.theme.primaryColor)

  return (
    <span
      className={styles.face}
      style={{
        background: `linear-gradient(165deg, #ffffff 0%, ${card.theme.primaryColor}4D 100%)`,
      }}
    >
      <span className={styles.top}>
        <span className={styles.title}>{card.title}</span>
        <img className={styles.cornerStar} src={cornerStarSrc} alt="" />
      </span>

      <span className={styles.media}>
        {cover.kind === 'image' ? (
          <img className={styles.photo} src={cover.src} alt="" />
        ) : (
          <span className={styles.blobs} style={{ background: cover.base }}>
            {cover.blobs.map((blob) => (
              <span
                key={`${blob.color}-${blob.x}-${blob.y}`}
                className={styles.blob}
                style={{
                  background: blob.color,
                  width: blob.size,
                  height: blob.size,
                  left: blob.x,
                  top: blob.y,
                }}
              />
            ))}
          </span>
        )}
        <span className={clsx(styles.badge, styles[`badge-${status}`])}>
          {STATUS_LABEL[status]}
        </span>
      </span>

      <span className={styles.progressRow}>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.fill} style={{ width: `${progress}%`, background: accent }} />
        </span>
        <span className={styles.progressLabel}>
          {stats.completedCount} / {stats.playableCount}
        </span>
      </span>

      <span className={styles.meta}>
        <span>
          <Star size={13} />
          {stats.lineCount} {stats.lineCount === 1 ? 'Bingo' : 'Bingos'}
        </span>
        <span>
          <Star size={13} fill="currentColor" className={styles.golden} />
          {stats.goldenCount} Golden
        </span>
      </span>
    </span>
  )
}

export const HomeCardPreview = ({ card }: { card: BingoCard }) => {
  return (
    <article className={styles.card}>
      <div className={styles.play}>
        <HomeCardFace card={card} />
      </div>
    </article>
  )
}

interface BingoPreviewCardProps {
  card: BingoCard
  menuOpen: boolean
  onPlay: () => void
  onEdit: () => void
  onReset: () => void
  onDelete: () => void
  onToggleMenu: () => void
  onCloseMenu: () => void
}

export const BingoPreviewCard = ({
  card,
  menuOpen,
  onPlay,
  onEdit,
  onReset,
  onDelete,
  onToggleMenu,
  onCloseMenu,
}: BingoPreviewCardProps) => {
  const canReset = hasCardProgress(card.cells)
  const menuRef = useRef<HTMLDivElement>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  useEffect(() => {
    if (!menuOpen) {
      setConfirmingDelete(false)
      return
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node) || menuRef.current?.contains(target)) {
        return
      }
      onCloseMenu()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseMenu()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen, onCloseMenu])

  return (
    <article className={clsx(styles.card, menuOpen && styles.cardMenuOpen)}>
      <button type="button" className={styles.play} onClick={onPlay} aria-label={card.title}>
        <HomeCardFace card={card} />
      </button>

      <div className={styles.menu} ref={menuRef}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label={`Actions for ${card.title}`}
          aria-expanded={menuOpen}
          onClick={onToggleMenu}
        />
        {menuOpen ? (
          <div className={styles.menuPanel} role="menu">
            <button type="button" role="menuitem" onClick={onEdit}>
              <Pencil size={14} />
              Edit look
            </button>
            {canReset ? (
              <button type="button" role="menuitem" onClick={onReset}>
                <RotateCcw size={14} />
                Reset
              </button>
            ) : null}
            {confirmingDelete ? (
              <button type="button" role="menuitem" className={styles.danger} onClick={onDelete}>
                <Trash2 size={14} />
                Delete forever
              </button>
            ) : (
              <button
                type="button"
                role="menuitem"
                className={styles.danger}
                onClick={() => setConfirmingDelete(true)}
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}

interface CreateBingoCardProps {
  onCreate: () => void
}

export const CreateBingoCard = ({ onCreate }: CreateBingoCardProps) => {
  return (
    <button type="button" className={styles.createCard} onClick={onCreate}>
      <span className={styles.createGlow}>
        <Plus size={28} strokeWidth={2.2} />
      </span>
      <span className={styles.createLabel}>Create New Bingo</span>
    </button>
  )
}
