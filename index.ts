import './database/migration.database';
import { generateShortUrlRoute } from './routes/url.route';

const server = Bun.serve({
  port: 3000,
  idleTimeout: 0,
  routes: {
    "/api/url": {
      POST: generateShortUrlRoute,
    },
  },
})

console.log("server is running at port: ", server.port)