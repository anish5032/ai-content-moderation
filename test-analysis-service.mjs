
import { analyzeText } from './backend/services/analysisService.js';

const samples = [
  'Thank you for helping me with this project.',
  'You are an idiot and nobody likes you.',
];

for (const text of samples) {
  const result = await analyzeText(text);

  console.log('\nInput:', text);
  console.log('Risk score:', result.score);
  console.log('Risk level:', result.level);
  console.log('Detected labels:', result.tags);
  console.log('Category scores:', result.categoryScores);
}
