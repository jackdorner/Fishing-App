import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv();
addFormats(ajv);
const sqs = new SQSClient({ region: "us-east-2" });
const QUEUE_URL = process.env.QUEUE_URL;

const contestSchema = {
  type: "object",
  required: ["contest_name", "contest_date", "place1", "place2", "place3", "place4", "place5"],
  properties: {
    contest_name: { type: "string" },
    contest_date: { type: "string", format: "date" },
    place1: { type: "string" },
    place2: { type: "string" },
    place3: { type: "string" },
    place4: { type: "string" },
    place5: { type: "string" }
  },
  additionalProperties: false
};

const validate = ajv.compile(contestSchema);

export const handler = async (event) => {
  console.log("🔹 Event received:", JSON.stringify(event, null, 2));

  let body;
  try {
    if (event.body) {
      body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } else {
      body = event;
    }
  } catch (err) {
    console.error("Invalid JSON: ", err);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Malformed JSON" }),
    };
  }

  if (validate(body)) {
    try {
      const result = await sqs.send(new SendMessageCommand({
        QueueUrl: QUEUE_URL,
        MessageBody: JSON.stringify(body),
      }));

      console.log(`✅ message sent to SQS:`, result.MessageId);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Contest added" }),
      };
    } catch (err) {
      console.error("🔥 Error sending to SQS:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      };
    }
  } else {
    console.log("🔥 Invalid input:", validate.errors);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Input doesn't match the contest schema" }),
    };
  }
};
