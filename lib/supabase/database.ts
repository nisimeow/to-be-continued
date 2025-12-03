import { createClient } from './server'
import { createServiceClient } from './service-client'
import type {
  Chatbot,
  Question,
  CrawledContent,
  ChatSession,
  ChatMessage,
  DefaultResponse,
  CreateChatbotInput,
  UpdateChatbotInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateCrawledContentInput,
  CreateChatSessionInput,
  UpdateChatSessionInput,
  CreateChatMessageInput,
} from '@/lib/types'

/**
 * Chatbot operations
 */

/**
 * Get all chatbots for a user
 */
export async function getChatbots(userId: string): Promise<Chatbot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chatbots')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a single chatbot by ID
 */
export async function getChatbotById(id: string): Promise<Chatbot | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chatbots')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

/**
 * Create a new chatbot
 */
export async function createChatbot(input: CreateChatbotInput): Promise<Chatbot> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chatbots')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a chatbot
 */
export async function updateChatbot(id: string, input: UpdateChatbotInput): Promise<Chatbot> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chatbots')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a chatbot (soft delete)
 */
export async function deleteChatbot(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('chatbots')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}

/**
 * Question operations
 */

/**
 * Get all questions for a chatbot
 */
export async function getQuestions(chatbotId: string): Promise<Question[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a single question by ID
 */
export async function getQuestionById(id: string): Promise<Question | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

/**
 * Create a new question
 */
export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update a question
 */
export async function updateQuestion(id: string, input: UpdateQuestionInput): Promise<Question> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Delete a question (soft delete)
 */
export async function deleteQuestion(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .update({ is_active: false })
    .eq('id', id)

  if (error) throw error
}

/**
 * Default responses operations
 */

/**
 * Get all active default responses
 */
export async function getDefaultResponses(): Promise<DefaultResponse[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('default_responses')
    .select('*')
    .eq('is_active', true)
    .order('response_type')

  if (error) throw error
  return data || []
}

/**
 * Crawled content operations
 */

/**
 * Save crawled content
 */
export async function saveCrawledContent(input: CreateCrawledContentInput): Promise<CrawledContent> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crawled_content')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  console.log('Stored crawled content:', data.id)
  return data
}

/**
 * Get crawled content for a chatbot
 */
export async function getCrawledContent(chatbotId: string): Promise<CrawledContent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('crawled_content')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('crawled_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Chat session operations
 */

/**
 * Create a new chat session
 * Uses service role client to bypass RLS for anonymous widget sessions
 */
export async function createSession(input: CreateChatSessionInput): Promise<ChatSession> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      ...input,
      started_at: new Date().toISOString(),
      message_count: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Database error creating session:', error)
    throw error
  }
  return data
}

/**
 * Update a chat session
 * Uses service role client for widget session updates
 */
export async function updateSession(id: string, input: UpdateChatSessionInput): Promise<ChatSession> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Database error updating session:', error)
    throw error
  }
  return data
}

/**
 * Get sessions for a chatbot
 */
export async function getSessions(chatbotId: string, limit?: number): Promise<ChatSession[]> {
  const supabase = await createClient()
  let query = supabase
    .from('chat_sessions')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('started_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Get a single session by ID
 */
export async function getSessionById(id: string): Promise<ChatSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

/**
 * Chat message operations
 */

/**
 * Create a new chat message
 * Uses service role client for widget messages
 */
export async function createMessage(input: CreateChatMessageInput): Promise<ChatMessage> {
  const supabase = createServiceClient()

  // Create the message
  const { data: message, error: messageError } = await supabase
    .from('chat_messages')
    .insert({
      ...input,
      sent_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (messageError) {
    console.error('Database error creating message:', messageError)
    throw messageError
  }

  // Increment message count in session
  const { error: sessionError } = await supabase.rpc('increment_message_count', {
    session_id: input.session_id,
  })

  if (sessionError) {
    console.error('Error incrementing message count:', sessionError)
    // If RPC fails, try manual update as fallback
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('message_count')
      .eq('id', input.session_id)
      .single()

    if (session) {
      await supabase
        .from('chat_sessions')
        .update({ message_count: (session.message_count || 0) + 1 })
        .eq('id', input.session_id)
    }
  }

  return message
}

/**
 * Get messages for a session
 */
export async function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('sent_at', { ascending: true })

  if (error) throw error
  return data || []
}
