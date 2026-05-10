import pg from "pg";
const { Pool } = pg;

export const SECRET = process.env.SECRET_KEY;

/**
 * para conectarse a la bdd
 */
export const db = new Pool({
  connectionString: process.env.DATABASE_URL
});