import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { encoding_for_model } from "@dqbd/tiktoken";
if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config({ path: "/Users/bryan/Projects/elliottprogrammer.com/.env" });
}
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  throw new Error("Missing env vars: ensure SUPABASE_URL, SUPABASE_SECRET_API_KEY, OPENAI_API_KEY are set.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const embeddings = new OpenAIEmbeddings({
  apiKey: OPENAI_API_KEY,
  model: "text-embedding-3-small",
  dimensions: 1536,
});

const chatModel = new ChatOpenAI({
  apiKey: OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  temperature: 0.2,
});

const tokenEncoder = encoding_for_model("gpt-3.5-turbo");
const tokenLength = (text) => tokenEncoder.encode(text).length;

const stopwords = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "what",
  "when",
  "where",
  "who",
  "will",
  "with",
  "you",
]);

const extractKeywords = (text, maxKeywords = 8) => {
  const tokens = text.toLowerCase().match(/[a-z][a-z0-9'-]+/g) || [];
  const freq = new Map();
  for (const token of tokens) {
    if (stopwords.has(token)) continue;
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

const fetchSemanticMatches = async (query, matchCount = 8) => {
  const queryEmbedding = await embeddings.embedQuery(query);
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });
  if (error) {
    throw new Error(`Supabase match_documents RPC failed: ${error.message}`);
  }
  return (data || []).map((row) => ({
    ...row,
    source: row.metadata?.source,
    chunk: row.metadata?.chunk,
    score: row.similarity ?? 0,
    strategy: "vector",
  }));
};

const fetchKeywordMatches = async (query, limit = 6) => {
  const keywords = extractKeywords(query);
  if (!keywords.length) return [];
  const filters = keywords
    .map((word) => `metadata->>keyword_text.ilike.%${word}%`)
    .join(",");
  const { data, error } = await supabase
    .from("documents")
    .select("content, metadata")
    .or(filters)
    .limit(limit);
  if (error) {
    throw new Error(`Supabase keyword fetch failed: ${error.message}`);
  }
  return (data || []).map((row) => ({
    ...row,
    source: row.metadata?.source,
    chunk: row.metadata?.chunk,
    score: 0.25,
    strategy: "keyword",
  }));
};

const combineResults = (semantic, lexical, max = 10) => {
  const map = new Map();
  for (const item of [...semantic, ...lexical]) {
    const key = `${item.source || "unknown"}-${item.chunk || "na"}`;
    const existing = map.get(key);
    if (!existing || (item.score ?? 0) > (existing.score ?? 0)) {
      map.set(key, item);
    }
  }
  return [...map.values()]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, max);
};

const buildContext = (matches, maxContextTokens = 2000) => {
  const parts = [];
  let used = 0;
  for (const match of matches) {
    const text = match.content.trim();
    const tokens = tokenLength(text);
    if (used + tokens > maxContextTokens) break;
    used += tokens;
    const header = `Source: ${match.source || "unknown"} (chunk ${match.chunk || "?"}, via ${match.strategy})`;
    parts.push(`${header}\n${text}`);
  }
  return parts.join("\n\n");
};

const buildPrompt = (context, question) => {
  return [
    {
      role: "system",
      content:
        "You are Elliott-AI, an expert assistant answering questions about Bryan Elliott (Senior Software Engineer). " +
        "Use the the provided context to form your answer. If unsure, or not covered within the context, say you are unsure and suggest they reach out to Bryan directly. Keep answers concise and factual.",
    },
    {
      role: "user",
      content:
        `Context:\n${context}\n\nQuestion: ${question}\n\n` +
        "Answer concisely for a professional audience. Cite which source chunk you used when helpful.",
    },
  ];
};

export const answerQuestion = async (question) => {
  const semantic = await fetchSemanticMatches(question, 10);
  const keyword = await fetchKeywordMatches(question, 8);
  const matches = combineResults(semantic, keyword, 12);
  const context = buildContext(matches);
  const messages = buildPrompt(context, question);
  const response = await chatModel.invoke(messages);
  return {
    answer: response.content,
    matches,
  };
};

export const streamAnswer = async (question, onToken) => {
  const semantic = await fetchSemanticMatches(question, 10);
  const keyword = await fetchKeywordMatches(question, 8);
  const matches = combineResults(semantic, keyword, 12);
  const context = buildContext(matches);
  const messages = buildPrompt(context, question);

  const stream = await chatModel.stream(messages);
  for await (const chunk of stream) {
    const delta =
      typeof chunk?.content === "string"
        ? chunk.content
        : chunk?.message?.content || chunk?.delta?.content || "";
    if (!delta) continue;
    if (Array.isArray(delta)) {
      const text = delta.map((part) => (typeof part === "string" ? part : part?.text || "")).join("");
      if (text) onToken(text);
    } else if (typeof delta === "string") {
      onToken(delta);
    }
  }

  return { matches };
};

const main = async () => {
  const question = process.argv.slice(2).join(" ").trim();
  if (!question) {
    console.error("Usage: node elliott-ai/query-vector-store.mjs \"Your question about Bryan\"");
    process.exit(1);
  }

  console.log(`Querying for: ${question}`);
  const { answer, matches } = await answerQuestion(question);

  console.log("\n--- ANSWER ---");
  console.log(answer);

  console.log("\n--- CONTEXT CHUNKS USED ---");
  for (const match of matches) {
    console.log(
      `• [${match.strategy}] ${match.source || "unknown"} chunk ${match.chunk || "?"} (score ${match.score?.toFixed(3) ?? "n/a"})`
    );
  }
};

const isDirectRun = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
