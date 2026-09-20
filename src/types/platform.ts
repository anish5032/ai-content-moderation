import type { ActionKey, Modality, ModerationEvent, RiskLevel } from './moderation';

export type DemoProcessingStatus = 'Ready' | 'Processing' | 'Needs review' | 'Failed';
export type DemoModerationStatus = 'Cleared' | 'Flagged' | 'In review' | 'Blocked';
export type DemoModelStatus = 'Ready' | 'Evaluating' | 'Archived';

export interface DemoVideoRecord {
  id: string;
  name: string;
  duration: string;
  durationSeconds: number;
  processingStatus: DemoProcessingStatus;
  moderationStatus: DemoModerationStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  createdAt: string;
  createdLabel: string;
}

export interface DemoReviewRecord {
  id: string;
  severity: RiskLevel;
  score: number;
  modality: Modality;
  threat: string;
  timestamp: string;
  status: 'Pending' | 'In review' | 'Resolved';
  reviewer: string;
  action: ActionKey;
  event: ModerationEvent;
}

export interface DemoActivityItem {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: 'safe' | 'moderate' | 'high' | 'critical' | 'accent';
}

export interface DemoMetric {
  label: string;
  value: string;
  detail: string;
  tone: 'accent' | 'safe' | 'moderate' | 'high' | 'critical';
}

export interface DemoChartPoint {
  label: string;
  value: number;
}

export interface DemoModelRecord {
  id: string;
  name: string;
  version: string;
  modality: Modality;
  status: 'Ready' | 'Evaluating' | 'Archived';
  deployment: 'Not connected' | 'Demo active' | 'Offline';
  createdAt: string;
  precision: string;
  recall: string;
  f1: string;
  rocAuc: string;
}
