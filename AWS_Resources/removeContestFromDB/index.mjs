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

export const handler = async (event) => {

  console.log("🔹 Event received:", JSON.stringify(event, null, 2));

  let client;
  try {
    client = new Client(DB_CONFIG);
    await client.connect();

    for (const record of event.Records) {
      const body = JSON.parse(record.body);

      const contest_name = body.contest_name;

      const getContestIdQuery = `select id from contests where contest_name ilike \'${contest_name}\'`

      let contestId = await client.query(getContestIdQuery);
      if (contestId.rows.length === 0) {
        console.log(`🔹 Contest "${contest_name}" not found.`);
      } else {
        contestId = contestId.rows[0].id;
        const removeContestQuery = `delete from contests where id = ${contestId}`;
        await client.query(removeContestQuery);
        const removePlacesQuery = `delete from places where contest_id = ${contestId}`;
        await client.query(removePlacesQuery);
      }
    }
  } catch (err) {
    console.error("🔥 Error removing fish from DB:", err);
  } finally {
    await client.end();
  }
};
