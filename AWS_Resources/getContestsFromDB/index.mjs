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

const getContestsQuery = `
select contests.contest_date, contests.contest_name,  contestants.contestant_name, places.place
  from contests 
    left join places on contests.id = places.contest_id
	left join contestants on places.name_id = contestants.id
  order by contest_name, place`;

const getWalleyeCountQuery = `
select contestants.contestant_name, count(fish.length_in) as walleye_count
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'walleye'
  group by contestant_name
  order by walleye_count`;

const getWalleyeOver20Query = `
select contestants.contestant_name, count(fish.length_in) as walleye_count
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'walleye'
  	and fish.length_in >= 20
  group by contestant_name
  order by walleye_count`;

const getMostFishQuery = `
select contestants.contestant_name, count(fish.length_in) as fish_count
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  group by contestant_name
  order by fish_count desc`;

const getLargestWalleyeQuery = `
select contestants.contestant_name, max(fish.length_in) as biggest_walleye
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'walleye'
  group by contestant_name
  order by biggest_walleye desc`;

const getLargestNorthernQuery = `
select contestants.contestant_name, max(fish.length_in) as biggest_northern
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'northern'
  group by contestant_name
  order by biggest_northern desc`;

const getLargestBassQuery = `
select contestants.contestant_name, max(fish.length_in) as biggest_bass
  from fish 
    left join fish_species on fish.species_id = fish_species.id
  left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'bass'
  group by contestant_name
  order by biggest_bass desc`;

const getLargestPerchQuery = `
select contestants.contestant_name, max(fish.length_in) as biggest_perch
  from fish 
    left join fish_species on fish.species_id = fish_species.id
  left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'perch'
  group by contestant_name
  order by biggest_perch desc`;
  
const getLargestCrappieQuery = `
select contestants.contestant_name, max(fish.length_in) as biggest_crappie
  from fish 
    left join fish_species on fish.species_id = fish_species.id
  left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'crappie'
  group by contestant_name
  order by biggest_crappie desc`;

const getLargestMuskyQuery = `
select contestants.contestant_name, max(fish.length_in) as biggest_musky
  from fish 
    left join fish_species on fish.species_id = fish_species.id
  left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'musky'
  group by contestant_name
  order by biggest_musky desc`;

const getmostFishInOneDayQuery = `
SELECT
    contestant_name,
    MAX(counter) AS max_counter
FROM (
         SELECT
             contestant_name,
             COUNT(fish.id) AS counter
         FROM contestants
            left join fish on contestants.id = fish.contestant_id
         WHERE fish.catch_date > '2025-01-01'
         GROUP BY contestant_name, catch_date
     ) AS counts
GROUP BY contestant_name
ORDER BY max_counter DESC;`;
export async function handler(event) {

  const client = new Client(DB_CONFIG);
  await client.connect();

  try {
    let contestsResult = await client.query(getContestsQuery);
    contestsResult = contestsResult.rows;
    let walleyeCountResult = await client.query(getWalleyeCountQuery);
    walleyeCountResult = walleyeCountResult.rows;
    let walleyeOver20Result = await client.query(getWalleyeOver20Query);
    walleyeOver20Result = walleyeOver20Result.rows;
    let mostFishResult = await client.query(getMostFishQuery);
    mostFishResult = mostFishResult.rows;
    let largestWalleyeResult = await client.query(getLargestWalleyeQuery);
    largestWalleyeResult = largestWalleyeResult.rows;
    let largestNorthernResult = await client.query(getLargestNorthernQuery);
    largestNorthernResult = largestNorthernResult.rows;
    let largestBassResult = await client.query(getLargestBassQuery);
    largestBassResult = largestBassResult.rows;
    let largestPerchResult = await client.query(getLargestPerchQuery);
    largestPerchResult = largestPerchResult.rows;
    let largestCrappieResult = await client.query(getLargestCrappieQuery);
    largestCrappieResult = largestCrappieResult.rows;
    let largestMuskyResult = await client.query(getLargestMuskyQuery);
    largestMuskyResult = largestMuskyResult.rows;
    let mostFishInOneDayResult = await client.query(getmostFishInOneDayQuery);
    mostFishInOneDayResult = mostFishInOneDayResult.rows;

    
    return {
      statusCode: 200,
      body: `FIXME`
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
