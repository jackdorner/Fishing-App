import { Client } from 'pg';

const DB_CONFIG = {
  host: process.env.DB_HOST,       // e.g. your-db.abc123.us-east-2.rds.amazonaws.com
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // For self-signed certs, otherwise use true
  }
};

const FISH_TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS fish (
  id SERIAL PRIMARY KEY,
  caught_by TEXT NOT NULL,
  species TEXT NOT NULL,
  length_inches NUMERIC NOT NULL,
  catch_date DATE NOT NULL
);
`;

const CONTESTS_TABLE_CREATION_SQL = `
CREATE TABLE IF NOT EXISTS contests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contest_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contest_places (
  id SERIAL PRIMARY KEY,
  contest_id INTEGER REFERENCES contests(id) ON DELETE CASCADE,
  place_number INTEGER NOT NULL,
  participant_name TEXT NOT NULL,
  UNIQUE(contest_id, place_number)
);
`;

export async function handler(event) {
  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    // Create tables if they don't exist
    await client.query(FISH_TABLE_CREATION_SQL);
    await client.query(CONTESTS_TABLE_CREATION_SQL);

    const messages = event.Records || [];
    for (const record of messages) {
      const { action, payload, type } = JSON.parse(record.body);

      if (type === 'FISH') {
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
      } else if (type === 'CONTEST') {
        if (action === 'ADD') {
          // First insert the contest
          const contestResult = await client.query(
            `INSERT INTO contests (name, contest_date)
             VALUES ($1, $2)
             RETURNING id`,
            [payload.name, payload.date]
          );
          
          const contestId = contestResult.rows[0].id;
          
          // Then insert all places
          if (payload.places && Array.isArray(payload.places)) {
            for (const place of payload.places) {
              await client.query(
                `INSERT INTO contest_places (contest_id, place_number, participant_name)
                 VALUES ($1, $2, $3)`,
                [contestId, place.place, place.name]
              );
            }
          }
        } else if (action === 'REMOVE') {
          // Contest places will be automatically deleted due to CASCADE
          await client.query('DELETE FROM contests WHERE id = $1', [payload.id]);
        }
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
