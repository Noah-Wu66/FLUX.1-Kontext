// Gemini 2.5 Flash API 类型定义 - 仅用于图片分析生成提示词

export type GeminiModel = 'gemini-2.5-flash'

// 简化的消息类型定义，兼容 OpenAI
export interface GeminiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
      url: string
    }
  }>
}

export interface GeminiChatRequest {
  model: GeminiModel
  messages: GeminiMessage[]
  temperature?: number
  max_tokens?: number
}

export interface GeminiChatResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export interface GeminiConfig {
  apiKey: string
  baseUrl?: string
}

export interface GeminiApiResult<T = any> {
  success: boolean
  data?: T
  error?: string
}
