import { NextResponse } from 'next/server';
import { getCrawledContent, createMessage, getSessionById } from '@/lib/supabase/database';
import OpenAI from "openai";

// Using GitHub Models (OpenAI SDK)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ENDPOINT = "https://models.github.ai/inference";
const MODEL_NAME = "gpt-4o";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
    try {
        const { chatbotId, message, sessionId } = await request.json();

        if (!chatbotId || !message || !sessionId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400, headers: corsHeaders }
            );
        }

        // 1. Get Knowledge Base (Crawled Content)
        const crawledData = await getCrawledContent(chatbotId);

        let contextText = "";
        if (crawledData && crawledData.length > 0) {
            contextText = crawledData
                .map(item => `SOURCE: ${item.url}\nTITLE: ${item.extracted_title || 'No Title'}\nCONTENT:\n${item.raw_text}\n---\n`)
                .join('\n')
                .substring(0, 30000);
        } else {
            console.log(`No knowledge base found for chatbot ${chatbotId}`);
        }

        // 2. Prepare System Message with Knowledge Base
        const systemMessage = `You are a helpful customer support AI assistant for a website.
Use the following Knowledge Base to answer the user's question.
If the answer is found in the Knowledge Base, be concise and helpful.
If the answer is NOT in the Knowledge Base, you may answer using general knowledge but be polite and mention you don't have specific info on that from the website.
Always check the Knowledge Base first.

Knowledge Base:
${contextText || "No website content available yet."}`;

        // 3. Call GitHub Models (OpenAI SDK)
        if (!GITHUB_TOKEN) {
            throw new Error("GITHUB_TOKEN is not set in environment variables");
        }

        const client = new OpenAI({ baseURL: ENDPOINT, apiKey: GITHUB_TOKEN });

        console.log('Sending chat request to GitHub Models:', MODEL_NAME);

        const response = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: message }
            ],
            temperature: 0.3,
            max_tokens: 500,
            model: MODEL_NAME
        });

        const botResponse = response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

        // 4. Save Bot Message to DB
        let savedMessage = null;
        try {
            savedMessage = await createMessage({
                session_id: sessionId,
                sender: 'bot',
                message_text: botResponse,
                matched_question_id: null,
            });
        } catch (dbError) {
            console.error("Failed to save bot message to DB:", dbError);
        }

        return NextResponse.json({
            success: true,
            answer: botResponse,
            messageId: savedMessage?.id
        }, { headers: corsHeaders });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Helper function removed as logic is inline now

