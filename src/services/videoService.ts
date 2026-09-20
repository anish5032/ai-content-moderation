import type { VideoAsset } from '../types/moderation';

export interface VideoService {
  createLocalAsset(file: File): VideoAsset;
  revokeSource(sourceUrl: string | null): void;
}

class BrowserVideoService implements VideoService {
  createLocalAsset(file: File): VideoAsset {
    if (!file.type || !['video/mp4', 'video/webm'].includes(file.type)) {
      throw new Error('Please choose an MP4 or WebM video.');
    }

    return {
      id: `local-${crypto.randomUUID()}`,
      name: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      durationSeconds: null,
      sourceUrl: URL.createObjectURL(file)
    };
  }

  revokeSource(sourceUrl: string | null): void {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  }
}

export const videoService: VideoService = new BrowserVideoService();
