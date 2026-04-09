// src/app/api/route.js

import { NextResponse } from 'next/server';
import { Ollama } from 'ollama';

export const runtime = "nodejs";

// ✅ Ollama Cloud Client
const client = new Ollama({
    host: 'https://ollama.com',
    headers: {
        Authorization: 'Bearer ' + process.env.OLLAMA_API_KEY
    }
});


// =========================
// 🧠 UNIVERSAL PROMPT (OPTIMIZED)
// =========================
function buildPrompt(input) {
    return [
        {
            role: "system",
            content: `
You are an expert software engineer across all languages.

Rules:
- Return COMPLETE working code
- Do NOT explain anything
- Do NOT skip logic
- Keep code minimal and correct

FORMAT STRICTLY:

// filename.ext
\`\`\`
code
\`\`\`

Return all required files.
`
        },
        {
            role: "user",
            content: input
        }
    ];
}


// =========================
// 🤖 FAST LLM CALL (NO STREAM, NO DELAY)
// =========================
async function callLLM(messages) {
    const response = await client.chat({
        model: 'qwen3-coder-next:cloud',
        messages,
        options: {
            temperature: 0.2
        }
    });

    return response.message?.content?.trim() || "";
}


// =========================
// 🎨 CLEAN FORMATTER
// =========================
function formatFiles(text) {
    const regex = /\/\/\s*(.+?)\n```[\w]*\n([\s\S]*?)```/g;

    let output = "";
    let match;

    while ((match = regex.exec(text)) !== null) {
        const fileName = match[1].trim();
        const code = match[2].trim();

        output += `${fileName}\n`;
        output += `${"-".repeat(fileName.length)}\n\n`;
        output += code + "\n\n\n";
    }

    // fallback (if model didn't follow format)
    if (!output) return text.trim();

    return output.trim();
}


// =========================
// 🚀 FAST PIPELINE (NO RETRIES)
// =========================
async function generateCode(input) {
    const raw = await callLLM(buildPrompt(input));
    return formatFiles(raw);
}


// =========================
// 🌐 HANDLER
// =========================
async function handleRequest(request) {
    const { searchParams } = new URL(request.url);

    const input =
        searchParams.get('code') ||
        searchParams.get('content') ||
        "Hello";

    const result = await generateCode(input);

    return new NextResponse(result, {
        headers: { "Content-Type": "text/plain" }
    });
}


// =========================
// GET / POST
// =========================
export async function GET(request) {
    try {
        return await handleRequest(request);
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function POST(request) {
    try {
        return await handleRequest(request);
    } catch (e) {
        console.error(e);
        return new NextResponse("Internal error", { status: 500 });
    }
}