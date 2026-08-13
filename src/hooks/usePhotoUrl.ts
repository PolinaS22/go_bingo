import { useEffect, useState } from 'react';
import { getPhoto } from '../services/storage';

export function usePhotoUrl(photoId: string | undefined, enabled = true): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !photoId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    getPhoto(photoId).then((blob) => {
      if (!blob) {
        return;
      }

      const created = URL.createObjectURL(blob);
      if (cancelled) {
        URL.revokeObjectURL(created);
        return;
      }

      objectUrl = created;
      setUrl(created);
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photoId, enabled]);

  return url;
}
