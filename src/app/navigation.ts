import {
  Activity,
  BarChart3,
  Boxes,
  CheckSquare,
  LayoutDashboard,
  Settings2,
  ShieldCheck,
  Video
} from 'lucide-react';

export const navigationItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/moderation', label: 'Moderation', icon: ShieldCheck },
  { to: '/videos', label: 'Video library', icon: Video },
  { to: '/reviews', label: 'Review queue', icon: CheckSquare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/mlops', label: 'MLOps', icon: Activity },
  { to: '/models', label: 'Model registry', icon: Boxes },
  { to: '/settings', label: 'Settings', icon: Settings2 }
] as const;

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/moderation': 'Moderation workspace',
  '/videos': 'Video library',
  '/reviews': 'Review queue',
  '/analytics': 'Analytics',
  '/mlops': 'MLOps monitoring',
  '/models': 'Model registry',
  '/settings': 'Settings'
};

export function getPageTitle(pathname: string): string {
  return pageTitles[pathname] ?? 'Overview';
}
