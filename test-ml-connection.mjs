import { predictText } from './backend/services/mlService.js';

const result = await predictText(
  'You are an idiot and nobody likes you.'
);

console.log(JSON.stringify(result, null, 2));