import { NextResponse } from 'next/server';
const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function getGroqChatCompletion(content) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: content
            }
        ],
        model: "llama-3.2-3b-preview"
    });
}

async function main(content) {
    const chatCompletion = await getGroqChatCompletion(content);
    return chatCompletion.choices[0]?.message?.content || "";
}

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const content = searchParams.get('content') || 'HI how are you';
        const response = await main(content);
        return NextResponse.json({ message: response });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const content = searchParams.get('content') || 'HI how are you';
        const response = await main(content);
        return NextResponse.json({ message: response });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
