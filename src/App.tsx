import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useScreenInit } from './useScreenInit.js';
import { TopBar } from './components/TopBar';
import { VideoStage } from './components/VideoStage';
import { Timeline } from './components/Timeline';
import { RiskPanel } from './components/RiskPanel';
import { ActionPanel } from './components/ActionPanel';
import { EventFeed } from './components/EventFeed';
import { ReviewDrawer } from './components/ReviewDrawer';
import type { ActionKey, Chunk, ModerationEvent, StageMode } from './types/moderation';
import {
  chunkSeconds,
  simulationDurationSeconds,
  simulationFlags,
  simulationStartSeconds } from
'./data/moderation';
import { buildChunks, buildEvent, generateFlags, profileForChunk } from './utils/moderation';

function seedEvents(chunks: Chunk[], upTo: number): ModerationEvent[] {
  return chunks.
  filter((chunk) => chunk.level !== 'safe' && chunk.end <= upTo).
  slice(-8).
  map((chunk) => {
    const profile = profileForChunk(chunk);
    return buildEvent(chunk, profile, profile.recommended, true);
  }).
  reverse();
}

export function App() {
  const screenInit = useScreenInit();

  const [mode, setMode] = useState<StageMode>(screenInit.mode as StageMode ?? 'simulation');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadDuration, setUploadDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState<number>(
    screenInit.currentTime ?? simulationStartSeconds
  );
  const [playing, setPlaying] = useState<boolean>(screenInit.playing ?? true);
  const [manualOverride, setManualOverride] = useState<boolean>(screenInit.manualOverride ?? false);
  const [manualAction, setManualAction] = useState<ActionKey | null>(
    screenInit.manualAction as ActionKey ?? null
  );
  const [events, setEvents] = useState<ModerationEvent[]>([]);
  const [reviewEvent, setReviewEvent] = useState<ModerationEvent | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const loggedRef = useRef<Set<string>>(new Set());

  const durationSeconds = mode === 'upload' ? uploadDuration : simulationDurationSeconds;

  const chunks = useMemo(
    () =>
    durationSeconds > 0 ?
    buildChunks(
      durationSeconds,
      chunkSeconds,
      mode === 'upload' ?
      generateFlags(durationSeconds, chunkSeconds) :
      simulationFlags
    ) :
    [],
    [durationSeconds, mode]
  );

  const activeChunk = useMemo(
    () =>
    chunks.find((chunk) => currentTime >= chunk.start && currentTime < chunk.end) ?? chunks[0],
    [chunks, currentTime]
  );

  const profile = useMemo(
    () =>
    activeChunk ?
    profileForChunk(activeChunk) :
    profileForChunk({ id: 0, start: 0, end: chunkSeconds, level: 'safe' }),
    [activeChunk]
  );

  const enforcedAction: ActionKey =
  manualOverride && manualAction ? manualAction : profile.recommended;

  // Reset the log whenever the analysed source changes.
  useEffect(() => {
    const seeded = seedEvents(chunks, currentTime);
    loggedRef.current = new Set(seeded.map((event) => event.id));
    setEvents(seeded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, videoUrl, durationSeconds]);

  // Append an event as each flagged chunk is processed.
  useEffect(() => {
    if (!activeChunk || activeChunk.level === 'safe') return;
    const event = buildEvent(activeChunk, profile, profile.recommended);
    if (loggedRef.current.has(event.id)) return;
    loggedRef.current.add(event.id);
    setEvents((prev) => [event, ...prev].slice(0, 40));
  }, [activeChunk, profile]);

  // The simulation has no media element, so drive its playhead directly.
  useEffect(() => {
    if (mode !== 'simulation' || !playing) return;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => prev + 1 >= simulationDurationSeconds ? 0 : prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [mode, playing]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setVideoUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
    setUploadDuration(0);
    setCurrentTime(0);
    setPlaying(false);
    setMode('upload');
  }

  function handleModeChange(next: StageMode) {
    if (next === mode) return;
    setMode(next);
    setPlaying(false);
    setCurrentTime(next === 'simulation' ? simulationStartSeconds : 0);
  }

  function handleToggleOverride(value: boolean) {
    setManualOverride(value);
    setManualAction(value ? enforcedAction : null);
  }

  function handleResolve(eventId: string) {
    setEvents((prev) =>
    prev.map((event) => event.id === eventId ? { ...event, reviewed: true } : event)
    );
    setReviewEvent(null);
  }

  return (
    <div className="min-h-full w-full bg-canvas font-sans text-ink">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        className="sr-only"
        onChange={handleFile}
        aria-label="Upload an MP4 or WebM video" />
      

      <TopBar
        mode={mode}
        processing={playing && chunks.length > 0}
        fileName={fileName}
        onModeChange={handleModeChange}
        onRequestUpload={() => fileInputRef.current?.click()} />
      

      <main className="mx-auto w-full max-w-[1800px] px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-card">
            <VideoStage
              mode={mode}
              videoUrl={mode === 'upload' ? videoUrl : null}
              currentTime={currentTime}
              durationSeconds={durationSeconds}
              playing={playing}
              activeChunk={activeChunk}
              enforcedAction={enforcedAction}
              onTogglePlay={() => setPlaying((prev) => !prev)}
              onSeek={setCurrentTime}
              onTimeUpdate={setCurrentTime}
              onDuration={(seconds) => setUploadDuration(Math.max(chunkSeconds, Math.floor(seconds)))}
              onRequestUpload={() => fileInputRef.current?.click()} />
            
            {chunks.length > 0 &&
            <Timeline
              chunks={chunks}
              currentTime={currentTime}
              durationSeconds={durationSeconds}
              activeChunk={activeChunk}
              onSeek={setCurrentTime} />

            }
          </div>

          <aside className="min-w-0 space-y-4" aria-label="Risk and policy controls">
            <RiskPanel profile={profile} activeChunk={activeChunk} />
            <ActionPanel
              profile={profile}
              enforcedAction={enforcedAction}
              manualOverride={manualOverride}
              onToggleOverride={handleToggleOverride}
              onSelectAction={(action) => {
                setManualOverride(true);
                setManualAction(action);
              }} />
            
          </aside>

          <div className="min-w-0 xl:col-span-2">
            <EventFeed events={events} streaming={playing} onReview={setReviewEvent} />
          </div>
        </div>
      </main>

      <ReviewDrawer
        event={reviewEvent}
        onClose={() => setReviewEvent(null)}
        onResolve={handleResolve} />
      
    </div>);

}