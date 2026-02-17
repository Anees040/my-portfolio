const { ReadableStream } = require("node:stream/web");
const { TextEncoder } = require("node:util");
const { stream: netlifyStream } = require("@netlify/functions");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = netlifyStream(async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let question = "";
  try {
    const body = JSON.parse(event.body || "{}");
    question = (body.question || "").trim();
  } catch (err) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!question) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing 'question' in request body" }),
    };
  }

  // Lazy import to keep cold starts smaller.
  const { streamAnswer } = await import("../elliott-ai/query-vector-store.mjs");
  const encoder = new TextEncoder();

  const sseStream = new ReadableStream({
    async start(controller) {
      try {
        const { matches } = await streamAnswer(question, (token) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "token", token })}\n\n`));
        });

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "metadata", matches })}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: error.message || "Unknown error" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...corsHeaders,
    },
    body: sseStream,
  };
});
