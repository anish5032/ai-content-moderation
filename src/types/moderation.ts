export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'critical';

export type Modality = 'visual' | 'audio' | 'text';

export type ActionKey = 'allow' | 'flag' | 'mute' | 'blur' | 'block';

export type StageMode = 'simulation' | 'upload';

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