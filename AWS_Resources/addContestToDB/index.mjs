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
      const body = JSON.parse(record.body); // Parse the string into an object

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

      const insertQuery = `insert into fish (length_in, catch_date, name_id, species_id) values (${lengthIn}, \'${catchDate}\', ${nameId}, ${speciesId})`;
      console.log(`🔹 Inserting fish: ${insertQuery}`);
      await client.query(insertQuery);
    }
  } catch (err) {
    console.error("🔥 Error adding fish to DB:", err);
  } finally {
    await client.end();
  }
};
