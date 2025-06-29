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

const Contestants = ['Jack', 'Mark', 'Brent', 'Bob', 'Glen']

function Place(name, place, value) {
  this.name = name;
  this.place = place;
  this.value = value;
}

function Contest(contest_name, first, second, third, fourth, fifth) {
  this.contest_name = contest_name;
  this.first = first;
  this.second = second;
  this.third = third;
  this.fourth = fourth;
  this.fifth = fifth;
}

/**
 * Creates a list of Contest objects from rows containing contest_name, contestant_name, and place
 * @param {Array} rows - Query results with contest_name, contestant_name, and place fields
 * @returns {Array} - Array of Contest objects
 */
function createContestsFromRows(rows) {
  // Get unique contest names
  const contestNames = [...new Set(rows.map(row => row.contest_name))];
  const contests = [];

  // Process each contest separately
  for (const contestName of contestNames) {
    // Filter rows for this specific contest
    const contestRows = rows.filter(row => row.contest_name === contestName);

    // Group contestants by place
    const placeMap = new Map();
    for (const row of contestRows) {
      if (!placeMap.has(row.place)) {
        placeMap.set(row.place, []);
      }
      placeMap.get(row.place).push({
        name: row.contestant_name,
        place: row.place,
        value: row.place
      });
    }

    // Sort each place group by name for consistent ordering of ties
    for (const contestants of placeMap.values()) {
      contestants.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Sort places in ascending order (1st, 2nd, 3rd, etc.)
    const sortedPlaces = Array.from(placeMap.keys()).sort((a, b) => a - b);
    
    // Prepare the five positions
    let first = null, second = null, third = null, fourth = null, fifth = null;
    
    // Track which position to fill next
    let positionIndex = 0;
    
    // Fill positions based on place order
    for (const place of sortedPlaces) {
      const contestants = placeMap.get(place);
      
      for (const contestant of contestants) {
        const placeObj = new Place(contestant.name, contestant.place, contestant.value);
        
        // Assign to the next available position
        if (positionIndex === 0 && !first) {
          first = placeObj;
          positionIndex++;
        } else if (positionIndex === 1 && !second) {
          second = placeObj;
          positionIndex++;
        } else if (positionIndex === 2 && !third) {
          third = placeObj;
          positionIndex++;
        } else if (positionIndex === 3 && !fourth) {
          fourth = placeObj;
          positionIndex++;
        } else if (positionIndex === 4 && !fifth) {
          fifth = placeObj;
          positionIndex++;
        }
        
        // Stop if we've filled all five positions
        if (positionIndex >= 5) break;
      }
      
      // Stop if we've filled all five positions
      if (positionIndex >= 5) break;
    }

    // Check for missing positions and add empty places
    if (!first) first = new Place('', 1, 0);
    if (!second) second = new Place('', 2, 0);
    if (!third) third = new Place('', 3, 0);
    if (!fourth) fourth = new Place('', 4, 0);
    if (!fifth) fifth = new Place('', 5, 0);

    // Create contest object and add to list
    const contest = new Contest(contestName, first, second, third, fourth, fifth);
    contests.push(contest);
  }

  return contests;
}
/**
 * Creates a Contest object from query results for a specific contest
 * @param {string} contestName - The name of the contest to extract
 * @param {Array} results - The rows returned by the contests query
 * @returns {Contest} - A contest object with the contest name and five place objects
 */
function createContestFromResults(contestName, results) {
  // Filter results to get only rows for this contest that have contestant_name
  const contestRows = results.filter(row => row.contestant_name);

  // Group contestants by their values to identify ties
  const valueMap = new Map();
  contestRows.forEach(row => {
    // Use the value directly from the row
    const value = parseFloat(row.value) || 0;

    if (!valueMap.has(value)) {
      valueMap.set(value, []);
    }
    valueMap.get(value).push({
      name: row.contestant_name,
      value: value
    });
  });

  // Sort values in descending order (highest value first)
  const sortedValues = Array.from(valueMap.keys()).sort((a, b) => b - a);

  // Assign places based on values, with equal values getting the same place
  let currentPlace = 1;
  const placeAssignments = [];  // Use array instead of Map to handle ties better

  sortedValues.forEach(value => {
    // Skip zero values - these will be handled separately
    if (value === 0) return;

    const contestants = valueMap.get(value);
    contestants.forEach(contestant => {
      placeAssignments.push({
        name: contestant.name,
        place: currentPlace,
        value: contestant.value
      });
    });
    currentPlace += contestants.length; // Skip places for ties
  });

  // Sort placeAssignments by place, then by name for predictable assignment
  placeAssignments.sort((a, b) => a.place - b.place || a.name.localeCompare(b.name));

  // Create a more direct position assignment array
  const positions = [null, null, null, null, null]; // [first, second, third, fourth, fifth]
  
  // First pass: assign contestants to positions based on natural order
  // This ensures we fill from 1st to 5th, handling ties properly
  let posIndex = 0;
  for (const assignment of placeAssignments) {
    if (posIndex < 5) {
      positions[posIndex] = new Place(assignment.name, assignment.place, assignment.value);
      posIndex++;
    }
  }
  
  // Fill any remaining empty positions
  const existingContestants = contestRows.map(row => row.contestant_name);
  const missingContestants = Contestants.filter(name => !existingContestants.includes(name));
  
  // Determine the next available place for "no value" contestants
  const nextPlace = currentPlace;
  
  // Add missing contestants to any null positions
  let missingIndex = 0;
  for (let i = 0; i < positions.length; i++) {
    if (!positions[i]) {
      if (missingContestants[missingIndex]) {
        positions[i] = new Place(missingContestants[missingIndex], nextPlace, 0);
        missingIndex++;
      } else {
        positions[i] = new Place('', i+1, 0);
      }
    }
  }
  
  // Create and return the Contest object with properly assigned positions
  return new Contest(
    contestName, 
    positions[0] || new Place('', 1, 0),
    positions[1] || new Place('', 2, 0),
    positions[2] || new Place('', 3, 0),
    positions[3] || new Place('', 4, 0),
    positions[4] || new Place('', 5, 0)
  );
}
/**
 * Creates a tournament contest by summing places across all contests for each contestant
 * @param {Array} contests - Array of Contest objects
 * @returns {Contest} - A tournament contest object with places determined by summed places
 */
function createTournamentFromContests(contests) {
  // Initialize score object to track total places for each contestant
  const scores = {};
  Contestants.forEach(name => {
    scores[name] = 0;
  });

  // Sum up places for each contestant across all contests
  contests.forEach(contest => {
    const places = [contest.first, contest.second, contest.third, contest.fourth, contest.fifth];
    places.forEach(place => {
      if (place && place.name) {
        // Add the place value to the contestant's score (lower is better)
        scores[place.name] = (scores[place.name] || 0) + place.place;
      }
    });
  });

  // Convert scores object to array of contestant objects with total score
  const contestantScores = Object.entries(scores).map(([name, score]) => ({
    name,
    score
  }));

  // Sort by score (lower is better)
  contestantScores.sort((a, b) => a.score - b.score);

  // Assign places based on scores, with equal scores getting the same place
  let currentPlace = 1;
  let prevScore = -1;
  let placeObjects = [];

  contestantScores.forEach((contestant, index) => {
    // If this score is different from previous score, assign a new place
    if (index === 0 || contestant.score !== prevScore) {
      currentPlace = index + 1;
    }

    // Create a Place object for this contestant
    const placeObj = new Place(contestant.name, currentPlace, contestant.score);
    placeObjects.push(placeObj);

    prevScore = contestant.score;
  });

  // Fill in the first through fifth place objects
  const first = placeObjects[0] || new Place('', 1, 0);
  const second = placeObjects[1] || new Place('', 2, 0);
  const third = placeObjects[2] || new Place('', 3, 0);
  const fourth = placeObjects[3] || new Place('', 4, 0);
  const fifth = placeObjects[4] || new Place('', 5, 0);

  return new Contest('Tournament', first, second, third, fourth, fifth);
}

const getContestsQuery = `
  select contests.contest_date, contests.contest_name,  contestants.contestant_name, places.place
    from contests 
      left join places on contests.id = places.contest_id
    left join contestants on places.name_id = contestants.id
    order by contest_name, place`;

const getWalleyeCountQuery = `
  select contestants.contestant_name, count(fish.length_in) as value
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'walleye'
  group by contestant_name
  order by value desc`;

const getWalleyeOver20Query = `
  select contestants.contestant_name, count(fish.length_in) as value
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'walleye'
  	and fish.length_in >= 20
  group by contestant_name
  order by value desc`;

const getMostFishQuery = `
  select contestants.contestant_name, count(fish.length_in) as value
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  group by contestant_name
  order by value desc`;

const getLargestWalleyeQuery = `
  select contestants.contestant_name, max(fish.length_in) as value
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'walleye'
  group by contestant_name
  order by value desc`;

const getLargestNorthernQuery = `
  select contestants.contestant_name, max(fish.length_in) as value
  from fish 
  	left join fish_species on fish.species_id = fish_species.id
	left join contestants on fish.name_id = contestants.id
  where fish_species.species ilike 'northern'
  group by contestant_name
  order by value desc`;

const getLargestBassQuery = `
  select contestants.contestant_name, max(fish.length_in) as value
    from fish 
      left join fish_species on fish.species_id = fish_species.id
    left join contestants on fish.name_id = contestants.id
    where fish_species.species ilike 'bass'
    group by contestant_name
    order by value desc`;

const getLargestPerchQuery = `
  select contestants.contestant_name, max(fish.length_in) as value
    from fish 
      left join fish_species on fish.species_id = fish_species.id
    left join contestants on fish.name_id = contestants.id
    where fish_species.species ilike 'perch'
    group by contestant_name
    order by value desc`;

const getLargestCrappieQuery = `
  select contestants.contestant_name, max(fish.length_in) as value
    from fish 
      left join fish_species on fish.species_id = fish_species.id
    left join contestants on fish.name_id = contestants.id
    where fish_species.species ilike 'crappie'
    group by contestant_name
    order by value desc`;

const getLargestMuskyQuery = `
  select contestants.contestant_name, max(fish.length_in) as value
    from fish 
      left join fish_species on fish.species_id = fish_species.id
    left join contestants on fish.name_id = contestants.id
    where fish_species.species ilike 'musky'
    group by contestant_name
    order by value desc`;

const getmostFishInOneDayQuery = `
  SELECT
    contestant_name,
    MAX(counter) AS value
FROM (
         SELECT
             contestant_name,
             COUNT(fish.id) AS counter
         FROM contestants
            left join fish on contestants.id = fish.name_id
         GROUP BY contestant_name, catch_date
     ) AS counts
GROUP BY contestant_name
ORDER BY value DESC;`;

export async function handler(event) {

  const client = new Client(DB_CONFIG);
  await client.connect();
  const contests = [];

  try {
    let contestsResult = await client.query(getContestsQuery);
    console.log('Contests query result:', contestsResult.rows);
    const regularContests = createContestsFromRows(contestsResult.rows);
    contests.push(...regularContests);

    let walleyeCountResult = await client.query(getWalleyeCountQuery);
    console.log('Walleye count query result:', walleyeCountResult.rows);
    contests.push(createContestFromResults('Most Walleye', walleyeCountResult.rows));

    let walleyeOver20Result = await client.query(getWalleyeOver20Query);
    console.log('Walleye over 20 inches query result:', walleyeOver20Result.rows);
    contests.push(createContestFromResults('Most Walleye Over 20 Inches', walleyeOver20Result.rows));

    let mostFishResult = await client.query(getMostFishQuery);
    console.log('Most fish query result:', mostFishResult.rows);
    contests.push(createContestFromResults('Most Fish', mostFishResult.rows));

    let largestWalleyeResult = await client.query(getLargestWalleyeQuery);
    console.log('Largest Walleye query result:', largestWalleyeResult.rows);
    contests.push(createContestFromResults('Largest Walleye', largestWalleyeResult.rows));

    let largestNorthernResult = await client.query(getLargestNorthernQuery);
    console.log('Largest Northern query result:', largestNorthernResult.rows);
    contests.push(createContestFromResults('Largest Northern', largestNorthernResult.rows));

    let largestBassResult = await client.query(getLargestBassQuery);
    console.log('Largest Bass query result:', largestBassResult.rows);
    contests.push(createContestFromResults('Largest Bass', largestBassResult.rows));

    let largestPerchResult = await client.query(getLargestPerchQuery);
    console.log('Largest Perch query result:', largestPerchResult.rows);
    contests.push(createContestFromResults('Largest Perch', largestPerchResult.rows));

    let largestCrappieResult = await client.query(getLargestCrappieQuery);
    console.log('Largest Crappie query result:', largestCrappieResult.rows);
    contests.push(createContestFromResults('Largest Crappie', largestCrappieResult.rows));

    let largestMuskyResult = await client.query(getLargestMuskyQuery);
    console.log('Largest Musky query result:', largestMuskyResult.rows);
    contests.push(createContestFromResults('Largest Musky', largestMuskyResult.rows));

    let mostFishInOneDayResult = await client.query(getmostFishInOneDayQuery);
    console.log('Most Fish in One Day query result:', mostFishInOneDayResult.rows);
    contests.push(createContestFromResults('Most Fish in One Day', mostFishInOneDayResult.rows));

    contests.unshift(createTournamentFromContests(contests));
    console.log('Final contests:', contests);
    return {
      statusCode: 200,
      body: JSON.stringify({ contests })
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
