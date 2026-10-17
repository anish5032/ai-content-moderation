import assert from 'node:assert/strict';
import test from 'node:test';
import { peakVideoRiskScore } from '../services/analysisService.js';

test('no detected toxicity produces zero peak risk', () => {
  assert.equal(peakVideoRiskScore([0, 0, 0]), 0);
});

test('one moderately toxic chunk reports its peak score', () => {
  assert.equal(peakVideoRiskScore([0.76]), 0.76);
});

test('one highly toxic chunk reports its peak score', () => {
  assert.equal(peakVideoRiskScore([0.99]), 0.99);
});

test('multiple moderately toxic chunks do not accumulate', () => {
  assert.equal(peakVideoRiskScore([0.76, 0.74, 0.79]), 0.79);
});

test('peak score is independent of analyzed chunk count', () => {
  const nineChunks = [0.12, 0.18, 0.22, 0.11, 0.3, 0.19, 0.15, 0.21, 0.9999];
  const twentySevenChunks = [
    ...Array.from({ length: 26 }, (_, index) => 0.1 + (index % 8) / 100),
    0.9999,
  ];

  assert.equal(peakVideoRiskScore(nineChunks), 0.9999);
  assert.equal(peakVideoRiskScore(twentySevenChunks), 0.9999);
});

test('You? false-positive score rounds to 1.00 in the video summary', () => {
  const chunkScore = 0.9999;

  assert.equal(peakVideoRiskScore([chunkScore]).toFixed(2), '1.00');
});
