export interface Chatbot {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
  createdAt: string;
}

export interface Question {
  id: string;
  chatbotId: string;
  question: string;
  answer: string;
  keywords: string[];
}
