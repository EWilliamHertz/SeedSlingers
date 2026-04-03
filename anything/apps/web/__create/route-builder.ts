import { Hono } from 'hono';
import updatedFetch from '../src/__create/fetch';

const API_BASENAME = '/api';
const api = new Hono();

if (globalThis.fetch) {
  globalThis.fetch = updatedFetch;
}

// Helper function to transform file path to Hono route path
function getHonoPath(routePath: string): string {
  let relativePath = routePath.replace('../src/app/api', '');
  relativePath = relativePath.replace(/\/route\.js$/, '');
  
  if (!relativePath) {
    return '/';
  }

  const parts = relativePath.split('/').filter(Boolean);
  const transformedParts = parts.map((segment) => {
    const match = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (match) {
      const [_, dots, param] = match;
      return dots === '...'
        ? `:${param}{.+}`
        : `:${param}`;
    }
    return segment;
  });
  
  return `/${transformedParts.join('/')}`;
}

// Use Vite's glob import to find all route.js files at build time
const routeModules = import.meta.glob('../src/app/api/**/route.js');
const routePaths = Object.keys(routeModules).sort((a, b) => b.length - a.length);

for (const routePath of routePaths) {
  const honoPath = getHonoPath(routePath);
  
  // Register an 'all' handler that lazily loads the route when hit
  // This prevents database connections from firing during the Vercel build phase
  api.all(honoPath, async (c) => {
    try {
      const params = c.req.param();
      
      let route: any;
      if (import.meta.env.DEV) {
        route = await import(/* @vite-ignore */ `${routePath}?update=${Date.now()}`);
      } else {
        route = await routeModules[routePath]();
      }
      
      const method = c.req.method;
      
      if (route[method]) {
        return await route[method](c.req.raw, { params });
      } else {
        return c.json({ error: `Method ${method} not allowed` }, 405);
      }
    } catch (error) {
      console.error(`Error executing route ${routePath}:`, error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  });
}

export { api, API_BASENAME };