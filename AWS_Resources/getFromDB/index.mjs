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

    let result;
    
    if (dataType === 'CONTEST') {
      // Get contests with their places
      result = await client.query(`
        SELECT c.id, c.name, c.contest_date, c.created_at,
          json_agg(json_build_object('place', cp.place_number, 'name', cp.participant_name)) as places
        FROM contests c
        LEFT JOIN contest_places cp ON c.id = cp.contest_id
        GROUP BY c.id, c.name, c.contest_date, c.created_at
        ORDER BY c.contest_date DESC
      `);
    } else {
      // Default to fish data
      result = await client.query('SELECT * FROM fish ORDER BY catch_date DESC');
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: JSON.stringify(result.rows),
    };
  } catch (err) {
    console.error('Error fetching table contents:', err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS"
      },
      body: JSON.stringify({ error: err.message }),
    };
  } finally {
    await client.end();
  }
}
