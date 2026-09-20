import { useMemo } from 'react';
import { manifest } from './canvas.manifest';
import type { ActionKey, StageMode } from './types/moderation';

export interface ScreenInitState {
  mode?: StageMode;
  currentTime?: number;
  playing?: boolean;
  manualOverride?: boolean;
  manualAction?: ActionKey;
}

export function useScreenInit(): ScreenInitState {
  return useMemo(() => {
    if (typeof window === 'undefined') return {};
    const screenId = new URLSearchParams(window.location.search).get('mp_screen');
    if (!screenId) return {};
    const screens = manifest.screens as Record<string, { state?: unknown }>;
    const state = screens[screenId]?.state;
    return (state && typeof state === 'object' ? state : {}) as ScreenInitState;
  }, []);
}