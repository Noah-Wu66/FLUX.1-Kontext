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
    const isConfigured = !!this.config.apiKey && this.config.apiKey.trim() !== ''
    if (!isConfigured) {
      console.warn('Gemini API 配置检查失败:', {
        hasApiKey: !!this.config.apiKey,
        apiKeyLength: this.config.apiKey?.length || 0,
        baseUrl: this.config.baseUrl
      })
    }
    return isConfigured
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
          error: 'Gemini API 密钥未配置，请检查 OPENAI_API_KEY 环境变量'
        }
      }

      console.log('发送 Gemini API 请求:', {
        model,
        messageCount: messages.length,
        options,
        baseUrl: this.config.baseUrl
      })

      const response = await this.client.chat.completions.create({
        model,
        messages,
        ...(options?.max_tokens && { max_tokens: options.max_tokens }),
        ...(options?.temperature && { temperature: options.temperature })
      })

      console.log('Gemini API 响应成功:', {
        model,
        choices: response.choices?.length || 0,
        usage: response.usage,
        firstChoiceFinishReason: response.choices?.[0]?.finish_reason,
        firstChoiceContentLength: response.choices?.[0]?.message?.content?.length || 0,
        firstChoiceContentPreview: response.choices?.[0]?.message?.content?.substring(0, 100)
      })

      // 验证响应数据的完整性
      if (!response.choices || response.choices.length === 0) {
        console.error('Gemini API 响应无效: 没有 choices')
        return {
          success: false,
          error: 'AI 服务返回无效响应'
        }
      }

      const firstChoice = response.choices[0]
      if (!firstChoice.message || !firstChoice.message.content) {
        console.error('Gemini API 响应无效: 没有消息内容', {
          choice: firstChoice,
          hasMessage: !!firstChoice.message,
          hasContent: !!firstChoice.message?.content,
          finishReason: firstChoice.finish_reason
        })

        // 如果是因为长度限制导致的空内容，提供更具体的错误信息
        if (firstChoice.finish_reason === 'length') {
          return {
            success: false,
            error: 'AI 响应被截断，请尝试缩短提示词或联系管理员'
          }
        }

        return {
          success: false,
          error: 'AI 服务返回空内容'
        }
      }

      return {
        success: true,
        data: response
      }
    } catch (error) {
      console.error('Gemini 聊天请求失败:', {
        error: error instanceof Error ? error.message : String(error),
        model,
        messageCount: messages.length,
        stack: error instanceof Error ? error.stack : undefined
      })

      let errorMessage = '未知错误'
      if (error instanceof Error) {
        errorMessage = error.message
        // 提供更友好的错误信息
        if (error.message.includes('401')) {
          errorMessage = 'API 密钥无效，请检查配置'
        } else if (error.message.includes('403')) {
          errorMessage = 'API 访问被拒绝，请检查权限'
        } else if (error.message.includes('429')) {
          errorMessage = 'API 请求频率过高，请稍后重试'
        } else if (error.message.includes('500')) {
          errorMessage = 'AI 服务暂时不可用，请稍后重试'
        }
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }


}

// 导出单例实例
export const geminiAPI = GeminiAPI.getInstance()
