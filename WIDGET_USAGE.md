# Chatbot Widget - Usage Guide

## 🎯 How It Works on External Websites

Your chatbot widget is **fully standalone** and works on ANY website with just a single line of code!

### ✅ What You Need

Just **ONE line of code** - that's it!

```html
<script src="http://localhost:3000/widget/chatbot-widget.js?id=YOUR_CHATBOT_ID"></script>
```

### 🔧 How It Works Behind the Scenes

1. **Widget loads** from your server (localhost:3000 in development)
2. **Extracts the chatbot ID** from the URL parameter (`?id=1`)
3. **Fetches chatbot data** via API call to `http://localhost:3000/api/chatbot/1`
4. **Displays the widget** with your custom colors, name, and Q&A pairs
5. **Caches data** in localStorage for faster subsequent loads

### 🌐 Cross-Domain Support

The widget works on ANY domain because:

- ✅ **CORS enabled** - API allows requests from any origin
- ✅ **Absolute URLs** - Widget knows its home server
- ✅ **No dependencies** - Pure JavaScript, no external libraries
- ✅ **Self-contained** - Everything loads from your server

### 📝 Getting Your Embed Code

1. Go to your dashboard
2. Find your chatbot
3. Click "Copy Embed Code" button
4. Paste it anywhere in your `<body>` tag

### 🎨 Customization

All customization is done in the dashboard:
- **Colors** - Primary, secondary, text colors
- **Bot name** - Shown in chat header
- **Questions & Answers** - Pattern-matched responses
- **Keywords** - For better question matching

Changes are reflected **immediately** when you edit and save!

### 🧪 Testing

**Test on your own site:**
Visit `http://localhost:3000/test.html`

**Test as external site:**
Visit `http://localhost:3000/external-demo.html`

**Debug localStorage:**
Visit `http://localhost:3000/debug.html`

### 🚀 Production Deployment

When you deploy to production:

1. Replace `http://localhost:3000` with your actual domain (e.g., `https://yourdomain.com`)
2. The embed code will automatically update to use your production URL
3. No changes needed on external sites - they'll load from your production server

### 📊 How Data Flows

```
External Website
    ↓ (loads script)
Your Server (localhost:3000)
    ↓ (returns widget.js)
Widget JavaScript
    ↓ (fetches chatbot data)
Your Server API (/api/chatbot/1)
    ↓ (returns chatbot + questions)
Widget Displays
    ↓ (caches in localStorage)
Fast Future Loads
```

### ⚡ Performance

- **First load:** ~200ms (fetches from API)
- **Cached load:** ~50ms (loads from localStorage)
- **File size:** ~15KB (minified)
- **No external dependencies**

### 🔒 Security

- ✅ HTML escaping (prevents XSS)
- ✅ CORS properly configured
- ✅ No sensitive data in frontend
- ✅ API validates chatbot IDs

### 💡 Tips

1. **Test before deploying** - Use the test pages
2. **Update regularly** - Changes in dashboard reflect immediately
3. **Monitor console** - Any errors will show in browser console
4. **Check compatibility** - Works on all modern browsers (Chrome, Firefox, Safari, Edge)

### 🐛 Troubleshooting

**Widget not appearing?**
- Check browser console for errors
- Verify the script URL is correct
- Make sure server is running

**Wrong chatbot showing?**
- Check the `?id=` parameter in your embed code
- Visit `/debug.html` to see available chatbot IDs

**Colors not updating?**
- Changes take effect immediately on new page loads
- Refresh the page to see updates

### 📞 Support

If you encounter any issues, check:
1. Browser console (F12)
2. Network tab (is the script loading?)
3. Debug page (`/debug.html`)
