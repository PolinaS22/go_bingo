import { describe, it, expect } from 'vitest';
import { downloadBackup } from './storage';

describe('storage', () => {
  it('should have downloadBackup function', () => {
    expect(downloadBackup).toBeDefined();
  });
});
