import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './AppRouter';
import { getPageTitle, navigationItems } from './navigation';

const routes = ['/dashboard', '/moderation', '/videos', '/reviews', '/analytics', '/mlops', '/models', '/settings'];

describe('application routing', () => {
  it('renders every Phase 1 route', () => {
    for (const route of routes) {
      const markup = renderToString(
        <MemoryRouter initialEntries={[route]}>
          <AppRoutes />
        </MemoryRouter>
      );
      expect(markup).toContain(getPageTitle(route));
    }
  });

  it('marks the current route as active in navigation', () => {
    const markup = renderToString(
      <MemoryRouter initialEntries={['/reviews']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(markup).toContain('aria-current="page"');
    expect(markup).toContain('Review queue');
    expect(markup).toContain('href="/reviews"');
  });

  it('keeps the requested navigation contract centralized', () => {
    expect(navigationItems.map((item) => item.to)).toEqual(routes);
  });
});
