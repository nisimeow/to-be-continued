(function() {
  'use strict';

  // Get chatbot ID and API base URL from script tag
  function getWidgetConfig() {
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
      if (script.src.includes('chatbot-widget.js')) {
        const url = new URL(script.src);
        const baseUrl = url.origin; // e.g., http://localhost:3000
        const chatbotId = url.searchParams.get('id') || '1';
        return { chatbotId, baseUrl };
      }
    }
    return { chatbotId: '1', baseUrl: window.location.origin };
  }

  class ChatWidget {
    constructor() {
      const config = getWidgetConfig();
      this.chatbotId = config.chatbotId;
      this.baseUrl = config.baseUrl;
      this.isOpen = false;
      this.chatbotData = null;
      this.messages = [];
      this.init();
    }

    async init() {
      await this.loadChatbotData();
      if (!this.chatbotData) {
        console.error('Chatbot not found');
        return;
      }
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();
      this.addWelcomeMessage();
    }

    async loadChatbotData() {
      try {
        // Try to load from API (works on any domain)
        const apiUrl = `${this.baseUrl}/api/chatbot/${this.chatbotId}`;

        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            this.chatbotData = {
              name: data.chatbot.name,
              colors: data.chatbot.colors,
              questions: data.questions
            };
            // Cache in localStorage for faster subsequent loads
            localStorage.setItem(`chatbot_${this.chatbotId}`, JSON.stringify(this.chatbotData));
            return;
          }
        } catch (fetchError) {
          // API fetch failed, try localStorage cache
          const cached = localStorage.getItem(`chatbot_${this.chatbotId}`);
          if (cached) {
            this.chatbotData = JSON.parse(cached);
            return;
          }
        }

        // Final fallback
        this.chatbotData = {
          name: 'Customer Support Bot',
          colors: {
            primary: '#3B82F6',
            secondary: '#1E40AF',
            text: '#1F2937'
          },
          questions: [
            {
              question: 'What are your business hours?',
              answer: 'We are open Monday to Friday, 9 AM to 6 PM EST. Our customer service team is available during these hours to assist you.',
              keywords: ['hours', 'open', 'time', 'schedule', 'when', 'available']
            },
            {
              question: 'How can I contact support?',
              answer: 'You can reach us at support@example.com or call (555) 123-4567. We typically respond to emails within 24 hours.',
              keywords: ['contact', 'support', 'help', 'email', 'phone', 'reach', 'call']
            }
          ]
        };
      } catch (e) {
        console.error('Error loading chatbot data:', e);
      }
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'chatbot-widget-styles';
      style.textContent = `
        .chatbot-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: ${this.chatbotData.colors.primary};
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: transform 0.3s ease;
        }
        .chatbot-button:hover {
          transform: scale(1.1);
        }
        .chatbot-button svg {
          width: 30px;
          height: 30px;
          fill: white;
        }
        .chatbot-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          z-index: 9998;
          display: none;
          flex-direction: column;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .chatbot-window.open {
          display: flex;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .chatbot-header {
          background: ${this.chatbotData.colors.primary};
          color: white;
          padding: 16px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chatbot-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          line-height: 1;
        }
        .chatbot-close:hover {
          opacity: 0.8;
        }
        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
        }
        .chatbot-message {
          margin-bottom: 12px;
          display: flex;
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .chatbot-message.user {
          justify-content: flex-end;
        }
        .message-bubble {
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 12px;
          line-height: 1.5;
          font-size: 14px;
        }
        .message-bubble.user {
          background: ${this.chatbotData.colors.primary};
          color: white;
          border-radius: 12px 12px 2px 12px;
        }
        .message-bubble.bot {
          background: white;
          color: ${this.chatbotData.colors.text};
          border: 1px solid #e5e7eb;
          border-radius: 12px 12px 12px 2px;
        }
        .chatbot-input-container {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: white;
          display: flex;
          gap: 8px;
        }
        .chatbot-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          outline: none;
          font-size: 14px;
          font-family: inherit;
        }
        .chatbot-input:focus {
          border-color: ${this.chatbotData.colors.primary};
          box-shadow: 0 0 0 3px ${this.chatbotData.colors.primary}20;
        }
        .chatbot-send {
          background: ${this.chatbotData.colors.primary};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .chatbot-send:hover {
          opacity: 0.9;
        }
        .chatbot-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 10px 14px;
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${this.chatbotData.colors.primary};
          animation: typing 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.7; }
          30% { transform: translateY(-10px); opacity: 1; }
        }
        @media (max-width: 768px) {
          .chatbot-window {
            width: calc(100vw - 40px);
            height: 80vh;
            bottom: 10px;
            right: 10px;
          }
          .chatbot-button {
            bottom: 10px;
            right: 10px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    createWidget() {
      // Create button
      const button = document.createElement('button');
      button.className = 'chatbot-button';
      button.setAttribute('aria-label', 'Open chat');
      button.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.65-.31-3.78-.85l-.27-.15-2.82.48.48-2.82-.15-.27C4.31 14.65 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="12" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
        </svg>
      `;

      // Create chat window
      const chatWindow = document.createElement('div');
      chatWindow.className = 'chatbot-window';
      chatWindow.innerHTML = `
        <div class="chatbot-header">
          <span>${this.chatbotData.name}</span>
          <button class="chatbot-close" aria-label="Close chat">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-container">
          <input
            type="text"
            class="chatbot-input"
            placeholder="Type your message..."
            id="chatbot-input"
            aria-label="Message input"
          />
          <button class="chatbot-send" id="chatbot-send">Send</button>
        </div>
      `;

      document.body.appendChild(button);
      document.body.appendChild(chatWindow);

      this.button = button;
      this.chatWindow = chatWindow;
      this.messagesContainer = document.getElementById('chatbot-messages');
      this.input = document.getElementById('chatbot-input');
      this.sendButton = document.getElementById('chatbot-send');
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => this.toggleChat());
      this.chatWindow.querySelector('.chatbot-close').addEventListener('click', () => this.toggleChat());

      this.sendButton.addEventListener('click', () => this.handleSend());
      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSend();
        }
      });

      // Listen for localStorage changes (when chatbot data is updated in different tab)
      window.addEventListener('storage', (e) => {
        if (e.key === 'chatbots' || e.key === 'questions') {
          this.reloadChatbotData();
        }
      });

      // Listen for custom event (when chatbot data is updated in same tab)
      window.addEventListener('chatbotDataUpdated', () => {
        this.reloadChatbotData();
      });
    }

    async reloadChatbotData() {
      // Re-fetch from API to get latest data
      try {
        const apiUrl = `${this.baseUrl}/api/chatbot/${this.chatbotId}`;
        const response = await fetch(apiUrl);

        if (response.ok) {
          const data = await response.json();

          // Update chatbot data
          this.chatbotData = {
            name: data.chatbot.name,
            colors: data.chatbot.colors,
            questions: data.questions
          };

          // Update cache
          localStorage.setItem(`chatbot_${this.chatbotId}`, JSON.stringify(this.chatbotData));

          // Update the styles with new colors
          this.updateStyles();

          // Update the header name if it changed
          const headerSpan = this.chatWindow.querySelector('.chatbot-header span');
          if (headerSpan) {
            headerSpan.textContent = this.chatbotData.name;
          }
        }
      } catch (error) {
        // If API fails, try loading from cache
        const cached = localStorage.getItem(`chatbot_${this.chatbotId}`);
        if (cached) {
          this.chatbotData = JSON.parse(cached);
          this.updateStyles();
        }
      }
    }

    updateStyles() {
      // Remove old style
      const oldStyle = document.getElementById('chatbot-widget-styles');
      if (oldStyle) oldStyle.remove();

      // Re-inject styles with new colors
      this.injectStyles();

      // Update button color
      this.button.style.backgroundColor = this.chatbotData.colors.primary;

      // Update header color
      const header = this.chatWindow.querySelector('.chatbot-header');
      if (header) {
        header.style.backgroundColor = this.chatbotData.colors.primary;
      }
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.chatWindow.classList.toggle('open', this.isOpen);
      if (this.isOpen) {
        this.input.focus();
      }
    }

    addWelcomeMessage() {
      this.addMessage('bot', `Hello! I'm ${this.chatbotData.name}. How can I help you today?`);
    }

    addMessage(type, text) {
      const message = document.createElement('div');
      message.className = `chatbot-message ${type}`;
      message.innerHTML = `<div class="message-bubble ${type}">${this.escapeHtml(text)}</div>`;
      this.messagesContainer.appendChild(message);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addTypingIndicator() {
      const typing = document.createElement('div');
      typing.className = 'chatbot-message bot';
      typing.id = 'typing-indicator';
      typing.innerHTML = `
        <div class="message-bubble bot">
          <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          </div>
        </div>
      `;
      this.messagesContainer.appendChild(typing);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
      const typing = document.getElementById('typing-indicator');
      if (typing) typing.remove();
    }

    handleSend() {
      const userMessage = this.input.value.trim();
      if (!userMessage) return;

      this.sendButton.disabled = true;
      this.addMessage('user', userMessage);
      this.input.value = '';

      this.addTypingIndicator();

      setTimeout(() => {
        this.removeTypingIndicator();
        const botResponse = this.patternMatch(userMessage);
        this.addMessage('bot', botResponse);
        this.sendButton.disabled = false;
        this.input.focus();
      }, 800);
    }

    patternMatch(userMessage) {
      const message = userMessage.toLowerCase().trim();
      let bestMatch = null;
      let highestScore = 0;

      for (const qa of this.chatbotData.questions) {
        let score = 0;

        // Check keywords (highest weight)
        for (const keyword of qa.keywords) {
          if (message.includes(keyword.toLowerCase())) {
            score += 3;
          }
        }

        // Check question words
        const questionWords = qa.question.toLowerCase().split(' ').filter(w => w.length > 3);
        for (const word of questionWords) {
          if (message.includes(word)) {
            score += 1;
          }
        }

        // Exact question match bonus
        if (message === qa.question.toLowerCase()) {
          score += 10;
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = qa;
        }
      }

      // Return answer if score is high enough
      if (bestMatch && highestScore >= 2) {
        return bestMatch.answer;
      }

      return "I'm sorry, I don't have an answer for that. Please contact our support team for assistance.";
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize widget when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ChatWidget());
  } else {
    new ChatWidget();
  }
})();
