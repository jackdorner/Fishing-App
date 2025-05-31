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

function validate(body) {
    return (
      body &&
      typeof body.caught_by === "string" &&
      typeof body.species === "string" &&
      typeof body.length_inches === "number" &&
      typeof body.catch_date === "string" &&
      isValidDate(body.catch_date)
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

  let action;
  let isValid = validate(body);

  if (!isValid) {
    console.error("Invalid request");
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid request body",
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
    action,
    payload: body,
  };

  try {
    const result = await sqs.send(new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(message),
    }));

    console.log(`✅ ${action} message sent to SQS:`, result.MessageId);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Fish ${action === "ADD" ? "added" : "removed"} from queue` }),
    };
  } catch (err) {
    console.error("🔥 Error sending to SQS:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
