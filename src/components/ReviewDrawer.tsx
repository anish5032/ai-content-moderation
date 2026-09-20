import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import type { ModerationEvent } from '../types/moderation';
import {
  actionMeta,
  modalityShort,
  riskBadgeClass,
  riskBarClass,
  riskTextClass,
  scoreToLevel } from
'../utils/moderation';

interface ReviewDrawerProps {
  event: ModerationEvent | null;
  onClose: () => void;
  onResolve: (eventId: string) => void;
}

export function ReviewDrawer({ event, onClose, onResolve }: ReviewDrawerProps) {
  return (
    <AnimatePresence>
      {event &&
      <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Review event">
          <motion.button
          type="button"
          aria-label="Close review drawer"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 bg-ink/30" />
        
          <motion.aside
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 32, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-surface shadow-raised">
          
            <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Human review
                </p>
                <h2 className="mt-0.5 text-lg font-semibold text-ink">
                  Chunk #{event.chunkId}
                  <span className="ml-2 font-mono text-sm font-normal text-ink-faint">
                    {event.timecode}
                  </span>
                </h2>
              </div>
              <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-faint transition-colors duration-150 ease-out hover:bg-panel hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close">
              
                <XIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${riskBadgeClass[scoreToLevel(event.score)]}`}>
                
                  Composite {event.score.toFixed(2)}
                </span>
                <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${actionMeta[event.action].chip}`}>
                
                  {actionMeta[event.action].label}
                </span>
                <span className="rounded-full bg-panel px-2.5 py-1 text-[11px] font-medium text-ink-muted ring-1 ring-inset ring-line">
                  {modalityShort[event.modality]} trigger
                </span>
              </div>

              <div className="rounded-xl border border-line bg-panel p-3.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Why it fired
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{event.reason}</p>
                <p className="mt-2 text-[11px] text-ink-faint">
                  Model confidence {Math.round(event.confidence * 100)}%
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                  Modality scores
                </p>
                <ul className="mt-2 space-y-2.5">
                  {event.signals.map((signal) =>
                <li key={signal.modality} className="rounded-lg border border-line p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-ink">{signal.model}</span>
                        <span
                      className={`font-mono text-sm font-semibold ${riskTextClass[signal.level]}`}>
                      
                          {signal.score.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-raised">
                        <div
                      className={`h-full rounded-full ${riskBarClass[signal.level]}`}
                      style={{ width: `${Math.round(signal.score * 100)}%` }} />
                    
                      </div>
                      <p className="mt-2 text-[11px] text-ink-faint">{signal.tags.join(' · ')}</p>
                    </li>
                )}
                </ul>
              </div>
            </div>

            <footer className="flex gap-2 border-t border-line px-5 py-4">
              <button
              type="button"
              onClick={() => onResolve(event.id)}
              className="flex-1 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-accent/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              
                Uphold decision
              </button>
              <button
              type="button"
              onClick={() => onResolve(event.id)}
              className="rounded-lg border border-line px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 ease-out hover:bg-panel hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              
                Reverse action
              </button>
            </footer>
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}