import { Client } from 'pg';

const DB_CONFIG = {
  host: process.env.DB_HOST,       // e.g. your-db.abc123.us-east-2.rds.amazonaws.com
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS fish (
  id SERIAL PRIMARY KEY,
  caught_by TEXT NOT NULL,
  species TEXT NOT NULL,
  length_inches NUMERIC NOT NULL,
  catch_date DATE NOT NULL
);
`;

export async function handler(event) {
  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    // Create table if it doesn't exist
    await client.query(TABLE_CREATION_SQL);

    const messages = event.Records || [];
    for (const record of messages) {
      const { action, payload } = JSON.parse(record.body);

      if (action === 'ADD') {
        await client.query(
          `INSERT INTO fish (caught_by, species, length_inches, catch_date)
           VALUES ($1, $2, $3, $4)`,
          [payload.caught_by, payload.species, payload.length_inches, payload.catch_date]
        );
      } else if (action === 'REMOVE') {
        await client.query(
          `DELETE FROM fish
           WHERE caught_by = $1 AND species = $2 AND length_inches = $3 AND catch_date = $4`,
          [payload.caught_by, payload.species, payload.length_inches, payload.catch_date]
        );
      }
    }

    console.log('Success');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (err) {
    console.error('Error processing request:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  } finally {
    await client.end();
  }
}
