import { Client } from 'pg';

export async function handler(event) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false  // Accept RDS's self-signed cert (for dev/testing)
    },
  });

  try {
    await client.connect();

    const result = await client.query('SELECT * FROM fish');

    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    console.error('Error fetching table contents:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client.end();
  }
}
