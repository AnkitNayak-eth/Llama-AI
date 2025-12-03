import { NextResponse } from 'next/server';
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Call Groq LLaMA chat API
async function getGroqChatCompletion(content) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: content
            }
        ],
        model: "llama-3.3-70b-versatile"
    });
}

// Process the response for clean code
async function getCleanCode(content) {
    const chatCompletion = await getGroqChatCompletion(content);
    let message = chatCompletion.choices[0]?.message?.content || "";

    // Extract code inside ``` blocks
    const codeMatch = message.match(/```(?:jsx|js)?([\s\S]*?)```/);
    if (codeMatch) {
        message = codeMatch[1].trim();
    }

    // Remove single-line comments
    message = message.replace(/^\s*\/\/.*$/gm, "").trim();

    // Remove multi-line comments
    message = message.replace(/\/\*[\s\S]*?\*\//g, "").trim();

    return message;
}

// Handle both GET and POST requests
async function handleRequest(request) {
    const { searchParams } = new URL(request.url);
    const contentParam = searchParams.get('content');
    const codeParam = searchParams.get('code');

    if (codeParam) {
        // Return clean code as plain text
        const response = await getCleanCode(codeParam);
        return new NextResponse(response, {
            headers: { "Content-Type": "text/plain" }
        });
    } else {
        // Return normal chat response as JSON
        const response = await getGroqChatCompletion(contentParam || "Hi, how are you?");
        const message = response.choices[0]?.message?.content || "";
        return NextResponse.json({ message });
    }
}

export async function GET(request) {
    try {
        return await handleRequest(request);
    } catch (error) {
        console.error(error);
        return new NextResponse('An error occurred', { status: 500 });
    }
}

export async function POST(request) {
    try {
        return await handleRequest(request);
    } catch (error) {
        console.error(error);
        return new NextResponse('An error occurred', { status: 500 });
    }
}
