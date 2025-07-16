// Gemini 2.5 Flash API 类型定义

export type GeminiModel = 'gemini-2.5-flash' | 'gemini-2.5-pro'

export type ReasoningEffort = 'none' | 'low' | 'medium' | 'high'

export interface GeminiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | GeminiMessageContent[]
}

export interface GeminiMessageContent {
  type: 'text' | 'image_url' | 'input_audio'
  text?: string
  image_url?: {
    url: string
  }
  input_audio?: {
    data: string
    format: string
  }
}

export interface GeminiChatRequest {
  model: GeminiModel
  messages: GeminiMessage[]
  reasoning_effort?: ReasoningEffort
  thinking_budget?: number
  include_thoughts?: boolean
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream?: boolean
  tools?: GeminiTool[]
  tool_choice?: 'auto' | 'none'
}

export interface GeminiTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required?: string[]
    }
  }
}

export interface GeminiChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: GeminiChoice[]
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface GeminiChoice {
  index: number
  message: {
    role: string
    content: string
    tool_calls?: GeminiToolCall[]
  }
  finish_reason: string
}

export interface GeminiToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface GeminiStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string
      tool_calls?: GeminiToolCall[]
    }
    finish_reason?: string
  }>
}

export interface GeminiEmbeddingRequest {
  input: string | string[]
  model: 'gemini-embedding-001'
}

export interface GeminiEmbeddingResponse {
  object: string
  data: Array<{
    object: string
    embedding: number[]
    index: number
  }>
  model: string
  usage: {
    prompt_tokens: number
    total_tokens: number
  }
}

export interface GeminiImageGenerationRequest {
  model: 'imagen-3.0-generate-002'
  prompt: string
  response_format?: 'url' | 'b64_json'
  n?: number
  size?: string
}

export interface GeminiImageGenerationResponse {
  created: number
  data: Array<{
    url?: string
    b64_json?: string
  }>
}

export interface GeminiConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
}

export interface GeminiApiResult<T = any> {
  success: boolean
  data?: T
  error?: string
}
