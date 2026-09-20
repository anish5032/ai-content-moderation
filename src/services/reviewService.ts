import type { ActionKey, ModerationDecision } from '../types/moderation';

export interface ReviewService {
  createDecision(eventId: string, action: ActionKey, source?: 'ai' | 'human'): ModerationDecision;
}

class DemoReviewService implements ReviewService {
  createDecision(
    eventId: string,
    action: ActionKey,
    source: 'ai' | 'human' = 'human'
  ): ModerationDecision {
    return {
      id: `decision-${eventId}`,
      eventId,
      action,
      source,
      reason: null
    };
  }
}

export const reviewService: ReviewService = new DemoReviewService();
