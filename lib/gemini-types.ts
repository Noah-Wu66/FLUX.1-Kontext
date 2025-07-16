// Gemini 2.5 Flash API 类型定义 - 仅用于图片分析生成提示词

export interface GeminiConfig {
  apiKey: string
  baseUrl?: string
}

export interface GeminiApiResult<T = any> {
  success: boolean
  data?: T
  error?: string
}
