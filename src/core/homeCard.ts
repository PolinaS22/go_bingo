import { BingoCard } from '../types/bingo';
import { pastelizeHex } from './cardAppearance';
import { hasCardProgress } from './defaults';

export type HomeCardStatus = 'draft' | 'active' | 'completed';

export interface CoverBlob {
  color: string;
  x: string;
  y: string;
  size: string;
}

export interface BlobCover {
  kind: 'blobs';
  base: string;
  blobs: CoverBlob[];
}

export interface ImageCover {
  kind: 'image';
  src: string;
}

export type CardCover = BlobCover | ImageCover;

const BLOB_PALETTES: BlobCover[] = [
  {
    kind: 'blobs',
    base: '#f7f0f8',
    blobs: [
      { color: '#f0dff0', x: '-10%', y: '5%', size: '72%' },
      { color: '#e4ebf7', x: '38%', y: '22%', size: '80%' },
      { color: '#f8e8e3', x: '8%', y: '58%', size: '64%' },
    ],
  },
  {
    kind: 'blobs',
    base: '#f2f7f6',
    blobs: [
      { color: '#e3f3ef', x: '5%', y: '-8%', size: '70%' },
      { color: '#ebe7f6', x: '42%', y: '28%', size: '78%' },
      { color: '#f8ebe2', x: '-5%', y: '55%', size: '60%' },
    ],
  },
  {
    kind: 'blobs',
    base: '#f9f4ef',
    blobs: [
      { color: '#f6e6e3', x: '20%', y: '0%', size: '75%' },
      { color: '#f6edd8', x: '-15%', y: '40%', size: '68%' },
      { color: '#ebe5f5', x: '45%', y: '50%', size: '72%' },
    ],
  },
  {
    kind: 'blobs',
    base: '#f2f5fa',
    blobs: [
      { color: '#e4edf7', x: '-8%', y: '10%', size: '76%' },
      { color: '#f0e6f2', x: '40%', y: '-5%', size: '64%' },
      { color: '#e6f2ec', x: '18%', y: '52%', size: '70%' },
    ],
  },
];

export function hashId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getHomeCardStatus(card: BingoCard): HomeCardStatus {
  if (card.completedAt !== undefined) {
    return 'completed';
  }
  if (card.isFrozen || hasCardProgress(card.cells)) {
    return 'active';
  }
  return 'draft';
}

function blobCoverFor(card: BingoCard): BlobCover {
  const palette = BLOB_PALETTES[hashId(card.id) % BLOB_PALETTES.length] ?? BLOB_PALETTES[0];
  const background = card.theme.globalBackground;
  const rawBase =
    background.type === 'color'
      ? background.value
      : card.theme.primaryColor || palette.base;

  return { ...palette, base: pastelizeHex(rawBase, 0.55) };
}

/** Home board cover — image only when the user picked one; otherwise pastel blobs. */
export function getCardCover(card: BingoCard): CardCover {
  const background = card.theme.globalBackground;
  if (background.type === 'image') {
    return { kind: 'image', src: background.value };
  }
  return blobCoverFor(card);
}

/** Play / editor bingo sheet — always pastel blobs (never the cover photo). */
export function getBingoSheetCover(card: BingoCard): BlobCover {
  return blobCoverFor(card);
}
