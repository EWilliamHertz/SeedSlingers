import { Hono } from 'hono';
import type { Handler } from 'hono/types';
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

// Import and register all routes
async function registerRoutes() {
  // Use Vite's glob import to find all route.js files at build time
  const routeModules = import.meta.glob('../src/app/api/**/route.js');
  
  const routePaths = Object.keys(routeModules).sort((a, b) => b.length - a.length);

  // Clear existing routes
  api.routes = [];

  for (const routePath of routePaths) {
    try {
      const route: any = await routeModules[routePath]();

      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of methods) {
        try {
          if (route[method]) {
            const honoPath = getHonoPath(routePath);
            
            const handler: Handler = async (c) => {
              const params = c.req.param();
              
              if (import.meta.env.DEV) {
                const updatedRoute: any = await import(/* @vite-ignore */ `${routePath}?update=${Date.now()}`);
                return await updatedRoute[method](c.req.raw, { params });
              }
              
              return await route[method](c.req.raw, { params });
            };
            
            const methodLowercase = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
            api[methodLowercase](honoPath, handler);
          }
        } catch (error) {
          console.error(`Error registering route ${routePath} for method ${method}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error importing route file ${routePath}:`, error);
    }
  }
}

// Initial route registration
await registerRoutes();

// Hot reload routes in development
if (import.meta.env.DEV) {
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      registerRoutes().catch((err) => {
        console.error('Error reloading routes:', err);
      });
    });
  }
}




export { api, API_BASENAME };