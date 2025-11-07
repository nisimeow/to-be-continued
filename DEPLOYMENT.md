# Deployment Guide

## 🚀 Deploying to Vercel

### Quick Start (Temporary Solution)

For testing and small deployments, you can use **build-time data**:

1. **Deploy to Vercel:**
   ```bash
   vercel deploy
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - `NEXT_PUBLIC_APP_URL` = your production URL (e.g., `https://your-app.vercel.app`)

3. **Current Limitation:**
   - Chatbots created in the dashboard will only work in that browser session
   - External sites will only see the 3 mock chatbots (IDs: 1, 2, 3)

### Production Solution (Database Required)

For a production-ready deployment where custom chatbots work on external sites, you need a database.

## 📦 Option 1: Vercel KV (Easiest)

**Best for:** Quick setup, serverless-friendly, minimal cost

### Setup:

1. **Install Vercel KV:**
   ```bash
   npm install @vercel/kv
   ```

2. **Enable KV in Vercel Dashboard:**
   - Go to your project → Storage → Create Database
   - Choose "KV" (Redis)
   - Copy the environment variables

3. **Update `.env.local`:**
   ```
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   KV_REST_API_URL=your-kv-url
   KV_REST_API_TOKEN=your-kv-token
   ```

4. **Update `lib/server-storage.ts`:**
   Replace file system with KV:
   ```typescript
   import { kv } from '@vercel/kv';

   export async function readChatbots() {
     const chatbots = await kv.get('chatbots');
     return chatbots || [];
   }

   export async function writeChatbots(chatbots) {
     await kv.set('chatbots', chatbots);
   }
   ```

## 📦 Option 2: Vercel Postgres

**Best for:** Relational data, complex queries, larger scale

### Setup:

1. **Install Vercel Postgres:**
   ```bash
   npm install @vercel/postgres
   ```

2. **Enable Postgres in Vercel Dashboard:**
   - Storage → Create Database → Postgres

3. **Create Tables:**
   ```sql
   CREATE TABLE chatbots (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     colors JSONB NOT NULL,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE questions (
     id TEXT PRIMARY KEY,
     chatbot_id TEXT REFERENCES chatbots(id),
     question TEXT NOT NULL,
     answer TEXT NOT NULL,
     keywords TEXT[] NOT NULL
   );
   ```

## 📦 Option 3: Supabase (Recommended for Full Stack)

**Best for:** Full backend, authentication, real-time features

### Setup:

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create a new project

2. **Install Supabase Client:**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Create Tables in Supabase Dashboard:**
   ```sql
   -- Same tables as Postgres option above
   ```

## 🔄 Current Workaround (No Database)

If you don't want to set up a database yet, you can use **build-time data only**:

### What Works:
- ✅ Mock chatbots (IDs: 1, 2, 3) work on external sites
- ✅ Widget fully functional
- ✅ CORS enabled

### What Doesn't:
- ❌ Custom chatbots from dashboard won't work on external sites
- ❌ Changes won't persist between deployments

### How to Use:

1. Edit `lib/mock-data.ts` with your chatbots
2. Deploy to Vercel
3. Use embed code with mock chatbot IDs only

## 📝 Environment Variables Summary

### Required for All Deployments:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### For Vercel KV:
```env
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token
```

### For Vercel Postgres:
```env
POSTGRES_URL=your-postgres-url
```

### For Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Testing Production Build Locally

```bash
# Build
npm run build

# Start production server
npm start
```

## 📋 Pre-Deployment Checklist

- [ ] Set `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Choose and set up database (KV/Postgres/Supabase)
- [ ] Update `lib/server-storage.ts` to use your database
- [ ] Test API endpoint: `/api/chatbot/1`
- [ ] Test widget on external site
- [ ] Update embed code generator to use production URL

## 🎯 Recommended Approach

**For MVP/Testing:**
→ Use **Vercel KV** (fastest setup, ~5 minutes)

**For Production:**
→ Use **Supabase** (free tier, full features, scales well)

## 🆘 Common Issues

### "Chatbot not found" on external sites
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Verify API endpoint works: `https://your-domain.com/api/chatbot/1`
- Check CORS headers are present in response

### Widget not loading
- Verify embed code uses production URL
- Check browser console for CORS errors
- Ensure script tag is in `<body>`, not `<head>`

### Changes not persisting
- File system storage doesn't work on Vercel
- Switch to database solution (KV/Postgres/Supabase)

## 📞 Next Steps

1. **Choose your database solution** (KV recommended for quick start)
2. **Set up the database** (5-10 minutes)
3. **Update storage code** to use database instead of files
4. **Deploy to Vercel**
5. **Test with external site**

Need help? Check the specific database setup guide for your chosen solution!
