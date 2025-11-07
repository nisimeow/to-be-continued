import { Chatbot, Question } from './types';

export const mockChatbots: Chatbot[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    colors: {
      primary: '#3B82F6',
      secondary: '#1E40AF',
      text: '#1F2937'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sales Assistant',
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      text: '#1F2937'
    },
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Product Helper',
    colors: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      text: '#1F2937'
    },
    createdAt: new Date().toISOString()
  }
];

export const mockQuestions: Question[] = [
  // Customer Support Bot questions
  {
    id: '1',
    chatbotId: '1',
    question: 'What are your business hours?',
    answer: 'We are open Monday to Friday, 9 AM to 6 PM EST. Our customer service team is available during these hours to assist you.',
    keywords: ['hours', 'open', 'time', 'schedule', 'when', 'available']
  },
  {
    id: '2',
    chatbotId: '1',
    question: 'How can I contact support?',
    answer: 'You can reach us at support@example.com or call (555) 123-4567. We typically respond to emails within 24 hours.',
    keywords: ['contact', 'support', 'help', 'email', 'phone', 'reach', 'call']
  },
  {
    id: '3',
    chatbotId: '1',
    question: 'What is your return policy?',
    answer: 'We offer 30-day returns on all products with original receipt. Items must be unused and in original packaging. Refunds are processed within 5-7 business days.',
    keywords: ['return', 'refund', 'policy', 'money back', 'exchange', 'warranty']
  },
  {
    id: '4',
    chatbotId: '1',
    question: 'Do you offer international shipping?',
    answer: 'Yes! We ship to over 50 countries worldwide. International shipping typically takes 7-14 business days. Shipping costs vary by destination.',
    keywords: ['shipping', 'international', 'delivery', 'worldwide', 'abroad', 'overseas']
  },
  {
    id: '5',
    chatbotId: '1',
    question: 'How do I track my order?',
    answer: 'Once your order ships, you will receive a tracking number via email. You can also track your order by logging into your account on our website.',
    keywords: ['track', 'tracking', 'order', 'shipment', 'where', 'status', 'delivery']
  },
  {
    id: '6',
    chatbotId: '1',
    question: 'Do you have a loyalty program?',
    answer: 'Yes! Our rewards program gives you 1 point for every dollar spent. Points can be redeemed for discounts on future purchases. Sign up on our website to join!',
    keywords: ['loyalty', 'rewards', 'points', 'program', 'discount', 'member', 'benefits']
  },
  {
    id: '7',
    chatbotId: '1',
    question: 'Can I cancel my order?',
    answer: 'Orders can be cancelled within 2 hours of placement. After that, they enter processing and cannot be cancelled. Please contact us immediately if you need to cancel.',
    keywords: ['cancel', 'cancellation', 'stop', 'order', 'refund', 'remove']
  },
  {
    id: '8',
    chatbotId: '1',
    question: 'What payment methods do you accept?',
    answer: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit encryption.',
    keywords: ['payment', 'pay', 'credit card', 'paypal', 'visa', 'mastercard', 'method']
  },

  // Sales Assistant questions
  {
    id: '9',
    chatbotId: '2',
    question: 'What products do you sell?',
    answer: 'We specialize in premium electronics, smart home devices, and tech accessories. Our catalog includes smartphones, laptops, tablets, and more.',
    keywords: ['products', 'sell', 'catalog', 'items', 'what', 'available', 'offer']
  },
  {
    id: '10',
    chatbotId: '2',
    question: 'Do you offer bulk discounts?',
    answer: 'Yes! We offer 10% off orders of 5+ items, 15% off 10+ items, and custom quotes for orders over 50 items. Contact our sales team for details.',
    keywords: ['bulk', 'discount', 'wholesale', 'quantity', 'large', 'business', 'corporate']
  },
  {
    id: '11',
    chatbotId: '2',
    question: 'Can I get a demo of your product?',
    answer: 'Absolutely! Schedule a free 30-minute demo with our sales team. Book online or call us at (555) 987-6543.',
    keywords: ['demo', 'demonstration', 'trial', 'test', 'show', 'preview', 'try']
  },
  {
    id: '12',
    chatbotId: '2',
    question: 'What is your pricing?',
    answer: 'Our pricing starts at $99/month for basic plans and goes up to $499/month for enterprise. Custom pricing available for large organizations.',
    keywords: ['price', 'pricing', 'cost', 'how much', 'fee', 'rates', 'plans']
  },
  {
    id: '13',
    chatbotId: '2',
    question: 'Do you have a free trial?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start.',
    keywords: ['trial', 'free', 'test', 'try', 'demo', 'sample']
  },

  // Product Helper questions
  {
    id: '14',
    chatbotId: '3',
    question: 'How do I install the software?',
    answer: 'Download the installer from our website, run it, and follow the on-screen instructions. Installation typically takes 5-10 minutes.',
    keywords: ['install', 'setup', 'download', 'installation', 'how to', 'guide']
  },
  {
    id: '15',
    chatbotId: '3',
    question: 'What are the system requirements?',
    answer: 'Minimum: Windows 10/macOS 10.15, 4GB RAM, 500MB disk space. Recommended: 8GB RAM, SSD storage for best performance.',
    keywords: ['requirements', 'system', 'specs', 'minimum', 'compatibility', 'need']
  },
  {
    id: '16',
    chatbotId: '3',
    question: 'Is there a mobile app?',
    answer: 'Yes! Our mobile app is available on iOS (App Store) and Android (Google Play). It syncs seamlessly with the desktop version.',
    keywords: ['mobile', 'app', 'ios', 'android', 'phone', 'smartphone']
  },
  {
    id: '17',
    chatbotId: '3',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page, enter your email, and follow the reset link sent to your inbox. Links expire after 1 hour.',
    keywords: ['password', 'reset', 'forgot', 'login', 'access', 'locked out']
  },
  {
    id: '18',
    chatbotId: '3',
    question: 'Can I integrate with other tools?',
    answer: 'Yes! We support integrations with Slack, Zapier, Google Workspace, Microsoft Teams, and 50+ other tools via our API.',
    keywords: ['integration', 'integrate', 'connect', 'api', 'tools', 'third party']
  }
];
