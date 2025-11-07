import fs from 'fs';
import path from 'path';
import { Chatbot, Question } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHATBOTS_FILE = path.join(DATA_DIR, 'chatbots.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read chatbots from file
export function readChatbots(): Chatbot[] {
  ensureDataDir();

  try {
    if (fs.existsSync(CHATBOTS_FILE)) {
      const data = fs.readFileSync(CHATBOTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading chatbots file:', error);
  }

  return [];
}

// Read questions from file
export function readQuestions(): Question[] {
  ensureDataDir();

  try {
    if (fs.existsSync(QUESTIONS_FILE)) {
      const data = fs.readFileSync(QUESTIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading questions file:', error);
  }

  return [];
}

// Write chatbots to file
export function writeChatbots(chatbots: Chatbot[]): void {
  ensureDataDir();

  try {
    fs.writeFileSync(CHATBOTS_FILE, JSON.stringify(chatbots, null, 2));
  } catch (error) {
    console.error('Error writing chatbots file:', error);
    throw error;
  }
}

// Write questions to file
export function writeQuestions(questions: Question[]): void {
  ensureDataDir();

  try {
    fs.writeFileSync(QUESTIONS_FILE, JSON.stringify(questions, null, 2));
  } catch (error) {
    console.error('Error writing questions file:', error);
    throw error;
  }
}

// Get chatbot by ID
export function getChatbotById(id: string): { chatbot: Chatbot; questions: Question[] } | null {
  const chatbots = readChatbots();
  const questions = readQuestions();

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
