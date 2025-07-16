import { geminiAPI } from './gemini-api'
import type {
  GeminiMessage,
  GeminiChatRequest,
  GeminiApiResult
} from './gemini-types'

/**
 * Gemini API 工具类 - 仅用于图片分析生成提示词
 */
export class GeminiUtils {

  /**
   * 图像理解对话 - 核心功能：分析图片生成编辑提示词
   */
  static async imageChat(
    prompt: string,
    imageBase64: string,
    imageFormat: string = 'jpeg',
    options?: {
      temperature?: number
      max_tokens?: number
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
      model: 'gemini-2.5-flash',
      messages,
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
