// src/app/api/route.js

import { NextResponse } from 'next/server';
import { Ollama } from 'ollama';
import Groq from 'groq-sdk';

export const runtime = "nodejs";

// Ollama Cloud Client
const ollamaClient = new Ollama({
    host: 'https://ollama.com',
    headers: {
        Authorization: 'Bearer ' + process.env.OLLAMA_API_KEY
    }
});

// Groq Client
const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// =========================
// UNIVERSAL PROMPT (OLLAMA)
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
// LLM CALL (OLLAMA)
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
// LLM CALL (GROQ)
// =========================
async function callGroq(input) {
    const userMessages = Array.isArray(input) ? input : [{ role: "user", content: input }];
    
    const response = await groqClient.chat.completions.create({
        messages: [
            {
                role: "system",
                content: "You are GPT-OSS, a smart and versatile AI assistant. Answer any question directly and concisely. Get straight to the point and keep your responses short. Avoid being overly verbose. Use markdown for formatting when it helps readability."
            },
            ...userMessages
        ],
        model: "openai/gpt-oss-120b",
        temperature: 0.5,
        max_tokens: 2048,
    });

    return response.choices[0]?.message?.content?.trim() || "";
}

// =========================
// CLEAN FORMATTER
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
// PIPELINE
// =========================
async function generateCode(input) {
    const raw = await callOllama(buildPrompt(input));
    return formatFiles(raw);
}

async function generateText(input) {
    return await callGroq(input);
}


// =========================
// HANDLER
// =========================
async function handleRequest(request) {
    let result = "";

    if (request.method === "POST") {
        try {
            const body = await request.json();
            if (body.messages) {
                result = await generateText(body.messages);
                return new NextResponse(result, {
                    headers: { "Content-Type": "text/plain" }
                });
            }
        } catch (e) {
            // fallback to searchParams if no JSON body
        }
    }

    const { searchParams } = new URL(request.url);
    const codeInput = searchParams.get('code');
    const textInput = searchParams.get('text');

    if (codeInput) {
        result = await generateCode(codeInput);
    } else if (textInput) {
        result = await generateText(textInput);
    } else {
        const defaultInput = searchParams.get('content') || "Hello";
        result = await generateCode(defaultInput);
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