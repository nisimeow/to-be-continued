(function() {
  'use strict';

  // Mock chatbot data (hardcoded for now)
  const MOCK_DATA = {
    name: 'Customer Support Bot',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      text: '#1F2937'
    },
    questions: [
      {
        question: 'What are your business hours?',
        answer: 'We are open Monday to Friday, 9 AM to 6 PM.',
        keywords: ['hours', 'open', 'time', 'schedule']
      },
      {
        question: 'How can I contact support?',
        answer: 'You can reach us at support@example.com or call (555) 123-4567.',
        keywords: ['contact', 'support', 'help', 'email', 'phone']
      },
      {
        question: 'What is your return policy?',
        answer: 'We offer 30-day returns on all products with original receipt.',
        keywords: ['return', 'refund', 'policy', 'money back']
      },
      {
        question: 'Do you offer international shipping?',
        answer: 'Yes, we ship to over 50 countries worldwide.',
        keywords: ['shipping', 'international', 'delivery', 'worldwide']
      }
    ]
  };

  class ChatWidget {
    constructor() {
      this.isOpen = false;
      this.chatbotData = MOCK_DATA;
      this.messages = [];
      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();
      this.addWelcomeMessage();
    }

    injectStyles() {
      const style = document.createElement('style');
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
        }
        .chatbot-window.open {
          display: flex;
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
        }
        .chatbot-message.user {
          justify-content: flex-end;
        }
        .message-bubble {
          max-width: 70%;
          padding: 10px 14px;
          border-radius: 12px;
          line-height: 1.4;
        }
        .message-bubble.user {
          background: ${this.chatbotData.colors.primary};
          color: white;
        }
        .message-bubble.bot {
          background: white;
          color: ${this.chatbotData.colors.text};
          border: 1px solid #e5e7eb;
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
        }
        .chatbot-input:focus {
          border-color: ${this.chatbotData.colors.primary};
        }
        .chatbot-send {
          background: ${this.chatbotData.colors.primary};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
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
      button.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3 .97 4.29L2 22l5.71-.97C9 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.65-.31-3.78-.85l-.27-.15-2.82.48.48-2.82-.15-.27C4.31 14.65 4 13.38 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
          <circle cx="9" cy="12" r="1"/>
          <circle cx="12" cy="12" r="1"/>
          <circle cx="15" cy="12" r="1"/>
        </svg>
      `;

      // Create chat window
      const window = document.createElement('div');
      window.className = 'chatbot-window';
      window.innerHTML = `
        <div class="chatbot-header">
          <span>${this.chatbotData.name}</span>
          <button class="chatbot-close">×</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input-container">
          <input type="text" class="chatbot-input" placeholder="Type your message..." id="chatbot-input" />
          <button class="chatbot-send" id="chatbot-send">Send</button>
        </div>
      `;

      document.body.appendChild(button);
      document.body.appendChild(window);

      this.button = button;
      this.window = window;
      this.messagesContainer = document.getElementById('chatbot-messages');
      this.input = document.getElementById('chatbot-input');
    }

    attachEventListeners() {
      this.button.addEventListener('click', () => this.toggleChat());
      this.window.querySelector('.chatbot-close').addEventListener('click', () => this.toggleChat());

      const sendBtn = document.getElementById('chatbot-send');
      sendBtn.addEventListener('click', () => this.handleSend());

      this.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleSend();
      });
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      this.window.classList.toggle('open', this.isOpen);
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
      message.innerHTML = `<div class="message-bubble ${type}">${text}</div>`;
      this.messagesContainer.appendChild(message);
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    handleSend() {
      const userMessage = this.input.value.trim();
      if (!userMessage) return;

      this.addMessage('user', userMessage);
      this.input.value = '';

      // Pattern matching
      setTimeout(() => {
        const botResponse = this.patternMatch(userMessage);
        this.addMessage('bot', botResponse);
      }, 500);
    }

    patternMatch(userMessage) {
      const message = userMessage.toLowerCase();
      let bestMatch = null;
      let highestScore = 0;

      for (const qa of this.chatbotData.questions) {
        let score = 0;

        // Check keywords
        for (const keyword of qa.keywords) {
          if (message.includes(keyword.toLowerCase())) {
            score += 2;
          }
        }

        // Check question similarity
        const questionWords = qa.question.toLowerCase().split(' ');
        for (const word of questionWords) {
          if (word.length > 3 && message.includes(word)) {
            score += 1;
          }
        }

        if (score > highestScore) {
          highestScore = score;
          bestMatch = qa;
        }
      }

      return bestMatch && highestScore > 0
        ? bestMatch.answer
        : "I'm sorry, I don't have an answer for that. Please contact our support team for assistance.";
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ChatWidget());
  } else {
    new ChatWidget();
  }
})();
