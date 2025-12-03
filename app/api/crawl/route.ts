import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { saveCrawledContent } from '@/lib/supabase/database';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: Request) {
  try {
    const { url, chatbotId } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!chatbotId) {
      return NextResponse.json(
        { error: 'Chatbot ID is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format. Please include http:// or https://' },
        { status: 400 }
      );
    }

    // Step 1: Fetch the webpage
    console.log('Fetching:', validUrl.toString());

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChatbotBuilder/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website. Status: ${response.status}. The site may be blocking automated access.` },
        { status: response.status }
      );
    }

    const html = await response.text();

    // Step 2: Extract content using Cheerio
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, header, iframe, noscript, svg').remove();

    // Extract text content
    const title = $('title').text().trim() || $('h1').first().text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    // Get main content (prioritize article, main, or body)
    let mainContent = '';
    if ($('article').length) {
      mainContent = $('article').text();
    } else if ($('main').length) {
      mainContent = $('main').text();
    } else {
      mainContent = $('body').text();
    }

    // Clean up whitespace
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 6000); // Limit to 6000 chars for free tier

    if (mainContent.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract enough content from the website. The site may use heavy JavaScript or block scraping.' },
        { status: 400 }
      );
    }

    console.log('Extracted content length:', mainContent.length);

    // Step 2.5: Store extracted content in database BEFORE calling AI
    try {
      const crawledContent = await saveCrawledContent({
        chatbot_id: chatbotId,
        url: validUrl.toString(),
        raw_text: mainContent,
        extracted_title: title || null,
        extracted_description: metaDescription || null,
      });
      console.log('Stored crawled content:', crawledContent.id);
    } catch (error) {
      console.error('Failed to store crawled content:', error);
      // Continue anyway - we still want to generate Q&As
    }

    // Step 3: Generate Q&As using Gemini REST API with IMPROVED PROMPT
    const geminiPrompt = `You are a helpful assistant that creates FAQ questions and answers based on website content.

Website Title: ${title}
Description: ${metaDescription}

Content:
${mainContent}

Based on this content, generate exactly 5 frequently asked questions with SHORT, CONCISE answers. Focus on:
- Practical questions users would actually ask
- CONCISE answers (1-2 sentences max, under 100 words)
- Be direct and friendly, not overly formal
- Relevant keywords for pattern matching (6-8 keywords per question, including variations)

IMPORTANT:
- Keep answers SHORT and conversational
- Avoid unnecessary explanations
- Get straight to the point

Return ONLY valid JSON in this exact format (no markdown, no code blocks, just raw JSON):
[
  {
    "question": "Question here?",
    "answer": "Short, concise answer here.",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"]
  }
]

Make sure questions are specific to this website's content.`;

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: geminiPrompt,
              },
            ],
          },
        ],
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        {
          error: 'AI service error. Content was saved, but Q&A generation failed.',
          metadata: {
            url: validUrl.toString(),
            title,
            contentLength: mainContent.length,
          }
        },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract text from Gemini response
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return NextResponse.json(
        { error: 'No content generated. Please try again.' },
        { status: 500 }
      );
    }

    console.log('AI Response:', generatedText);

    // Parse JSON response (handle markdown code blocks if present)
    let jsonText = generatedText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const questions = JSON.parse(jsonText);

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate valid questions. Please try again.' },
        { status: 500 }
      );
    }

    // Ensure each question has required fields
    const validQuestions = questions
      .filter(q => q.question && q.answer && Array.isArray(q.keywords))
      .map(q => ({
        question: q.question.trim(),
        answer: q.answer.trim(),
        keywords: q.keywords.map((k: string) => k.trim().toLowerCase()),
      }))
      .slice(0, 5); // Ensure max 5 questions

    console.log('Generated questions:', validQuestions.length);

    return NextResponse.json({
      success: true,
      questions: validQuestions,
      metadata: {
        url: validUrl.toString(),
        title,
        contentLength: mainContent.length,
      },
    });

  } catch (error: any) {
    console.error('Crawl error:', error);

    // Handle specific errors
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout. The website took too long to respond.' },
        { status: 408 }
      );
    }

    if (error.message?.includes('fetch')) {
      return NextResponse.json(
        { error: 'Could not connect to the website. It may be down or blocking automated access.' },
        { status: 500 }
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again or add questions manually.' },
      { status: 500 }
    );
  }
}
