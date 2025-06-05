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

      const name = body.name;
      const species = body.species;
      const lengthIn = body.length_in;
      const catchDate = body.catch_date;

      const getNameIdQuery = `select id from contestants where contestant_name ilike \'${name}\'`
      console.log(`🔹 Querying for name ID: ${getNameIdQuery}`);
      const getSpeciesIdQuery = `select id from fish_species where species ilike \'${species}\'`
      console.log(`🔹 Querying for species ID: ${getSpeciesIdQuery}`);

      let nameId = await client.query(getNameIdQuery);
      nameId = nameId.rows[0].id;
      let speciesId = await client.query(getSpeciesIdQuery);
      speciesId = speciesId.rows[0].id;

      const selectQuery = `select count(*) as fish_count from fish where length_in = ${lengthIn} and catch_date = \'${catchDate}\' and name_id = ${nameId} and species_id = ${speciesId}`;
      let fishCount = await client.query(selectQuery);
      fishCount = fishCount.rows[0].fish_count;
      if (fishCount === '0') {
        console.log("🔹 No matching fish found to remove.");
      } else {
        const removeQuery = `delete from fish where id = (select id from fish where length_in = ${lengthIn} and catch_date = \'${catchDate}\' and name_id = ${nameId} and species_id = ${speciesId} limit 1)`;
        console.log(`🔹 Removing fish: ${removeQuery}`);
        await client.query(removeQuery);
      }
    }
  } catch (err) {
    console.error("🔥 Error removing fish from DB:", err);
  } finally {
    await client.end();
  }
};
