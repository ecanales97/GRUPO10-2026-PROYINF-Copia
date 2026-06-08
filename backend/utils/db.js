import pg from "pg";

pg.types.setTypeParser(1082, value => value);

const { Pool } = pg;

export const SECRET = process.env.SECRET_KEY;

/**
 * para conectarse a la bdd
 */
export const db = new Pool({
  connectionString: process.env.DATABASE_URL
});