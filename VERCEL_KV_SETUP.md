# Vercel KV Setup (5 Minutes)

This is the **quickest way** to make your chatbot widget work on external sites in production.

## 🚀 Step-by-Step Setup

### 1. Install Vercel KV Package

```bash
npm install @vercel/kv
```

### 2. Create Vercel KV Database

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Choose **KV** (Redis)
6. Give it a name (e.g., "chatbot-storage")
7. Click **Create**

### 3. Copy Environment Variables

Vercel will show you 2 variables:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

**For Local Development:**
1. Copy the variables
2. Paste them in your `.env.local` file

**For Production:**
- These are automatically added to your Vercel deployment ✅

### 4. Update Storage Code

Replace the content of `lib/server-storage.ts`:

```typescript
import { kv } from '@vercel/kv';
import { Chatbot, Question } from './types';
import { mockChatbots, mockQuestions } from './mock-data';

// Read chatbots from KV
export async function readChatbots(): Promise<Chatbot[]> {
  try {
    const chatbots = await kv.get<Chatbot[]>('chatbots');
    return chatbots || mockChatbots; // Fallback to mock data
  } catch (error) {
    console.error('Error reading chatbots from KV:', error);
    return mockChatbots;
  }
}

// Read questions from KV
export async function readQuestions(): Promise<Question[]> {
  try {
    const questions = await kv.get<Question[]>('questions');
    return questions || mockQuestions; // Fallback to mock data
  } catch (error) {
    console.error('Error reading questions from KV:', error);
    return mockQuestions;
  }
}

// Write chatbots to KV
export async function writeChatbots(chatbots: Chatbot[]): Promise<void> {
  try {
    await kv.set('chatbots', chatbots);
  } catch (error) {
    console.error('Error writing chatbots to KV:', error);
    throw error;
  }
}

// Write questions to KV
export async function writeQuestions(questions: Question[]): Promise<void> {
  try {
    await kv.set('questions', questions);
  } catch (error) {
    console.error('Error writing questions to KV:', error);
    throw error;
  }
}

// Get chatbot by ID
export async function getChatbotById(id: string): Promise<{ chatbot: Chatbot; questions: Question[] } | null> {
  const chatbots = await readChatbots();
  const questions = await readQuestions();

  const chatbot = chatbots.find(c => c.id === id);

  if (!chatbot) {
    return null;
  }

  const chatbotQuestions = questions.filter(q => q.chatbotId === id);

  return {
    chatbot,
    questions: chatbotQuestions
  };
}
```

### 5. Deploy to Vercel

```bash
# Commit changes
git add .
git commit -m "Add Vercel KV storage"

# Deploy
git push

# Or use Vercel CLI
vercel --prod
```

### 6. Set Production Environment Variable

1. Go to Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add: `NEXT_PUBLIC_APP_URL` = `https://your-app-name.vercel.app`
4. Redeploy

## ✅ That's It!

Your chatbot widget now works on **ANY website** with custom chatbots!

## 🧪 Testing

1. **Create a chatbot** in your dashboard
2. **Copy the embed code**
3. **Paste it on any HTML page:**
   ```html
   <script src="https://your-app.vercel.app/widget/chatbot-widget.js?id=YOUR_ID"></script>
   ```
4. **Open the page** → Widget works! 🎉

## 💰 Cost

**Vercel KV Free Tier:**
- 256 MB storage
- Unlimited requests
- Perfect for chatbot data (each chatbot ~1KB)
- **Can store ~256,000 chatbots on free tier!**

## 🔧 Troubleshooting

**Error: KV not configured**
- Make sure environment variables are set
- Redeploy after adding variables

**Chatbots not persisting**
- Check Vercel KV dashboard to verify data is being written
- Look at function logs in Vercel dashboard

**Widget not loading on external site**
- Verify `NEXT_PUBLIC_APP_URL` is set
- Check CORS headers are present (they should be)
- Open browser console for errors

## 📊 Monitoring

View your KV storage in Vercel Dashboard:
1. Go to **Storage** tab
2. Click your KV database
3. See data, metrics, and usage

## 🎯 Next Steps

1. ✅ Install `@vercel/kv`
2. ✅ Create KV database in Vercel
3. ✅ Update `lib/server-storage.ts`
4. ✅ Deploy
5. ✅ Test on external site
6. 🎉 Done!

**Estimated time: 5-10 minutes**
