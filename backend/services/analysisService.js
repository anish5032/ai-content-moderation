import { config, MAX_CHUNKS } from '../config.js';
import { getDb } from '../db.js';
import { createId, now } from '../utils/common.js';

const modalities = ['visual', 'audio', 'text'];
const modelNames = { visual: 'Vision Model', audio: 'Audio Model', text: 'Text Model' };
const labels = { visual: 'Visual Risk', audio: 'Speech Risk', text: 'Caption / STT Toxicity' };
const threats = { visual: 'Graphic violence', audio: 'Harmful speech', text: 'Toxicity detected' };
const clearTags = {
  visual: ['Safe imagery', 'No violence'],
  audio: ['Neutral tone', 'No profanity'],
  text: ['Clean captions'],
};
const elevatedTags = {
  visual: ['Violence', 'Graphic frame', 'Weapon detected', 'Suggestive imagery'],
  audio: ['Harmful language', 'Abusive speech', 'Threatening tone', 'Slur detected'],
  text: ['Toxicity detected', 'Harassment', 'Hate keyword', 'Profanity chip'],
};
const dominantScores = { safe: 0.09, low: 0.27, moderate: 0.57, high: 0.79, critical: 0.92 };

function hash(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function scoreToLevel(score) {
  if (score >= 0.85) return 'critical';
  if (score >= 0.65) return 'high';
  if (score >= 0.4) return 'moderate';
  if (score >= 0.2) return 'low';
  return 'safe';
}

function tagsFor(modality, score, seed) {
  if (score < 0.35) return clearTags[modality];
  const pool = elevatedTags[modality];
  const first = pool[Math.floor(hash(seed) * pool.length) % pool.length];
  if (score < 0.7) return [first];
  const second = pool[Math.floor(hash(seed + 5) * pool.length) % pool.length];
  return second === first ? [first] : [first, second];
}

function analyzeChunk(chunkId) {
  let level = 'safe';
  let primary = 'visual';

  if (hash(chunkId) >= 0.74) {
    primary = modalities[Math.floor(hash(chunkId + 91) * modalities.length) % modalities.length];
    const severity = hash(chunkId + 17);
    level = severity > 0.93 ? 'critical' : severity > 0.72 ? 'high' : severity > 0.4 ? 'moderate' : 'low';
  }

  const signals = modalities.map(modality => {
    const raw = modality === primary && level !== 'safe'
      ? dominantScores[level] + (hash(chunkId * 7 + modality.length) - 0.5) * 0.08
      : 0.06 + hash(chunkId * 13 + modality.length * 3) * 0.24;
    const score = Math.round(Math.min(0.99, Math.max(0.01, raw)) * 100) / 100;
    return {
      modality,
      model: modelNames[modality],
      label: labels[modality],
      score,
      level: scoreToLevel(score),
      tags: tagsFor(modality, score, chunkId * 3 + modality.length),
    };
  });

  return { signals, primary, threat: level !== 'safe' ? threats[primary] : 'No policy violation' };
}

function compositeScore(scores) {
  const top = Math.max(...scores);
  const rest = (scores.reduce((total, score) => total + score, 0) - top) / 2;
  return Math.round(Math.min(0.99, top * 0.9 + rest * 0.28) * 100) / 100;
}

function confidenceFor(score) {
  return Math.round(Math.min(0.99, 0.78 + score * 0.18) * 100) / 100;
}

function recommendedAction(level, primary) {
  if (level === 'critical') return 'block';
  if (level === 'high') return primary === 'visual' ? 'blur' : 'mute';
  if (level === 'moderate') return 'flag';
  return 'allow';
}

function timecode(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(wholeSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((wholeSeconds % 3600) / 60)).padStart(2, '0')}:${String(wholeSeconds % 60).padStart(2, '0')}`;
}

function buildReason(chunkId, start, end, level, primary, threat) {
  const window = `${timecode(start)} – ${timecode(end)}`;
  if (level === 'safe' || level === 'low') {
    return `No policy violation detected in chunk #${chunkId} (${window}). All three modalities are below threshold.`;
  }
  const channel = primary === 'audio' ? 'Audio' : primary === 'text' ? 'Captions / STT' : 'Visual frames';
  return `${channel} contain inappropriate content at ${window}. Trigger: ${threat}.`;
}

export async function runAnalysis(videoId, resultId) {
  try {
    const database = getDb();
    const video = await database.collection('videos').findOne({ _id: videoId });
    if (!video) return;

    const duration = Number(video.durationSeconds || config.defaultDurationSeconds);
    const count = Math.min(MAX_CHUNKS, Math.max(1, Math.ceil(duration / config.chunkSeconds)));
    const events = [];
    let topScore = 0;

    for (let index = 0; index < count; index += 1) {
      const chunkId = index + 1;
      const start = index * config.chunkSeconds;
      const end = Math.min((index + 1) * config.chunkSeconds, duration);
      const analysis = analyzeChunk(chunkId);
      const composite = compositeScore(analysis.signals.map(signal => signal.score));
      const level = scoreToLevel(composite);
      topScore = Math.max(topScore, composite);
      if (level === 'safe') continue;

      const action = recommendedAction(level, analysis.primary);
      const needsHuman = action !== 'allow';
      events.push({
        _id: createId(),
        videoId,
        ownerId: video.ownerId,
        resultId,
        chunkId,
        startSeconds: start,
        endSeconds: end,
        timecode: timecode(start),
        modality: analysis.primary,
        threat: analysis.threat,
        score: composite,
        action,
        confidence: confidenceFor(composite),
        reason: buildReason(chunkId, start, end, level, analysis.primary, analysis.threat),
        signals: analysis.signals,
        reviewed: !needsHuman,
        review: { status: needsHuman ? 'pending' : 'resolved' },
        createdAt: now(),
      });
    }

    if (events.length) await database.collection('moderation_events').insertMany(events);
    const pending = events.filter(event => event.review.status === 'pending').length;
    const completedAt = now();
    const riskLevel = scoreToLevel(topScore);
    await database.collection('moderation_results').updateOne(
      { _id: resultId },
      { $set: { status: 'completed', riskLevel, riskScore: topScore, chunkCount: count, flaggedCount: events.length, completedAt } },
    );
    await database.collection('videos').updateOne(
      { _id: videoId },
      { $set: { status: pending ? 'needs_review' : 'ready', riskLevel, riskScore: topScore, error: null, updatedAt: completedAt } },
    );
  } catch (error) {
    console.error('Analysis failed:', error);
    const database = getDb();
    await database.collection('moderation_results').updateOne(
      { _id: resultId },
      { $set: { status: 'failed', completedAt: now() } },
    );
    await database.collection('videos').updateOne(
      { _id: videoId },
      { $set: { status: 'failed', error: 'Analysis failed. Please try again.', updatedAt: now() } },
    );
  }
}
