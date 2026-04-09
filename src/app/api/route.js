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
// 🧠 UNIVERSAL PROMPT
// =========================
function buildPrompt(input) {
    return [
        {
            role: "system",
            content: `
You are an expert software engineer across ALL languages and frameworks.

You solve problems EXACTLY as required (like HackerRank / LeetCode).

STRICT RULES:
- Understand the problem fully before coding
- Return COMPLETE working solution
- DO NOT skip logic
- DO NOT add explanations
- DO NOT add unnecessary changes
- Follow exact requirements from the problem

OUTPUT RULES:
- If multiple files are needed → return ALL files
- Keep code clean, minimal, and correct
- Do NOT over-engineer
- Do NOT add extra APIs or features

FORMAT STRICTLY:

// filename.ext
\`\`\`
code
\`\`\`

If format is broken, regenerate entire answer.
`
        },
        {
            role: "user",
            content: input
        }
    ];
}


// =========================
// 🤖 LLM CALL
// =========================
async function callLLM(messages) {
    const response = await client.chat({
        model: 'qwen3-coder-next:cloud',
        messages
    });

    return response.message.content.trim();
}


// =========================
// 🎨 FORMAT OUTPUT
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

    return output || text.trim();
}


// =========================
// ✅ VALIDATION (UNIVERSAL)
// =========================
function isValid(text) {
    if (!text || text.length < 50) return false;

    // Must contain at least code-like structure
    return (
        text.includes("class") ||
        text.includes("function") ||
        text.includes("def") ||
        text.includes("import")
    );
}


// =========================
// 🔧 REPAIR PASS
// =========================
async function repair(text) {
    return await callLLM([
        {
            role: "system",
            content: `
Fix and complete the code.

Rules:
- Ensure full working solution
- Add missing files if needed
- Maintain strict format:

// filename.ext
\`\`\`
code
\`\`\`
`
        },
        {
            role: "user",
            content: text
        }
    ]);
}


// =========================
// 🔁 MAIN PIPELINE
// =========================
async function generateCode(input) {

    let raw = await callLLM(buildPrompt(input));

    let attempts = 0;

    while (!isValid(raw) && attempts < 2) {
        raw = await repair(raw);
        attempts++;
    }

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