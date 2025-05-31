import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

// SQS Setup
const sqs = new SQSClient({ region: "us-east-2" });
const QUEUE_URL = process.env.QUEUE_URL;

function isValidDate(str) {
    return !isNaN(Date.parse(str));
}

const fishSchema = {
  type: "object",
  required: ["caught_by", "species", "length_inches", "catch_date"],
  properties: {
    caught_by: { type: "string" },
    species: { type: "string" },
    length_inches: { type: "number" },
    catch_date: { type: "string", format: "date" }
  },
  additionalProperties: false
};

const contestSchema = {
  type: "object",
  required: ["name", "date", "places"],
  properties: {
    name: { type: "string" },
    date: { type: "string", format: "date" },
    places: { 
      type: "array", 
      items: {
        type: "object",
        required: ["place", "name"],
        properties: {
          place: { type: "number" },
          name: { type: "string" }
        }
      }
    }
  },
  additionalProperties: false
};

function validateFish(body) {
    return (
      body &&
      typeof body.caught_by === "string" &&
      typeof body.species === "string" &&
      typeof body.length_inches === "number" &&
      typeof body.catch_date === "string" &&
      isValidDate(body.catch_date)
    );
}

function validateContest(body, action = "ADD") {
  // For REMOVE action, only the contest name is required
  if (action === "REMOVE") {
    return body && typeof body.name === "string";
  }
  
  // For ADD action, full validation is required
  if (!body || typeof body.name !== "string" || !body.date || !isValidDate(body.date)) {
    return false;
  }
  
  if (!Array.isArray(body.places) || body.places.length === 0) {
    return false;
  }
  
  return body.places.every(place => 
    typeof place === "object" && 
    typeof place.place === "number" && 
    typeof place.name === "string"
  );
}

export const handler = async (event) => {
  console.log("🔹 Event received:", JSON.stringify(event, null, 2));

  const method = event.httpMethod || event.requestContext?.http?.method;

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    console.error("❌ Invalid JSON:", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Malformed JSON" }),
    };
  }

  // Determine the type of submission (fish or contest)
  const submissionType = body.type || "FISH";  // Default to fish for backward compatibility
  let action;
  let isValid = false;
  
  if (submissionType === "FISH") {
    isValid = validateFish(body.data || body);
    // For backward compatibility, if data is not provided, use the body directly
    body = body.data || body;
  } else if (submissionType === "CONTEST") {
    isValid = validateContest(body.data, method === "DELETE" ? "REMOVE" : "ADD");
    body = body.data;
  }

  if (!isValid) {
    console.error(`Invalid ${submissionType} request`);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Invalid ${submissionType} request body`,
        details: body,
      }),
    };
  } else if (method === "POST") {
    action = "ADD";
  } else if (method === "DELETE") {
    action = "REMOVE";
  } else {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // Send message to SQS
  const message = {
    type: submissionType,
    action,
    payload: body,
  };

  try {
    const result = await sqs.send(new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(message),
    }));

    console.log(`✅ ${submissionType} ${action} message sent to SQS:`, result.MessageId);
    
    const successMsg = submissionType === "FISH" 
      ? `Fish ${action.toLowerCase()}ed ${action === "REMOVE" ? "from" : "to"} queue`
      : `Contest ${action.toLowerCase()}ed ${action === "REMOVE" ? "from" : "to"} queue`;
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: successMsg }),
    };
  } catch (err) {
    console.error("🔥 Error sending to SQS:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
