// src/app/api/route.js

import { NextResponse } from 'next/server';
import { Ollama } from 'ollama';
import Groq from 'groq-sdk';

export const runtime = "nodejs";

// ✅ Ollama Cloud Client
const ollamaClient = new Ollama({
    host: 'https://ollama.com',
    headers: {
        Authorization: 'Bearer ' + process.env.OLLAMA_API_KEY
    }
});

// ✅ Groq Client
const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY
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
// 🤖 FAST LLM CALL (OLLAMA)
// =========================
async function callOllama(messages) {
    const response = await ollamaClient.chat({
        model: 'qwen3-coder-next:cloud',
        messages,
        options: {
            temperature: 0.2
        }
    });

    return response.message?.content?.trim() || "";
}

// =========================
// 🤖 FAST LLM CALL (GROQ)
// =========================
async function callGroq(input) {
    const response = await groqClient.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant."
            },
            {
                role: "user",
                content: input
            }
        ],
        model: "openai/gpt-oss-120b", 
        temperature: 0.5,
        max_tokens: 1024,
    });

    return response.choices[0]?.message?.content?.trim() || "";
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
    const raw = await callOllama(buildPrompt(input));
    return formatFiles(raw);
}

async function generateText(input) {
    return await callGroq(input);
}


// =========================
// 🌐 HANDLER
// =========================
async function handleRequest(request) {
    const { searchParams } = new URL(request.url);

    const codeInput = searchParams.get('code');
    const textInput = searchParams.get('text');

    let result = "";

    if (codeInput) {
        result = await generateCode(codeInput);
    } else if (textInput) {
        result = await generateText(textInput);
    } else {
        const defaultInput = searchParams.get('content') || "Hello";
        result = await generateCode(defaultInput); // fallback to ollama
    }

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