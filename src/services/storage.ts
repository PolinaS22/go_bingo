import { get, set, del, entries } from 'idb-keyval';

export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1024;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
}

export async function savePhoto(id: string, blob: Blob): Promise<void> {
  await set(`photo-${id}`, blob);
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  return await get(`photo-${id}`);
}

export async function deletePhoto(id: string): Promise<void> {
  await del(`photo-${id}`);
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function downloadBackup(): Promise<void> {
  const lsData: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) lsData[key] = localStorage.getItem(key) || '';
  }

  const idbEntries = await entries();
  const photos: Record<string, string> = {};

  for (const [key, value] of idbEntries) {
    if (key.toString().startsWith('photo-') && value instanceof Blob) {
      photos[key.toString()] = await blobToBase64(value);
    }
  }

  const backup = {
    localStorage: lsData,
    photos,
    timestamp: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bingo-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
