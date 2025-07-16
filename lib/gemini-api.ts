import OpenAI from 'openai'
import type {
  GeminiModel,
  GeminiChatRequest,
  GeminiChatResponse,
  GeminiStreamChunk,
  GeminiEmbeddingRequest,
  GeminiEmbeddingResponse,
  GeminiImageGenerationRequest,
  GeminiImageGenerationResponse,
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
      baseUrl: process.env.OPENAI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
      timeout: 60000,
      maxRetries: 3
    }

    // 初始化 OpenAI 客户端，使用 Gemini 配置
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries
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
   * 聊天对话 - 基础版本
   */
  async chat(request: GeminiChatRequest): Promise<GeminiApiResult<GeminiChatResponse>> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'OpenAI API 密钥未配置'
        }
      }

      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages,
        ...(request.reasoning_effort && { reasoning_effort: request.reasoning_effort }),
        ...(request.max_tokens && { max_tokens: request.max_tokens }),
        ...(request.temperature && { temperature: request.temperature }),
        ...(request.top_p && { top_p: request.top_p }),
        ...(request.tools && { tools: request.tools }),
        ...(request.tool_choice && { tool_choice: request.tool_choice }),
        // 使用 extra_body 传递 Gemini 特有参数
        ...(request.thinking_budget && {
          extra_body: {
            google: {
              thinking_config: {
                thinking_budget: request.thinking_budget,
                include_thoughts: request.include_thoughts || false
              }
            }
          }
        })
      })

      return {
        success: true,
        data: response as GeminiChatResponse
      }
    } catch (error) {
      console.error('Gemini 聊天请求失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 流式聊天对话
   */
  async chatStream(request: GeminiChatRequest): Promise<AsyncIterable<GeminiStreamChunk> | GeminiApiResult<null>> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'OpenAI API 密钥未配置'
        }
      }

      const stream = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages,
        stream: true,
        ...(request.reasoning_effort && { reasoning_effort: request.reasoning_effort }),
        ...(request.max_tokens && { max_tokens: request.max_tokens }),
        ...(request.temperature && { temperature: request.temperature }),
        ...(request.top_p && { top_p: request.top_p }),
        ...(request.tools && { tools: request.tools }),
        ...(request.tool_choice && { tool_choice: request.tool_choice })
      })

      return stream as AsyncIterable<GeminiStreamChunk>
    } catch (error) {
      console.error('Gemini 流式聊天请求失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 文本嵌入
   */
  async embeddings(request: GeminiEmbeddingRequest): Promise<GeminiApiResult<GeminiEmbeddingResponse>> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'OpenAI API 密钥未配置'
        }
      }

      const response = await this.client.embeddings.create({
        input: request.input,
        model: request.model
      })

      return {
        success: true,
        data: response as GeminiEmbeddingResponse
      }
    } catch (error) {
      console.error('Gemini 嵌入请求失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 图像生成
   */
  async generateImage(request: GeminiImageGenerationRequest): Promise<GeminiApiResult<GeminiImageGenerationResponse>> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'OpenAI API 密钥未配置'
        }
      }

      const response = await this.client.images.generate({
        model: request.model,
        prompt: request.prompt,
        response_format: request.response_format || 'url',
        n: request.n || 1,
        ...(request.size && { size: request.size })
      })

      return {
        success: true,
        data: response as GeminiImageGenerationResponse
      }
    } catch (error) {
      console.error('Gemini 图像生成请求失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 获取可用模型列表
   */
  async listModels(): Promise<GeminiApiResult<string[]>> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'OpenAI API 密钥未配置'
        }
      }

      const models = await this.client.models.list()
      const modelIds = models.data.map(model => model.id)

      return {
        success: true,
        data: modelIds
      }
    } catch (error) {
      console.error('获取 Gemini 模型列表失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 获取特定模型信息
   */
  async getModel(modelId: string): Promise<GeminiApiResult<any>> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'OpenAI API 密钥未配置'
        }
      }

      const model = await this.client.models.retrieve(modelId)

      return {
        success: true,
        data: model
      }
    } catch (error) {
      console.error('获取 Gemini 模型信息失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<GeminiConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // 重新初始化客户端
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries
    })
  }

  /**
   * 获取当前配置
   */
  getConfig(): Omit<GeminiConfig, 'apiKey'> {
    const { apiKey, ...config } = this.config
    return config
  }
}

// 导出单例实例
export const geminiAPI = GeminiAPI.getInstance()
