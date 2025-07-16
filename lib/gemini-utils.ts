import { geminiAPI } from './gemini-api'
import type {
  GeminiMessage,
  GeminiChatRequest,
  GeminiApiResult,
  GeminiChatResponse,
  GeminiStreamChunk,
  ReasoningEffort
} from './gemini-types'

/**
 * Gemini API 工具类
 * 提供常用的便捷方法
 */
export class GeminiUtils {
  /**
   * 简单文本对话
   */
  static async simpleChat(
    prompt: string,
    systemMessage?: string,
    options?: {
      model?: 'gemini-2.5-flash' | 'gemini-2.5-pro'
      reasoning_effort?: ReasoningEffort
      temperature?: number
      max_tokens?: number
    }
  ): Promise<GeminiApiResult<string>> {
    const messages: GeminiMessage[] = []
    
    if (systemMessage) {
      messages.push({
        role: 'system',
        content: systemMessage
      })
    }
    
    messages.push({
      role: 'user',
      content: prompt
    })

    const request: GeminiChatRequest = {
      model: options?.model || 'gemini-2.5-flash',
      messages,
      ...(options?.reasoning_effort && { reasoning_effort: options.reasoning_effort }),
      ...(options?.temperature && { temperature: options.temperature }),
      ...(options?.max_tokens && { max_tokens: options.max_tokens })
    }

    const result = await geminiAPI.chat(request)
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.choices[0]?.message?.content || ''
      }
    }
    
    return {
      success: false,
      error: result.error
    }
  }

  /**
   * 图像理解对话
   */
  static async imageChat(
    prompt: string,
    imageBase64: string,
    imageFormat: string = 'jpeg',
    options?: {
      model?: 'gemini-2.5-flash' | 'gemini-2.5-pro'
      reasoning_effort?: ReasoningEffort
      temperature?: number
    }
  ): Promise<GeminiApiResult<string>> {
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/${imageFormat};base64,${imageBase64}`
            }
          }
        ]
      }
    ]

    const request: GeminiChatRequest = {
      model: options?.model || 'gemini-2.5-flash',
      messages,
      ...(options?.reasoning_effort && { reasoning_effort: options.reasoning_effort }),
      ...(options?.temperature && { temperature: options.temperature })
    }

    const result = await geminiAPI.chat(request)
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.choices[0]?.message?.content || ''
      }
    }
    
    return {
      success: false,
      error: result.error
    }
  }

  /**
   * 音频理解对话
   */
  static async audioChat(
    prompt: string,
    audioBase64: string,
    audioFormat: string = 'wav',
    options?: {
      model?: 'gemini-2.5-flash' | 'gemini-2.5-pro'
      reasoning_effort?: ReasoningEffort
      temperature?: number
    }
  ): Promise<GeminiApiResult<string>> {
    const messages: GeminiMessage[] = [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'input_audio',
            input_audio: {
              data: audioBase64,
              format: audioFormat
            }
          }
        ]
      }
    ]

    const request: GeminiChatRequest = {
      model: options?.model || 'gemini-2.5-flash',
      messages,
      ...(options?.reasoning_effort && { reasoning_effort: options.reasoning_effort }),
      ...(options?.temperature && { temperature: options.temperature })
    }

    const result = await geminiAPI.chat(request)
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.choices[0]?.message?.content || ''
      }
    }
    
    return {
      success: false,
      error: result.error
    }
  }

  /**
   * 流式对话
   */
  static async streamChat(
    prompt: string,
    systemMessage?: string,
    options?: {
      model?: 'gemini-2.5-flash' | 'gemini-2.5-pro'
      reasoning_effort?: ReasoningEffort
      temperature?: number
    }
  ): Promise<AsyncIterable<string> | GeminiApiResult<null>> {
    const messages: GeminiMessage[] = []
    
    if (systemMessage) {
      messages.push({
        role: 'system',
        content: systemMessage
      })
    }
    
    messages.push({
      role: 'user',
      content: prompt
    })

    const request: GeminiChatRequest = {
      model: options?.model || 'gemini-2.5-flash',
      messages,
      stream: true,
      ...(options?.reasoning_effort && { reasoning_effort: options.reasoning_effort }),
      ...(options?.temperature && { temperature: options.temperature })
    }

    const result = await geminiAPI.chatStream(request)
    
    if ('success' in result) {
      return result
    }
    
    // 返回一个异步生成器，只输出文本内容
    return (async function* () {
      for await (const chunk of result) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    })()
  }

  /**
   * 文本嵌入
   */
  static async getEmbedding(text: string): Promise<GeminiApiResult<number[]>> {
    const result = await geminiAPI.embeddings({
      input: text,
      model: 'gemini-embedding-001'
    })
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.data[0]?.embedding || []
      }
    }
    
    return {
      success: false,
      error: result.error
    }
  }

  /**
   * 批量文本嵌入
   */
  static async getBatchEmbeddings(texts: string[]): Promise<GeminiApiResult<number[][]>> {
    const result = await geminiAPI.embeddings({
      input: texts,
      model: 'gemini-embedding-001'
    })
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.data.map(item => item.embedding)
      }
    }
    
    return {
      success: false,
      error: result.error
    }
  }

  /**
   * 生成图像（使用 Imagen 3.0）
   */
  static async generateImage(
    prompt: string,
    options?: {
      format?: 'url' | 'b64_json'
      count?: number
      size?: string
    }
  ): Promise<GeminiApiResult<string[]>> {
    const result = await geminiAPI.generateImage({
      model: 'imagen-3.0-generate-002',
      prompt,
      response_format: options?.format || 'url',
      n: options?.count || 1,
      ...(options?.size && { size: options.size })
    })
    
    if (result.success && result.data) {
      const images = result.data.data.map(item => 
        options?.format === 'b64_json' ? item.b64_json! : item.url!
      )
      return {
        success: true,
        data: images
      }
    }
    
    return {
      success: false,
      error: result.error
    }
  }

  /**
   * 检查 API 是否可用
   */
  static async checkApiHealth(): Promise<GeminiApiResult<boolean>> {
    try {
      const result = await geminiAPI.listModels()
      return {
        success: result.success,
        data: result.success,
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        data: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 将文件转换为 Base64
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // 移除 data:type/subtype;base64, 前缀
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

export default GeminiUtils
