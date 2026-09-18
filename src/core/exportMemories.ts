import { toPng } from 'html-to-image';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';

import { BingoCardSheet } from '../components/bingo/BingoCardSheet';
import { getCompletedLines } from './engine';
import { isCellCompleted } from './defaults';
import { getPhoto } from '../services/storage';
import { BingoCard } from '../types/bingo';
import { blobToUint8Array, buildZip } from './zip';

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function safeFileName(value: string): string {
  return value.replace(/[^\w\-]+/g, '_').replace(/^_+|_+$/g, '') || 'bingo';
}

export async function downloadMemoryPhotosZip(
  cards: BingoCard[],
  filename = `bingo-memories-${new Date().toISOString().slice(0, 10)}.zip`
): Promise<number> {
  const entries: { name: string; data: Uint8Array }[] = [];
  const usedNames = new Set<string>();

  for (const card of cards) {
    const folder = safeFileName(card.title);
    let photoIndex = 0;

    for (const cell of card.cells) {
      if (!cell.photoId) {
        continue;
      }
      const blob = await getPhoto(cell.photoId);
      if (!blob) {
        continue;
      }

      photoIndex += 1;
      let name = `${folder}/${photoIndex}-${safeFileName(cell.title) || 'photo'}.jpg`;
      if (usedNames.has(name)) {
        name = `${folder}/${photoIndex}-${cell.photoId}.jpg`;
      }
      usedNames.add(name);
      entries.push({ name, data: await blobToUint8Array(blob) });
    }
  }

  if (entries.length === 0) {
    return 0;
  }

  triggerDownload(buildZip(entries), filename);
  return entries.length;
}

export async function downloadPhotoFile(photoId: string, title: string): Promise<boolean> {
  const blob = await getPhoto(photoId);
  if (!blob) {
    return false;
  }
  triggerDownload(blob, `${safeFileName(title) || 'memory'}.jpg`);
  return true;
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const deadline = Date.now() + 4000;

  while (Date.now() < deadline) {
    const images = Array.from(root.querySelectorAll('img'));
    const pending = images.filter((image) => !image.complete || image.naturalWidth === 0);
    if (pending.length === 0 && images.length > 0) {
      break;
    }
    if (images.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      continue;
    }
    await Promise.all(
      pending.map(
        (image) =>
          new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
            setTimeout(() => resolve(), 500);
          })
      )
    );
  }
}

/** Capture the completed bingo card as a PNG (cells + photos as shown in play). */
export async function downloadBingoCardImage(card: BingoCard): Promise<void> {
  const completedPositions = card.cells
    .filter((cell) => isCellCompleted(cell.completedAt))
    .map((cell) => cell.position);
  const completedLines = getCompletedLines(completedPositions, card.size);

  const host = document.createElement('div');
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;width:720px;padding:16px;background:#f7f1e8;z-index:-1;';
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(
    createElement(BingoCardSheet, {
      card,
      completedLines,
      onCellClick: () => undefined,
      variant: 'play',
    })
  );

  try {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await waitForImages(host);

    const sheet = host.querySelector('article');
    if (!(sheet instanceof HTMLElement)) {
      throw new Error('Bingo sheet not found');
    }

    const dataUrl = await toPng(sheet, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    triggerDownload(blob, `${safeFileName(card.title)}-bingo.png`);
  } finally {
    root.unmount();
    host.remove();
  }
}
