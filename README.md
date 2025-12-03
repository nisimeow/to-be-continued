# Chatbot Builder

A modern, production-ready chatbot builder with AI-powered Q&A generation, analytics, and customizable widgets.

## Features

### Chatbot Management
- Create multiple chatbots with custom branding
- Customize chatbot colors (primary, secondary, text)
- Set custom welcome and fallback messages
- Live preview with device simulator
- Edit questions and answers inline
- Delete chatbots with confirmation

### AI-Powered Content Generation
- **Website Crawling**: Automatically extract content from any URL
- **Smart Q&A Generation**: AI generates relevant questions with concise answers (1-2 sentences)
- **Keyword Extraction**: Automatically generates 6-8 relevant keywords per question
- **Crawl History**: View and regenerate Q&As from previously crawled content

### Conversation Intelligence
- **Pattern Matching**: Keyword-based intelligent response matching
- **Default Responses**: Pre-configured responses for greetings, thanks, and goodbyes
- **Session Tracking**: Track every conversation with timestamps and duration
- **Message History**: Store all user and bot messages with matched question tracking

### Analytics Dashboard
- **Overview Charts**: Visualize conversations over time with interactive line charts
- **Top Questions**: See which questions are asked most frequently
- **Conversation Outcomes**: Pie chart showing resolved, unresolved, and ongoing conversations
- **Stats Cards**: Total conversations, average duration, total messages, response rate
- **Sessions List**: View detailed conversation history with full message threads
- **Insights Panel**: Get actionable insights based on usage patterns
- **Date Range Filtering**: View analytics for 7, 30, or 90 days

### Embeddable Widget
- Vanilla JavaScript widget (works on any website)
- Real-time session tracking
- Automatic data syncing with backend
- Responsive design for all devices
- localStorage caching for faster loads

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - PostgreSQL database with real-time subscriptions
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Recharts** - Data visualization library
- **Gemini API** - AI-powered content generation
- **Cheerio** - Web scraping for content extraction
- **React Hook Form + Zod** - Form validation
- **Sonner** - Toast notifications

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Gemini API key (free tier available)

### Environment Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd saas-chat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API (for AI-powered crawling)
GEMINI_API_KEY=your_gemini_api_key
```

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run the following SQL schema in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chatbots table
CREATE TABLE chatbots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  colors JSONB NOT NULL DEFAULT '{"primary": "#3B82F6", "secondary": "#1E40AF", "text": "#1F2937"}',
  welcome_message TEXT,
  fallback_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default responses table
CREATE TABLE default_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_type TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  response_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crawled content table
CREATE TABLE crawled_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  raw_text TEXT,
  extracted_title TEXT,
  extracted_description TEXT,
  crawled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  message_count INTEGER DEFAULT 0
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  message_text TEXT NOT NULL,
  matched_question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default responses
INSERT INTO default_responses (response_type, keywords, response_template) VALUES
  ('greeting', ARRAY['hi', 'hello', 'hey', 'howdy', 'greetings'], 'Hi! I''m {chatbot_name}. How can I help you today?'),
  ('thanks', ARRAY['thanks', 'thank you', 'thx', 'appreciate'], 'You''re welcome! Let me know if you need anything else.'),
  ('goodbye', ARRAY['bye', 'goodbye', 'see you', 'later'], 'Goodbye! Have a great day!');

-- Create indexes
CREATE INDEX idx_questions_chatbot ON questions(chatbot_id);
CREATE INDEX idx_crawled_content_chatbot ON crawled_content(chatbot_id);
CREATE INDEX idx_sessions_chatbot ON chat_sessions(chatbot_id);
CREATE INDEX idx_messages_session ON chat_messages(session_id);

-- Create RPC function for incrementing message count
CREATE OR REPLACE FUNCTION increment_message_count(session_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE chat_sessions
  SET message_count = message_count + 1
  WHERE id = session_id;
END;
$$ LANGUAGE plpgsql;
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
saas-chat/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Main dashboard page
│   ├── edit/[id]/              # Chatbot editor
│   ├── preview/[id]/           # Preview with device switcher
│   ├── analytics/[id]/         # Analytics dashboard
│   ├── api/                    # API routes
│   │   ├── chatbot/[id]/      # Get chatbot data
│   │   ├── chatbots/          # CRUD operations
│   │   ├── questions/         # Question management
│   │   ├── crawl/             # Website crawler
│   │   └── sessions/          # Session tracking
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn components
│   ├── dashboard/             # Dashboard components
│   │   ├── ChatbotCard.tsx
│   │   ├── ChatbotSettings.tsx
│   │   ├── CreateChatbotDialog.tsx
│   │   ├── CrawlWebsiteDialog.tsx
│   │   ├── CrawlHistoryDialog.tsx
│   │   ├── EditQuestionDialog.tsx
│   │   ├── QAForm.tsx
│   │   └── QAManager.tsx
│   ├── analytics/             # Analytics components
│   │   ├── AnalyticsCharts.tsx
│   │   ├── SessionsList.tsx
│   │   └── ConversationViewer.tsx
│   └── Header.tsx
├── lib/
│   ├── supabase/             # Database utilities
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── database.ts       # Database operations
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Helper functions
├── public/
│   └── widget/
│       └── chatbot-widget.js # Embeddable widget
└── README.md
```

## Usage Guide

### Creating a Chatbot

1. Click "Create Chatbot" on the dashboard
2. Enter a name for your chatbot
3. Customize colors and messages
4. Click "Create"

### Adding Questions with AI

1. Click "Crawl Website" in the Q&A Manager
2. Enter any URL (e.g., your company website, documentation)
3. AI will extract content and generate 5 relevant Q&As
4. Review and edit the generated questions
5. View crawl history to regenerate Q&As later

### Managing Questions

1. **Add Manually**: Click "Add Question" for custom Q&As
2. **Edit**: Click "Edit" on any question to modify it
3. **Delete**: Remove questions you no longer need
4. **View History**: See all previously crawled content

### Embedding the Widget

1. Click "Copy Embed" from the chatbot card menu
2. Paste into your website's HTML:

```html
<script src="https://your-domain.com/widget/chatbot-widget.js?id=YOUR_CHATBOT_ID"></script>
```

### Viewing Analytics

1. Click "Analytics" on any chatbot card
2. **Overview Tab**: View charts and trends
3. **Sessions Tab**: See detailed conversation history
4. **Insights Tab**: Get actionable recommendations
5. Use date range filters to analyze different time periods

## Widget Features

The chatbot widget automatically:
- Creates a session on first message
- Tracks all messages with timestamps
- Records which questions were matched
- Calculates conversation duration
- Closes session when widget is closed or page unloads
- Uses `navigator.sendBeacon` for reliable tracking

## Pattern Matching Algorithm

The chatbot uses an intelligent scoring system:

1. **Default Responses** (highest priority): Greetings, thanks, goodbyes
2. **Keyword Matching**: +3 points per keyword match
3. **Question Word Matching**: +1 point per word match (>3 chars)
4. **Exact Match Bonus**: +10 points for exact question match
5. **Threshold**: Minimum score of 2 required
6. **Fallback**: Custom message if no match found

## AI Crawling Details

- **Content Extraction**: Uses Cheerio to parse HTML and extract main content
- **Smart Filtering**: Removes scripts, styles, navigation, headers, footers
- **Length Limit**: Processes up to 6000 characters (Gemini free tier)
- **Short Answers**: Generates 1-2 sentence answers (under 100 words)
- **Better Keywords**: 6-8 keywords including variations and common terms
- **Storage**: Stores raw content for future regeneration

## Demo Mode

Currently using a demo user (`demo@chatbot.local`). For production:
1. Implement real authentication (Supabase Auth, NextAuth, etc.)
2. Update `user_id` to use actual authenticated user IDs
3. Add row-level security policies in Supabase

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI generation | Yes |

## Performance Optimizations

- React.memo for expensive components
- Lazy loading for analytics page
- localStorage caching in widget
- Debounced search inputs
- Paginated session lists (20 per page)
- API response caching with stale-while-revalidate

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License

## Troubleshooting

### Widget not loading
- Check that the script URL is correct
- Verify CORS settings if hosting on different domain
- Check browser console for errors

### AI crawling fails
- Verify `GEMINI_API_KEY` is set correctly
- Some websites block scraping (check robots.txt)
- Try URLs with simpler HTML structure first

### Analytics not showing data
- Ensure widget is properly embedded on a live site
- Check that sessions are being created (look in database)
- Verify API routes are accessible

## Support

For issues and questions, please open an issue on GitHub.
