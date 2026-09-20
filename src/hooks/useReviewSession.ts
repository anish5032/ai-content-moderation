import { useState } from 'react';
import type { ModerationEvent } from '../types/moderation';
import { reviewService } from '../services/reviewService';

export function useReviewSession(onResolve: (eventId: string) => void) {
  const [reviewEvent, setReviewEvent] = useState<ModerationEvent | null>(null);

  function resolve(eventId: string): void {
    reviewService.createDecision(eventId, 'flag');
    onResolve(eventId);
    setReviewEvent(null);
  }

  return {
    reviewEvent,
    openReview: setReviewEvent,
    closeReview: () => setReviewEvent(null),
    resolve
  };
}
