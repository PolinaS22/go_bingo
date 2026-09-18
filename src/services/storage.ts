import { get, set, del, entries } from 'idb-keyval';
import { BackupPayload, PersistedBingoState } from '../types/bingo';
import { createBackupPayload, parseBackup } from '../core/backup';

const PHOTO_KEY_PREFIX = 'photo-';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('File reading failed'));
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('File reading failed'));
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(blob);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('File reading failed'));
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsText(file);
  });
}

export async function compressImage(file: File): Promise<Blob> {
  const dataUrl = await readFileAsDataUrl(file);

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image loading failed'));
    image.src = dataUrl;
  });

  const maxDim = 1024;
  let width = img.width;
  let height = img.height;

  if (width > height) {
    if (width > maxDim) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    }
  } else if (height > maxDim) {
    width = Math.round((width * maxDim) / height);
    height = maxDim;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error('Compression failed'));
      },
      'image/jpeg',
      0.7
    );
  });

  return blob;
}

export async function savePhoto(id: string, blob: Blob): Promise<void> {
  await set(`${PHOTO_KEY_PREFIX}${id}`, blob);
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  return get(`${PHOTO_KEY_PREFIX}${id}`);
}

export async function deletePhoto(id: string): Promise<void> {
  await del(`${PHOTO_KEY_PREFIX}${id}`);
}

export async function downloadBackup(state: PersistedBingoState): Promise<void> {
  const idbEntries = await entries();
  const photos: Record<string, string> = {};

  for (const [key, value] of idbEntries) {
    const photoKey = String(key);
    if (photoKey.startsWith(PHOTO_KEY_PREFIX) && value instanceof Blob) {
      photos[photoKey] = await blobToDataUrl(value);
    }
  }

  const backup = createBackupPayload(state, photos);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `bingo-backup-${new Date().toISOString().split('T')[0]}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function uploadBackup(file: File): Promise<BackupPayload> {
  const text = await readFileAsText(file);
  const parsed: unknown = JSON.parse(text);
  const backup = parseBackup(parsed);

  if (!backup) {
    throw new Error('Invalid backup file');
  }

  for (const [key, base64] of Object.entries(backup.photos)) {
    const response = await fetch(base64);
    const blob = await response.blob();
    await set(key, blob);
  }

  return backup;
}
