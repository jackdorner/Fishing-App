import { Client } from 'pg';

const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // For self-signed certs, otherwise use true
  }
};

export async function handler(event) {

  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    // Determine the type of data to retrieve based on query parameters
    const queryParams = event.queryStringParameters || {};
    const dataType = queryParams.type ? queryParams.type.toUpperCase() : 'FISH';

    let result = await client.query(`
      SELECT fish_species.species, fish.length_in, fish.catch_date, contestants.contestant_name
      FROM fish 
      LEFT JOIN fish_species ON fish.species_id = fish_species.id
      LEFT JOIN contestants ON fish.name_id = contestants.id
      ORDER BY contestant_name, catch_date, species, length_in DESC
    `);

    console.log(`🔹 Fetched ${result.rowCount} rows from the database.`);

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
