
import { config } from '../config.js';

export async function predictText(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Text is required for toxicity prediction.');
  }

  const response = await fetch(
    `${config.mlServiceUrl}/predict/text`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) {
    throw new Error(`ML service returned HTTP ${response.status}`);
  }

  return response.json();
}
