import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pgPool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

const connectPostgres = async () => {
  try {
    const client = await pgPool.connect();
    console.log(`PostgreSQL Connected: ${client.host}`);
    client.release(); // release to pool
  } catch (error) {
    console.error(`PostgreSQL Error: ${error.message}`);
    process.exit(1);
  }
};
// export
export { pgPool, connectPostgres };
