import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { Analytics } from '../pages/Analytics';
import { Dashboard } from '../pages/Dashboard';
import { MLOps } from '../pages/MLOps';
import { Moderation } from '../pages/Moderation';
import { Models } from '../pages/Models';
import { Reviews } from '../pages/Reviews';
import { Settings } from '../pages/Settings';
import { Videos } from '../pages/Videos';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/moderation" element={<Moderation />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/mlops" element={<MLOps />} />
        <Route path="/models" element={<Models />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
