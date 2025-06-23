import 'dotenv/config';
import { SQL } from "bun";

export const db = new SQL({
  hostname: process.env.PGHOST,
  port:     process.env.PGPORT,
  database: process.env.PGDATABASE,
  username: process.env.PGUSERNAME,
  password: process.env.PGPASSWORD,
  connectionTimeout: 30,
  idleTimeout: 30, 
  maxLifetime: 0, 
  max: 20, 
  onconnect: client => {
    console.log("Connected to database");
  },
  onclose: client => {
    console.log("Connection closed");
  },
});