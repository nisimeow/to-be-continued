import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { saveCrawledContent } from '@/lib/supabase/database';
import OpenAI from "openai";

// Using GitHub Models (OpenAI SDK)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const ENDPOINT = "https://models.github.ai/inference";
const MODEL_NAME = "gpt-4o";

export async function POST(request: Request) {
  try {
    const { url, chatbotId, mode = 'single_url', sources, extractOnly, storedContent } = await request.json();

    // ==========================================
    // MODE: REGENERATE FROM STORED CONTENT
    // ==========================================
    if (mode === 'regenerate' && storedContent) {
      console.log('Regenerating FAQs from stored content (OpenAI)...');

      const prompt = `You are a helpful assistant that creates FAQ questions and answers based on website content.

Website Title: ${storedContent.title || 'N/A'}
Description: ${storedContent.description || 'N/A'}

Content:
${storedContent.content}

Based on this content, generate exactly 2 frequently asked questions with SHORT, CONCISE answers. Focus on:
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

      let questions: any[] = [];
      try {
        const generatedText = await callOpenAI(prompt);
        questions = parseResponse(generatedText);
      } catch (genError) {
        console.warn('Regeneration failed (continuing with existing):', genError);
        questions = [
          {
            question: "Question generation failed",
            answer: "Please check your API key or model availability.",
            keywords: ["error"]
          }
        ];
      }

      return NextResponse.json({
        success: true,
        questions,
        metadata: {
          url: storedContent.url,
          title: storedContent.title,
          contentLength: storedContent.content?.length || 0,
        },
      });
    }

    // ==========================================
    // MODE: BATCH GENERATION (AI ONLY)
    // ==========================================
    if (mode === 'batch_generate') {
      if (!sources || !Array.isArray(sources) || sources.length === 0) {
        return NextResponse.json({ error: 'No sources provided for generation' }, { status: 400 });
      }

      console.log(`Batch generating FAQs from ${sources.length} pages (OpenAI)...`);

      // Combine content from all pages
      // Limit total context window to avoid token limits (approx 30k chars)
      const combinedContent = sources
        .map((s: any) => `URL: ${s.url}\nTITLE: ${s.title}\nCONTENT:\n${s.content}\n---\n`)
        .join('\n')
        .substring(0, 30000);

      const prompt = `You are a helpful assistant that creates FAQ questions and answers based on website content.

Context from ${sources.length} pages:
${combinedContent}

Based on this content, generate exactly 2 frequently asked questions with SHORT, CONCISE answers. Focus on:
- The most important questions across the entire website
- De-duplicate similar topics
- CONCISE answers (1-2 sentences max, under 100 words)
- Relevant keywords for pattern matching (6-8 keywords per question)

Return ONLY valid JSON in this exact format:
[
  {
    "question": "Question here?",
    "answer": "Short, concise answer here.",
    "keywords": ["keyword1", "keyword2"]
  }
]`;

      const generatedText = await callOpenAI(prompt);
      const questions = parseResponse(generatedText);

      // Save generated questions to database if needed (optional, or frontend handles it)
      // For now, just return them to the frontend

      return NextResponse.json({
        success: true,
        questions: questions
      });
    }

    // ==========================================
    // MODE: SINGLE URL (CRAWL ONLY or LEGACY)
    // ==========================================

    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    if (!chatbotId) return NextResponse.json({ error: 'Chatbot ID is required' }, { status: 400 });

    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // 1. Fetch
    const response = await fetchWithTimeout(validUrl.toString());
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website. Status: ${response.status}` },
        { status: response.status }
      );
    }

    // 2. Extract
    const html = await response.text();
    const $ = cheerio.load(html);
    $('script, style, nav, footer, header, iframe, noscript, svg').remove();
    const title = $('title').text().trim() || $('h1').first().text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';

    // Internal Links extraction
    const links = new Set<string>();
    const baseUrlObj = new URL(validUrl.toString());
    const domain = baseUrlObj.hostname;
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, validUrl.toString());
          if (absoluteUrl.hostname === domain && !absoluteUrl.hash && !/\.(jpg|jpeg|png|gif|pdf|zip|css|js|xml|ico)$/i.test(absoluteUrl.pathname)) {
            links.add(absoluteUrl.toString().replace(/\/$/, ''));
          }
        } catch (e) { }
      }
    });

    let mainContent = $('article').text() || $('main').text() || $('body').text();
    mainContent = mainContent.replace(/\s+/g, ' ').trim().substring(0, 6000);

    if (mainContent.length < 100) {
      return NextResponse.json(
        { error: 'Could not extract enough content from the website. The site may use heavy JavaScript or block scraping.' },
        { status: 400 }
      );
    }

    console.log(`Extracted ${mainContent.length} characters from ${validUrl.toString()}`);

    // Save to DB
    try {
      await saveCrawledContent({
        chatbot_id: chatbotId,
        url: validUrl.toString(),
        raw_text: mainContent,
        extracted_title: title || null,
        extracted_description: metaDescription || null,
      });
    } catch (e) {
      console.error('DB Save error:', e);
    }

    // IF Batch Mode was requested (implied by call type), we might just return text
    // But for backward compatibility, if mode is 'single_url' AND we want AI, we do it.
    // Ideally, for the new "Crawl Strategy", we just return the text.
    // Let's assume if the frontend passes `skipAI: true` (which we can read from body properties we haven't destructured yet, or just rely on 'mode')

    // For this refactor, let's treat 'single_url' as "Do everything" (Legacy)
    // AND add a check. If the user wants just extraction, they should have used a different mode or flag.
    // Let's accept a 'skipAI' flag for the "scrapping phase" of the batch process.

    // RE-READING request.json() to get skipAI
    // We already destructured. Let's add extractOnly


    if (extractOnly) {
      return NextResponse.json({
        success: true,
        metadata: {
          url: validUrl.toString(),
          title,
          contentLength: mainContent.length,
          links: Array.from(links).slice(0, 20),
          content: mainContent // Return content for client-side accumulation
        },
      });
    }

    // 3. Generate FAQs (Optional - Soft Fail)
    let questions: any[] = [];
    try {
      const prompt = `You are a helpful assistant that creates FAQ questions and answers based on website content.

Website Title: ${title}
Description: ${metaDescription}

Content:
${mainContent}

Based on this content, generate exactly 2 frequently asked questions with SHORT, CONCISE answers. Focus on:
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

      const generatedText = await callOpenAI(prompt);
      questions = parseResponse(generatedText);
    } catch (genError) {
      console.warn('FAQ Generation failed (continuing with crawl only):', genError);
      // We continue without questions. The content is already saved to DB.
      // We can add a "default" question if we want, or just empty.
      questions = [
        {
          question: "What is this website about?",
          answer: metaDescription || "I can answer questions based on the content of this website.",
          keywords: ["about", "summary", "info"]
        }
      ];
    }

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        url: validUrl.toString(),
        title,
        contentLength: mainContent.length,
        links: Array.from(links).slice(0, 20),
        warning: questions.length === 1 ? 'FAQ generation failed, using default.' : undefined
      },
    });

  } catch (error: any) {
    console.error('Crawl Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Helper: Fetch with Timeout
async function fetchWithTimeout(url: string, ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChatbotBuilder/1.0)' },
      signal: controller.signal
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

// Helper: Call OpenAI
async function callOpenAI(prompt: string) {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }

  console.log('Calling OpenAI (GitHub Models) for FAQ generation...');
  const client = new OpenAI({ baseURL: ENDPOINT, apiKey: GITHUB_TOKEN });

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant that generates JSON." },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1000,
    model: MODEL_NAME
  });

  const generatedText = response.choices[0].message.content || '';

  if (!generatedText) {
    console.error('OpenAI returned empty response');
    throw new Error('OpenAI returned no content.');
  }

  console.log('OpenAI response received, length:', generatedText.length);
  return generatedText;
}

// Helper: Parse Response
function parseResponse(text: string) {
  console.log('Parsing OpenAI response...');
  let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(jsonText);

    if (!Array.isArray(parsed)) {
      console.error('Response is not an array:', parsed);
      throw new Error('Invalid response format - expected array of questions');
    }

    const validQuestions = parsed.filter(q =>
      q.question && q.answer && Array.isArray(q.keywords)
    );

    console.log(`Parsed ${validQuestions.length} valid questions from ${parsed.length} total`);

    if (validQuestions.length === 0) {
      console.error('No valid questions found in response:', parsed);
      throw new Error('No valid questions generated. Please try again.');
    }

    return validQuestions;
  } catch (e) {
    console.error('Failed to parse response:', e);
    console.error('Raw response text:', text.substring(0, 500));
    throw new Error(`Failed to parse AI response: ${e instanceof Error ? e.message : 'Invalid JSON'}`);
  }
}
