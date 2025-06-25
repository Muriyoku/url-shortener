import './database/migrations/migration.database';

const server = Bun.serve({
  port: 3000,
  idleTimeout: 0,
  routes: {
    "/api/shorturl/": {

    },
  },
})