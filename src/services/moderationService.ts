import {
  chunkSeconds,
  simulationDurationSeconds,
  simulationFlags
} from '../data/moderation';
import type {
  ActionKey,
  Chunk,
  ChunkProfile,
  ModerationEvent,
  StageMode
} from '../types/moderation';
import {
  buildChunks,
  buildEvent,
  generateFlags,
  profileForChunk
} from '../utils/moderation';

export interface ModerationService {
  getChunks(mode: StageMode, durationSeconds: number): Chunk[];
  getProfile(chunk: Chunk): ChunkProfile;
  createEvent(
    chunk: Chunk,
    profile: ChunkProfile,
    action: ActionKey,
    reviewed?: boolean
  ): ModerationEvent;
  seedEvents(chunks: Chunk[], upTo: number): ModerationEvent[];
}

export class DemoModerationService implements ModerationService {
  getChunks(mode: StageMode, durationSeconds: number): Chunk[] {
    if (durationSeconds <= 0) return [];
    const flags = mode === 'upload'
      ? generateFlags(durationSeconds, chunkSeconds)
      : simulationFlags;
    return buildChunks(durationSeconds, chunkSeconds, flags);
  }

  getProfile(chunk: Chunk): ChunkProfile {
    return profileForChunk(chunk);
  }

  createEvent(
    chunk: Chunk,
    profile: ChunkProfile,
    action: ActionKey,
    reviewed = false
  ): ModerationEvent {
    return buildEvent(chunk, profile, action, reviewed);
  }

  seedEvents(chunks: Chunk[], upTo: number): ModerationEvent[] {
    return chunks
      .filter((chunk) => chunk.level !== 'safe' && chunk.end <= upTo)
      .slice(-8)
      .map((chunk) => {
        const profile = this.getProfile(chunk);
        return this.createEvent(chunk, profile, profile.recommended, true);
      })
      .reverse();
  }
}

class UnavailableModerationService implements ModerationService {
  private unavailable(): never {
    throw new Error(
      'The real moderation API is not configured. Set VITE_USE_MOCK_API=true for demo mode.'
    );
  }

  getChunks(): never { return this.unavailable(); }
  getProfile(): never { return this.unavailable(); }
  createEvent(): never { return this.unavailable(); }
  seedEvents(): never { return this.unavailable(); }
}

export function createModerationService(): ModerationService {
  return import.meta.env.VITE_USE_MOCK_API === 'false'
    ? new UnavailableModerationService()
    : new DemoModerationService();
}

export const moderationService = createModerationService();

export { simulationDurationSeconds };
