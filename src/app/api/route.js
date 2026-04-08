import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


// =========================
// 🧠 UNIVERSAL PROMPT
// =========================
function buildPrompt(input) {
    return [
        {
            role: "system",
            content: `
You are an expert software engineer across all languages and frameworks.

Capabilities:
- Java (Spring Boot)
- JavaScript (Node.js, React, MERN, MEAN)
- Python (FastAPI, Flask, Django)
- System design and APIs

STRICT RULES:
- Fully understand the problem first
- Generate COMPLETE working solution
- If multiple files are needed → return ALL files
- Do NOT skip logic
- Do NOT explain anything
- Output ONLY code inside code blocks
- Ensure correctness and best practices
- Code should be directly usable
`
        },
        {
            role: "user",
            content: `
Solve this completely:

${input}

Return format:

// filename
\`\`\`
code
\`\`\`
`
        }
    ];
}


// =========================
// 🤖 LLM CALL
// =========================
async function callLLM(messages) {
    const stream = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.2,
        reasoning_effort: "high",
        max_completion_tokens: 8192,
        stream: true
    });

    let output = "";

    for await (const chunk of stream) {
        output += chunk?.choices?.[0]?.delta?.content || "";
    }

    return output.trim();
}


// =========================
// 📦 EXTRACT CODE
// =========================
function extractCode(text) {
    const matches = [...text.matchAll(/```[\w]*\n([\s\S]*?)```/g)];

    if (matches.length === 0) return text.trim();

    return matches.map(m => m[1].trim()).join("\n\n");
}


// =========================
// ✅ UNIVERSAL VALIDATION
// =========================
function validate(code) {
    // basic universal checks

    if (!code || code.length < 50) return false;

    // must contain some structure
    const hasClass = code.includes("class ");
    const hasFunction = code.includes("function") || code.includes("def ");

    return hasClass || hasFunction;
}


// =========================
// 🔧 REPAIR PASS
// =========================
async function repair(code) {
    return await callLLM([
        {
            role: "system",
            content: `
Fix and complete the code.

Rules:
- Add missing parts
- Ensure full working solution
- If multiple files are needed, include them
- Output ONLY code
`
        },
        {
            role: "user",
            content: code
        }
    ]);
}


// =========================
// 🔁 PIPELINE
// =========================
async function generateCode(input) {

    let output = await callLLM(buildPrompt(input));
    let code = extractCode(output);

    let attempts = 0;

    while (!validate(code) && attempts < 2) {
        output = await repair(code);
        code = extractCode(output);
        attempts++;
    }

    return code;
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
// EXPORTS
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