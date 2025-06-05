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
      const place1 = body.place1;
      const place2 = body.place2;
      const place3 = body.place3;
      const place4 = body.place4;
      const place5 = body.place5;

      const createContestQuery = `insert into contests (contest_name, contest_date) values (\'${contest_name}\', \'${contestDate}\') returning id`;
      console.log(`🔹 Inserting contest: ${createContestQuery}`);
      const contestResult = await client.query(createContestQuery);
      const contestId = contestResult.rows[0].id;

      const getNameId1Query = `select id from contestants where contestant_name ilike \'${place1}\'`
      const getNameId2Query = `select id from contestants where contestant_name ilike \'${place2}\'`
      const getNameId3Query = `select id from contestants where contestant_name ilike \'${place3}\'`
      const getNameId4Query = `select id from contestants where contestant_name ilike \'${place4}\'`
      const getNameId5Query = `select id from contestants where contestant_name ilike \'${place5}\'`

      let nameId1 = await client.query(getNameId1Query);
      nameId1 = nameId1.rows[0].id;
      let nameId2 = await client.query(getNameId2Query);
      nameId2 = nameId2.rows[0].id;
      let nameId3 = await client.query(getNameId3Query);
      nameId3 = nameId3.rows[0].id;
      let nameId4 = await client.query(getNameId4Query);
      nameId4 = nameId4.rows[0].id;
      let nameId5 = await client.query(getNameId5Query);
      nameId5 = nameId5.rows[0].id;

      const insertPlace1Query = `insert into places (contest_id, place, name_id) values (${contestId}, 1, ${nameId1})`;
      await client.query(insertPlace1Query);
      const insertPlace2Query = `insert into places (contest_id, place, name_id) values (${contestId}, 2, ${nameId2})`;
      await client.query(insertPlace2Query);
      const insertPlace3Query = `insert into places (contest_id, place, name_id) values (${contestId}, 3, ${nameId3})`;
      await client.query(insertPlace3Query);
      const insertPlace4Query = `insert into places (contest_id, place, name_id) values (${contestId}, 4, ${nameId4})`;
      await client.query(insertPlace4Query);
      const insertPlace5Query = `insert into places (contest_id, place, name_id) values (${contestId}, 5, ${nameId5})`;
      await client.query(insertPlace5Query);
    }
  } catch (err) {
    console.error("🔥 Error adding contest to DB:", err);
  } finally {
    await client.end();
  }
};
