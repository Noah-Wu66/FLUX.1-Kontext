import OpenAI from 'openai'
import type {
  GeminiConfig,
  GeminiApiResult
} from './gemini-types'

export class GeminiAPI {
  private static instance: GeminiAPI
  private client: OpenAI
  private config: GeminiConfig

  private constructor() {
    // 从环境变量获取配置
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/'
    }

    // 初始化 OpenAI 客户端，使用 Gemini 配置
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl
    })
  }

  static getInstance(): GeminiAPI {
    if (!GeminiAPI.instance) {
      GeminiAPI.instance = new GeminiAPI()
    }
    return GeminiAPI.instance
  }

  /**
   * 检查 API 配置是否有效
   */
  isConfigured(): boolean {
    return !!this.config.apiKey
  }

  /**
   * 聊天对话 - 基础版本，直接使用 OpenAI 类型
   */
  async chat(
    model: string,
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    options?: {
      temperature?: number
      max_tokens?: number
    }
  ): Promise<GeminiApiResult<OpenAI.Chat.Completions.ChatCompletion>> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'OpenAI API 密钥未配置'
        }
      }

      const response = await this.client.chat.completions.create({
        model,
        messages,
        ...(options?.max_tokens && { max_tokens: options.max_tokens }),
        ...(options?.temperature && { temperature: options.temperature })
      })

      return {
        success: true,
        data: response
      }
    } catch (error) {
      console.error('Gemini 聊天请求失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }


}

// 导出单例实例
export const geminiAPI = GeminiAPI.getInstance()
