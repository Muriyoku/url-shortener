import './database/migration.database';
import { handleShortUrlGeneration, redirectToOriginalUrl } from './routes/url.route';

const server = Bun.serve({
  port: 3000,
  idleTimeout: 0,
  routes: {
    "/api/url": {
      GET: redirectToOriginalUrl,
      POST: handleShortUrlGeneration,
    },
  },
})

console.log("server is running at port: ", server.port)