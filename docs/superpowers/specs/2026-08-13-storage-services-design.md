# Design Spec: Storage & Image Services

## 1. Image Compression (`compressImage`)
- **Technology**: Canvas API.
- **Input**: `File` or `Blob`.
- **Logic**: 
    - Load image into an `HTMLImageElement`.
    - Calculate new dimensions: `max(width, height) <= 1024px` while maintaining aspect ratio.
    - Draw to `HTMLCanvasElement`.
    - Export using `canvas.toBlob` with `image/jpeg` and `0.7` quality.
- **Output**: `Promise<Blob>`.

## 2. Photo Storage (`photoStorage`)
- **Technology**: `idb-keyval`.
- **Methods**:
    - `savePhoto(id: string, blob: Blob): Promise<void>`
    - `getPhoto(id: string): Promise<Blob | undefined>`
    - `deletePhoto(id: string): Promise<void>`

## 3. Backup System (`backupSystem`)
- **Logic**:
    - Extract all keys/values from `localStorage`.
    - Extract all entries from IndexedDB via `idb-keyval` `entries()`.
    - Convert `Blob` photos to Base64 strings for JSON serialization.
    - Create a JSON blob and trigger a browser download.
- **File Name**: `bingo-backup-YYYY-MM-DD.json`.

## 4. Error Handling
- Wrap `canvas` operations in `try/catch`.
- Handle `idb-keyval` failures gracefully.
