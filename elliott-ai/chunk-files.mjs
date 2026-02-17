import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { encoding_for_model } from "@dqbd/tiktoken";
if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config({ path: "/Users/bryan/Projects/elliottprogrammer.com/.env" });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const documentsDir = path.resolve(__dirname, "documents");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  throw new Error("Missing env vars: ensure SUPABASE_URL, SUPABASE_SECRET_API_KEY, OPENAI_API_KEY are set.");
}

const encoder = encoding_for_model("gpt-3.5-turbo");
const tokenLength = (text) => encoder.encode(text).length;

const splitter = new RecursiveCharacterTextSplitter({
  // Token-aware recursion: split on paragraphs -> sentences -> words -> chars.
  chunkSize: 400,
  chunkOverlap: 80,
  lengthFunction: tokenLength,
  separators: ["\n\n", "\n", ". ", " ", ""],
});

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

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const embeddings = new OpenAIEmbeddings({
  apiKey: OPENAI_API_KEY,
  model: "text-embedding-3-small",
  dimensions: 1536,
});

const extractKeywords = (text, maxKeywords = 12) => {
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

const loadMarkdownFiles = async () => {
  const files = await fs.readdir(documentsDir);
  const markdownFiles = files.filter((file) => file.endsWith(".md"));
  if (!markdownFiles.length) {
    throw new Error(`No markdown files found in ${documentsDir}`);
  }
  const docs = [];
  for (const file of markdownFiles) {
    const raw = await fs.readFile(path.join(documentsDir, file), "utf8");
    docs.push({ file, content: raw });
  }
  return docs;
};

const chunkDocument = async ({ file, content }) => {
  const splits = await splitter.splitText(content);
  return splits.map((chunk, index) => {
    const tokens = tokenLength(chunk);
    const keywords = extractKeywords(chunk);
    return {
      content: chunk,
      metadata: {
        source: file,
        chunk: index + 1,
        total_chunks: splits.length,
        token_count: tokens,
        keywords,
        keyword_text: keywords.join(" "),
      },
    };
  });
};

const embedAndStore = async (documents) => {
  const batchSize = 90; // keeps OpenAI requests small and under Supabase row limits
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const vectors = await embeddings.embedDocuments(batch.map((d) => d.content));
    const rows = batch.map((doc, idx) => ({
      content: doc.content,
      embedding: vectors[idx],
      metadata: doc.metadata,
    }));

    const { error } = await supabase.from("documents").upsert(rows);
    if (error) {
      throw new Error(`Supabase upsert failed: ${error.message}`);
    }
  }
};

const main = async () => {
  console.log("Loading markdown documents...");
  const docs = await loadMarkdownFiles();

  let totalChunks = 0;
  for (const doc of docs) {
    const chunks = await chunkDocument(doc);
    totalChunks += chunks.length;
    console.log(`Chunked ${doc.file}: ${chunks.length} chunks`);
    await embedAndStore(chunks);
    console.log(`Stored chunks for ${doc.file}`);
  }

  encoder.free(); // release tiktoken WASM memory
  console.log(`Done. Stored ${totalChunks} chunks in Supabase.`);
};

main().catch((err) => {
  encoder.free();
  console.error(err);
  process.exit(1);
});
