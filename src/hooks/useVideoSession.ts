import { useEffect, useState } from 'react';
import type { AsyncState, StageMode, VideoAsset } from '../types/moderation';
import { simulationDurationSeconds, simulationStartSeconds } from '../data/moderation';
import type { ScreenInitState } from '../useScreenInit';
import { videoService } from '../services/videoService';

export function useVideoSession(screenInit: ScreenInitState) {
  const [mode, setMode] = useState<StageMode>(screenInit.mode ?? 'simulation');
  const [videoState, setVideoState] = useState<AsyncState<VideoAsset>>({
    status: 'idle',
    data: null,
    error: null
  });
  const [uploadDuration, setUploadDuration] = useState(0);
  const sourceUrl = videoState.data?.sourceUrl ?? null;

  useEffect(() => {
    return () => videoService.revokeSource(sourceUrl);
  }, [sourceUrl]);

  function handleFile(file: File): void {
    try {
      const asset = videoService.createLocalAsset(file);
      setVideoState({ status: 'success', data: asset, error: null });
      setUploadDuration(0);
      setMode('upload');
    } catch (error) {
      setVideoState({
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'Unable to load this video.'
      });
    }
  }

  function handleModeChange(nextMode: StageMode): void {
    if (nextMode === mode) return;
    setMode(nextMode);
  }

  function handleDuration(seconds: number): void {
    setUploadDuration(Math.max(2, Math.floor(seconds)));
    setVideoState((previous) => previous.data ? {
      ...previous,
      data: { ...previous.data, durationSeconds: Math.max(2, Math.floor(seconds)) }
    } : previous);
  }

  return {
    mode,
    videoAsset: videoState.data,
    videoUrl: videoState.data?.sourceUrl ?? null,
    fileName: videoState.data?.name ?? null,
    videoState,
    uploadDuration,
    durationSeconds: mode === 'upload' ? uploadDuration : simulationDurationSeconds,
    initialTime: screenInit.currentTime ?? simulationStartSeconds,
    initialPlaying: screenInit.playing ?? true,
    handleFile,
    handleModeChange,
    handleDuration
  };
}
