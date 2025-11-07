# Chatbot Builder MVP

A modern, easy-to-use chatbot builder with customizable colors, Q&A management, and embeddable widgets.

## Features

- Create multiple chatbots with custom branding
- Add Q&A pairs with keyword-based matching
- Customize chatbot colors (primary, secondary, text)
- Live preview with device simulator
- Embeddable widget (vanilla JavaScript)
- Pattern matching algorithm for intelligent responses
- localStorage persistence (temporary)
- Responsive design for all devices

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **React Hook Form + Zod** - Form validation
- **react-colorful** - Color picker
- **Sonner** - Toast notifications
- **localStorage** - Temporary data persistence

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Testing the Widget

Visit [http://localhost:3000/test.html](http://localhost:3000/test.html) to test the chatbot widget.

## Project Structure

```
chatbot-builder/
├── app/                      # Next.js pages
│   ├── page.tsx             # Dashboard (chatbot list)
│   ├── edit/[id]/           # Chatbot editor
│   ├── preview/[id]/        # Preview with device switcher
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ui/                  # shadcn components
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── ChatbotCard.tsx
│   │   ├── ChatbotSettings.tsx
│   │   ├── CreateChatbotDialog.tsx
│   │   ├── EmptyState.tsx
│   │   ├── QAForm.tsx
│   │   ├── QAManager.tsx
│   │   └── WidgetPreview.tsx
│   └── Header.tsx
├── lib/                     # Utilities and types
│   ├── types.ts            # TypeScript interfaces
│   ├── mock-data.ts        # Mock chatbots and questions
│   └── utils.ts            # Helper functions
├── public/
│   ├── widget/             # Chatbot widget
│   │   └── chatbot-widget.js
│   └── test.html           # Widget test page
└── README.md
```

## Usage

### Creating a Chatbot

1. Click "Create Chatbot" on the dashboard
2. Enter a name for your chatbot
3. Click "Create" to generate your chatbot

### Editing a Chatbot

1. Click "Edit" on any chatbot card
2. Customize colors using the color pickers
3. Add Q&A pairs with relevant keywords
4. Preview changes in real-time

### Adding Questions & Answers

1. Click "Add Question" in the Q&A Manager
2. Enter the question (10-200 characters)
3. Provide an answer (10-500 characters)
4. Add keywords (comma-separated) to improve matching
5. Click "Add Question"

### Embedding the Widget

1. Click the "Copy Embed" option from the chatbot card menu
2. Paste the embed code into your website:

```html
<script src="http://localhost:3000/widget/chatbot-widget.js?id=YOUR_CHATBOT_ID"></script>
```

### Preview Mode

1. Click "Preview" or "Full Preview" to see your chatbot in action
2. Switch between Desktop, Tablet, and Mobile views
3. Test the chatbot by asking questions

## Pattern Matching Algorithm

The chatbot uses a keyword-based pattern matching algorithm:

1. **Keyword Matching**: Each keyword match scores +2 points
2. **Question Word Matching**: Matching words (>3 chars) in the question score +1 point
3. **Best Match Selection**: Returns the answer with the highest score
4. **Fallback Response**: If no match is found, returns a default message

## Next Steps

- [ ] Add database integration (Supabase/PostgreSQL)
- [ ] Implement user authentication
- [ ] Add analytics dashboard
- [ ] Create AI-powered FAQ generation
- [ ] Multi-language support
- [ ] Advanced pattern matching with NLP
- [ ] Chatbot training interface
- [ ] Team collaboration features

## Built With

This project was built following a sequential implementation guide designed for rapid MVP development.

## License

MIT License
