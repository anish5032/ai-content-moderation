import { useEffect, useMemo, useRef, useState } from 'react';
import type { ActionKey, Chunk, ModerationEvent, StageMode } from '../types/moderation';
import { chunkSeconds } from '../data/moderation';
import { moderationService } from '../services/moderationService';

interface ModerationSessionOptions {
  mode: StageMode;
  durationSeconds: number;
  currentTime: number;
  sourceKey: string | null;
  initialManualOverride?: boolean;
  initialManualAction?: ActionKey | null;
}

export function useModerationSession({
  mode,
  durationSeconds,
  currentTime,
  sourceKey,
  initialManualOverride = false,
  initialManualAction = null
}: ModerationSessionOptions) {
  const [manualOverride, setManualOverride] = useState(initialManualOverride);
  const [manualAction, setManualAction] = useState<ActionKey | null>(initialManualAction);
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const loggedRef = useRef<Set<string>>(new Set());
  const chunksRef = useRef<Chunk[]>([]);
  const currentTimeRef = useRef(currentTime);

  const chunks = useMemo(
    () => moderationService.getChunks(mode, durationSeconds),
    [mode, durationSeconds]
  );
  chunksRef.current = chunks;
  currentTimeRef.current = currentTime;
  const activeChunk = useMemo(
    () => chunks.find((chunk) => currentTime >= chunk.start && currentTime < chunk.end) ?? chunks[0],
    [chunks, currentTime]
  );
  const profile = useMemo(
    () => moderationService.getProfile(
      activeChunk ?? { id: 0, start: 0, end: chunkSeconds, level: 'safe' }
    ),
    [activeChunk]
  );
  const enforcedAction = manualOverride && manualAction ? manualAction : profile.recommended;

  useEffect(() => {
    const seeded = moderationService.seedEvents(chunksRef.current, currentTimeRef.current);
    loggedRef.current = new Set(seeded.map((event) => event.id));
    setEvents(seeded);
  }, [mode, sourceKey, durationSeconds]);

  useEffect(() => {
    if (!activeChunk || activeChunk.level === 'safe') return;
    const event = moderationService.createEvent(activeChunk, profile, profile.recommended);
    if (loggedRef.current.has(event.id)) return;
    loggedRef.current.add(event.id);
    setEvents((previous) => [event, ...previous].slice(0, 40));
  }, [activeChunk, profile]);

  function toggleOverride(value: boolean): void {
    setManualOverride(value);
    setManualAction(value ? enforcedAction : null);
  }

  function selectAction(action: ActionKey): void {
    setManualOverride(true);
    setManualAction(action);
  }

  function markReviewed(eventId: string): void {
    setEvents((previous) => previous.map((event) =>
      event.id === eventId ? { ...event, reviewed: true } : event
    ));
  }

  return {
    chunks,
    activeChunk,
    profile,
    events,
    enforcedAction,
    manualOverride,
    toggleOverride,
    selectAction,
    markReviewed,
    setEvents
  };
}
