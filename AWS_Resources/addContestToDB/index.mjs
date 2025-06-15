import { Client } from 'pg';

const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
};

export const handler = async (event) => {

  console.log("🔹 Event received:", JSON.stringify(event, null, 2));

  let client;
  try {
    client = new Client(DB_CONFIG);
    await client.connect();

    for (const record of event.Records) {
      const body = JSON.parse(record.body); // Parse the string into an object

      const contest_name = body.contest_name;
      const contestDate = body.contest_date;
      
      // Create arrays for each place, handling both single names and arrays
      // Use empty arrays for missing places
      const place1 = body.place1 ? (Array.isArray(body.place1) ? body.place1 : [body.place1]) : [];
      const place2 = body.place2 ? (Array.isArray(body.place2) ? body.place2 : [body.place2]) : [];
      const place3 = body.place3 ? (Array.isArray(body.place3) ? body.place3 : [body.place3]) : [];
      const place4 = body.place4 ? (Array.isArray(body.place4) ? body.place4 : [body.place4]) : [];
      const place5 = body.place5 ? (Array.isArray(body.place5) ? body.place5 : [body.place5]) : [];

      const createContestQuery = `insert into contests (contest_name, contest_date) values (\'${contest_name}\', \'${contestDate}\') returning id`;
      console.log(`🔹 Inserting contest: ${createContestQuery}`);
      const contestResult = await client.query(createContestQuery);
      const contestId = contestResult.rows[0].id;

      // Process each place with potentially multiple contestants
      // Place 1
      for (const contestantName of place1) {
        try {
          const getNameIdQuery = `select id from contestants where contestant_name ilike \'${contestantName}\'`;
          const nameIdResult = await client.query(getNameIdQuery);
          if (nameIdResult.rows.length > 0) {
            const nameId = nameIdResult.rows[0].id;
            const insertPlaceQuery = `insert into places (contest_id, place, name_id) values (${contestId}, 1, ${nameId})`;
            await client.query(insertPlaceQuery);
          } else {
            console.log(`⚠️ Contestant not found: ${contestantName}`);
          }
        } catch (err) {
          console.error(`🔥 Error processing contestant ${contestantName}:`, err);
        }
      }
      
      // Place 2
      for (const contestantName of place2) {
        try {
          const getNameIdQuery = `select id from contestants where contestant_name ilike \'${contestantName}\'`;
          const nameIdResult = await client.query(getNameIdQuery);
          if (nameIdResult.rows.length > 0) {
            const nameId = nameIdResult.rows[0].id;
            const insertPlaceQuery = `insert into places (contest_id, place, name_id) values (${contestId}, 2, ${nameId})`;
            await client.query(insertPlaceQuery);
          } else {
            console.log(`⚠️ Contestant not found: ${contestantName}`);
          }
        } catch (err) {
          console.error(`🔥 Error processing contestant ${contestantName}:`, err);
        }
      }
      
      // Place 3
      for (const contestantName of place3) {
        try {
          const getNameIdQuery = `select id from contestants where contestant_name ilike \'${contestantName}\'`;
          const nameIdResult = await client.query(getNameIdQuery);
          if (nameIdResult.rows.length > 0) {
            const nameId = nameIdResult.rows[0].id;
            const insertPlaceQuery = `insert into places (contest_id, place, name_id) values (${contestId}, 3, ${nameId})`;
            await client.query(insertPlaceQuery);
          } else {
            console.log(`⚠️ Contestant not found: ${contestantName}`);
          }
        } catch (err) {
          console.error(`🔥 Error processing contestant ${contestantName}:`, err);
        }
      }
      
      // Place 4
      for (const contestantName of place4) {
        try {
          const getNameIdQuery = `select id from contestants where contestant_name ilike \'${contestantName}\'`;
          const nameIdResult = await client.query(getNameIdQuery);
          if (nameIdResult.rows.length > 0) {
            const nameId = nameIdResult.rows[0].id;
            const insertPlaceQuery = `insert into places (contest_id, place, name_id) values (${contestId}, 4, ${nameId})`;
            await client.query(insertPlaceQuery);
          } else {
            console.log(`⚠️ Contestant not found: ${contestantName}`);
          }
        } catch (err) {
          console.error(`🔥 Error processing contestant ${contestantName}:`, err);
        }
      }
      
      // Place 5
      for (const contestantName of place5) {
        try {
          const getNameIdQuery = `select id from contestants where contestant_name ilike \'${contestantName}\'`;
          const nameIdResult = await client.query(getNameIdQuery);
          if (nameIdResult.rows.length > 0) {
            const nameId = nameIdResult.rows[0].id;
            const insertPlaceQuery = `insert into places (contest_id, place, name_id) values (${contestId}, 5, ${nameId})`;
            await client.query(insertPlaceQuery);
          } else {
            console.log(`⚠️ Contestant not found: ${contestantName}`);
          }
        } catch (err) {
          console.error(`🔥 Error processing contestant ${contestantName}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("🔥 Error adding contest to DB:", err);
  } finally {
    if (client) {
      await client.end();
    }
  }
};
