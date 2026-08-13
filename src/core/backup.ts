import {
  BACKUP_VERSION,
  BackupPayload,
  PersistedBingoState,
} from '../types/bingo';
import { normalizePersistedState } from './normalize';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string') {
      result[key] = entry;
    }
  }
  return result;
}

function parseLegacyLocalStorage(raw: unknown): unknown {
  if (!isRecord(raw) || !isRecord(raw.localStorage)) {
    return undefined;
  }

  const serialized = raw.localStorage['bingo-storage'];
  if (typeof serialized !== 'string') {
    return undefined;
  }

  try {
    const parsed: unknown = JSON.parse(serialized);
    return parsed;
  } catch {
    return undefined;
  }
}

export function parseBackup(raw: unknown): BackupPayload | null {
  if (!isRecord(raw)) {
    return null;
  }

  const photos = asStringRecord(raw.photos);
  const timestamp =
    typeof raw.timestamp === 'string' ? raw.timestamp : new Date().toISOString();

  const stateSource =
    raw.state !== undefined ? raw.state : parseLegacyLocalStorage(raw);
  const state: PersistedBingoState = normalizePersistedState(stateSource);

  return {
    version: BACKUP_VERSION,
    timestamp,
    state,
    photos,
  };
}

export function createBackupPayload(
  state: PersistedBingoState,
  photos: Record<string, string>
): BackupPayload {
  return {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    state,
    photos,
  };
}
