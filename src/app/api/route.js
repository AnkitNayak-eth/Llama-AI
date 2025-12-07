import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Streaming chat API (JS equivalent of your Python example)
async function streamGroqChat(content) {
    const stream = await groq.chat.completions.create({
        model: "meta-llama/llama-4-maverick-17b-128e-instruct",
        messages: [
            {
                role: "user",
                content
            }
        ],
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: true
    });

    let finalText = "";

    for await (const chunk of stream) {
        const delta = chunk?.choices?.[0]?.delta?.content || "";
        finalText += delta;
    }

    return finalText.trim();
}

// Clean code extraction logic
async function getCleanCode(content) {
    const message = await streamGroqChat(content);

    // Extract code inside ``` blocks
    const codeMatch = message.match(/```(?:jsx|js)?([\s\S]*?)```/);
    let cleaned = codeMatch ? codeMatch[1].trim() : message.trim();

    // Remove comments
    cleaned = cleaned.replace(/^\s*\/\/.*$/gm, "").trim();       // single line
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, "").trim();    // multi-line

    return cleaned;
}

async function handleRequest(request) {
    const { searchParams } = new URL(request.url);
    const contentParam = searchParams.get('content');
    const codeParam = searchParams.get('code');

    // CODE MODE
    if (codeParam) {
        const response = await getCleanCode(codeParam);
        return new NextResponse(response, {
            headers: { "Content-Type": "text/plain" }
        });
    }

    // CHAT MODE
    const response = await streamGroqChat(contentParam || "Hi, how are you?");
    return NextResponse.json({ message: response });
}

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
