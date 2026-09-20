export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'critical';

export type Modality = 'visual' | 'audio' | 'text';

export type ActionKey = 'allow' | 'flag' | 'mute' | 'blur' | 'block';

export type StageMode = 'simulation' | 'upload';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
}

export interface ChunkFlag {
  id: number;
  level: RiskLevel;
  modality: Modality;
  threat: string;
}

export interface Chunk {
  id: number;
  start: number;
  end: number;
  level: RiskLevel;
  modality?: Modality;
  threat?: string;
}

export interface ModalitySignal {
  modality: Modality;
  model: string;
  label: string;
  score: number;
  level: RiskLevel;
  tags: string[];
}

export interface ChunkProfile {
  chunkId: number;
  composite: number;
  level: RiskLevel;
  primary: Modality;
  threat: string;
  signals: ModalitySignal[];
  recommended: ActionKey;
  confidence: number;
  reason: string;
}

export interface VideoAsset {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number | null;
  sourceUrl: string | null;
}

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  modality: Modality;
}

export interface ChunkResult {
  chunk: Chunk;
  profile: ChunkProfile;
  modelVersions: ModelVersion[];
}

export interface ProcessingJob {
  id: string;
  assetId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  error: string | null;
}

export interface ModerationResult {
  assetId: string;
  processingJobId: string;
  source: 'demo' | 'backend';
  chunks: ChunkResult[];
}

export interface ModerationAction {
  key: ActionKey;
  label: string;
  description: string;
}

export interface ModerationEvent {
  id: string;
  timecode: string;
  chunkId: number;
  modality: Modality;
  threat: string;
  score: number;
  action: ActionKey;
  confidence: number;
  reviewed: boolean;
  reason: string;
  signals: ModalitySignal[];
}

export interface ModerationDecision {
  id: string;
  eventId: string;
  action: ActionKey;
  source: 'ai' | 'human';
  reason: string | null;
}

export interface ReviewTask {
  id: string;
  eventId: string;
  status: 'pending' | 'resolved';
  decision: ModerationDecision | null;
}