import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, ScanSearch, Video as VideoIcon } from 'lucide-react';
import { EventFeed } from '../components/EventFeed';
import { ReviewDrawer } from '../components/ReviewDrawer';
import { DemoNotice, PageHeader } from '../components/platform/PageHeader';
import { RiskPill, StatusPill } from '../components/platform/StatusPill';
import { ApiError } from '../lib/api';
import { reviewApi, videoApi } from '../services/apiService';
const buttonClass = 'inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-card hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60';
function errorMessage(error) {
    return error instanceof Error ? error.message : 'Something went wrong.';
}
export function BackendModeration() {
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedId = searchParams.get('video') ?? '';
    const [videos, setVideos] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const activeRequestRef = useRef(0);
    const selectedId = useMemo(() => {
        if (requestedId && videos.some(video => video.id === requestedId))
            return requestedId;
        return videos[0]?.id ?? '';
    }, [requestedId, videos]);
    const selectedVideo = useMemo(() => videos.find(video => video.id === selectedId) ?? null, [videos, selectedId]);
    const syncUrlToSelection = useCallback((nextId, replace = false) => {
        if (!nextId)
            return;
        const currentId = searchParams.get('video') ?? '';
        if (currentId !== nextId)
            setSearchParams({ video: nextId }, { replace });
    }, [searchParams, setSearchParams]);
    const load = useCallback(async (videoId = requestedId) => {
        const requestToken = ++activeRequestRef.current;
        setLoading(true);
        try {
            const items = await videoApi.list();
            if (requestToken !== activeRequestRef.current)
                return;
            setVideos(items);
            const nextId = items.find(item => item.id === videoId)?.id ?? items[0]?.id ?? '';
            if (!nextId) {
                setResult(null);
                return;
            }
            if (requestedId !== nextId)
                syncUrlToSelection(nextId, true);
            try {
                const nextResult = await videoApi.result(nextId);
                if (requestToken !== activeRequestRef.current)
                    return;
                setResult(nextResult);
            }
            catch (caught) {
                if (requestToken !== activeRequestRef.current)
                    return;
                if (!(caught instanceof ApiError && caught.status === 404))
                    throw caught;
                setResult(null);
            }
            setError(null);
        }
        catch (caught) {
            if (requestToken !== activeRequestRef.current)
                return;
            setError(errorMessage(caught));
        }
        finally {
            if (requestToken === activeRequestRef.current)
                setLoading(false);
        }
    }, [requestedId, searchParams, setSearchParams, syncUrlToSelection]);
    useEffect(() => {
        void load(requestedId);
    }, [load, requestedId]);
    useEffect(() => {
        if (!selectedVideo || (selectedVideo.status !== 'processing' && result?.status !== 'processing'))
            return undefined;
        const timer = window.setInterval(() => { void load(selectedVideo.id); }, 2000);
        return () => window.clearInterval(timer);
    }, [load, result?.status, selectedVideo]);
    async function analyze(force = false) {
        if (!selectedVideo)
            return;
        setBusy(true);
        setError(null);
        try {
            await videoApi.analyze(selectedVideo.id, force);
            await load(selectedVideo.id);
        }
        catch (caught) {
            if (caught instanceof ApiError
                && caught.status === 409
                && caught.message.includes('force=true')
                && window.confirm('This video has human review decisions. Re-analyzing will discard them. Continue?')) {
                try {
                    await videoApi.analyze(selectedVideo.id, true);
                    await load(selectedVideo.id);
                    return;
                }
                catch (retryError) {
                    setError(errorMessage(retryError));
                    return;
                }
            }
            setError(errorMessage(caught));
        }
        finally {
            setBusy(false);
        }
    }
    async function resolveEvent(eventId, action) {
        setBusy(true);
        setError(null);
        try {
            await reviewApi.decide(eventId, action);
            setSelectedEvent(null);
            await load(selectedVideo?.id);
        }
        catch (caught) {
            setError(errorMessage(caught));
        }
        finally {
            setBusy(false);
        }
    }
    const events = result?.events ?? [];
    const hasResults = result?.status === 'completed';
    return (<div className="mx-auto max-w-[1800px] px-4 py-4 sm:px-6 sm:py-5">
      <PageHeader eyebrow="Backend analysis" title="Moderation workspace" description="Inspect the saved analysis results and review flagged events for your videos." actions={<button type="button" onClick={() => void load(selectedId)} disabled={loading} className={buttonClass}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true"/>
            Refresh
          </button>}/>

      <DemoNotice>
        Text moderation uses Whisper speech transcription and the trained text toxicity model. Visual content moderation and non-speech audio analysis are not yet implemented. Video playback is unavailable because the backend API does not currently expose stored media.
      </DemoNotice>

      {error && <p role="alert" className="mb-4 rounded-lg bg-critical/10 px-3.5 py-2.5 text-xs text-critical ring-1 ring-inset ring-critical/25">{error}</p>}

      <section className="mb-4 rounded-xl border border-line bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1 text-xs font-medium text-ink-muted">
            Select a video
            <select value={selectedId} onChange={event => {
                const nextId = event.target.value;
                if (!nextId)
                    setSearchParams({}, { replace: false });
                else
                    setSearchParams({ video: nextId });
            }} className="mt-1.5 w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-ink">
              {videos.length === 0 && <option value="">No videos uploaded</option>}
              {videos.map(video => <option key={video.id} value={video.id}>{video.name}</option>)}
            </select>
          </label>
          {selectedVideo && (<div className="flex items-center gap-3">
              <StatusPill status={selectedVideo.status === 'ready' ? 'Ready'
                : selectedVideo.status === 'needs_review' ? 'Needs review'
                    : selectedVideo.status === 'processing' ? 'Processing'
                        : selectedVideo.status === 'failed' ? 'Failed' : 'Queued'}/>
              {(selectedVideo.status !== 'processing') && (<button type="button" onClick={() => void analyze()} disabled={busy || loading} className={buttonClass}>
                  <ScanSearch className="h-3.5 w-3.5" aria-hidden="true"/>
                  {hasResults ? 'Re-analyze' : 'Analyze video'}
                </button>)}
            </div>)}
        </div>
      </section>

      {!loading && !selectedVideo ? (<div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface text-center">
          <VideoIcon className="h-6 w-6 text-ink-faint" aria-hidden="true"/>
          <p className="text-sm font-medium text-ink">No videos yet</p>
          <p className="text-xs text-ink-faint">Upload a video in the library, then return here to analyze it.</p>
        </div>) : loading && !selectedVideo ? (<p className="py-16 text-center text-sm text-ink-muted" role="status">Loading your videos…</p>) : result?.status === 'processing' || selectedVideo?.status === 'processing' ? (<div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-line bg-surface text-center">
          <RefreshCw className="h-5 w-5 animate-spin text-accent" aria-hidden="true"/>
          <p className="text-sm font-medium text-ink">Analysis is running</p>
          <p className="text-xs text-ink-faint">This page refreshes automatically when the result is ready.</p>
        </div>) : result?.status === 'failed' ? (<p role="alert" className="rounded-lg bg-critical/10 px-3.5 py-3 text-sm text-critical">{selectedVideo?.error || 'Analysis failed. Try analyzing this video again.'}</p>) : !hasResults ? (<div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-line bg-surface text-center">
          <ScanSearch className="h-6 w-6 text-ink-faint" aria-hidden="true"/>
          <p className="text-sm font-medium text-ink">No analysis result yet</p>
          <p className="text-xs text-ink-faint">Start an analysis to view its risk score and moderation events.</p>
        </div>) : (<>
          <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
              <p className="text-xs text-ink-muted">Peak chunk risk</p>
              <div className="mt-2 flex items-center gap-2">
                <RiskPill level={result.riskLevel ?? 'safe'}/>
                <span className="font-mono text-lg font-semibold text-ink">{(result.riskScore ?? 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
              <p className="text-xs text-ink-muted">Analyzed chunks</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-ink">{result.chunkCount}</p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
              <p className="text-xs text-ink-muted">Flagged events</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-moderate">{result.flaggedCount}</p>
            </div>
          </section>
          <EventFeed events={events} streaming={false} onReview={setSelectedEvent}/>
        </>)}

      <ReviewDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} onResolve={resolveEvent} readOnly={selectedEvent?.reviewed ?? false} busy={busy}/>
    </div>);
}
