import type { DemoChartPoint } from '../../types/platform';

export const demoAnalyticsSummary = [
  { label: 'Content processed', value: '1,284', detail: 'Demo volume', tone: 'accent' },
  { label: 'Flagged content', value: '86', detail: 'Demo policy matches', tone: 'moderate' },
  { label: 'Review rate', value: '68%', detail: 'Demo queue resolution', tone: 'safe' },
  { label: 'Median review time', value: '04:18', detail: 'Demo workflow timing', tone: 'high' }
] as const;

export const demoRiskDistribution: DemoChartPoint[] = [
  { label: 'Safe', value: 62 }, { label: 'Low', value: 19 }, { label: 'Moderate', value: 11 }, { label: 'High', value: 6 }, { label: 'Critical', value: 2 }
];

export const demoModalityDistribution: DemoChartPoint[] = [
  { label: 'Visual', value: 38 }, { label: 'Audio', value: 34 }, { label: 'Text', value: 28 }
];

export const demoActionDistribution: DemoChartPoint[] = [
  { label: 'Allow', value: 71 }, { label: 'Flag', value: 13 }, { label: 'Mute', value: 8 }, { label: 'Blur', value: 5 }, { label: 'Block', value: 3 }
];

export const demoProcessedTrend: DemoChartPoint[] = [
  { label: 'Mon', value: 42 }, { label: 'Tue', value: 58 }, { label: 'Wed', value: 51 }, { label: 'Thu', value: 76 }, { label: 'Fri', value: 68 }, { label: 'Sat', value: 84 }, { label: 'Sun', value: 72 }
];
