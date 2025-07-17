import OpenAI from 'openai'
import { geminiAPI } from './gemini-api'
import type {
  GeminiApiResult
} from './gemini-types'

/**
 * Gemini API 工具类 - 仅用于图片分析生成提示词
 */
export class GeminiUtils {

  /**
   * 简单文本对话 - 用于提示词优化等纯文本任务
   */
  static async textChat(
    prompt: string,
    systemMessage?: string,
    options?: {
      temperature?: number
      max_tokens?: number
    }
  ): Promise<GeminiApiResult<string>> {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

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

      console.log('GeminiUtils.textChat 开始调用:', {
        messageCount: messages.length,
        hasSystemMessage: !!systemMessage,
        options
      })

      const result = await geminiAPI.chat(
        'gemini-2.5-flash',
        messages,
        options
      )

      console.log('GeminiUtils.textChat API 调用结果:', {
        success: result.success,
        hasData: !!result.data,
        error: result.error,
        choicesLength: result.data?.choices?.length,
        firstChoiceContent: result.data?.choices?.[0]?.message?.content?.substring(0, 100)
      })

      if (result.success && result.data) {
        // 详细检查响应结构
        console.log('GeminiUtils.textChat 详细响应检查:', {
          hasChoices: !!result.data.choices,
          choicesLength: result.data.choices?.length,
          choicesArray: result.data.choices,
          firstChoice: result.data.choices?.[0],
          firstChoiceMessage: result.data.choices?.[0]?.message,
          firstChoiceContent: result.data.choices?.[0]?.message?.content
        })

        const content = result.data.choices?.[0]?.message?.content
        if (content && content.trim()) {
          console.log('GeminiUtils.textChat 成功返回内容:', content.substring(0, 100) + '...')
          return {
            success: true,
            data: content.trim()
          }
        } else {
          console.error('GeminiUtils.textChat 响应内容为空:', {
            content,
            contentType: typeof content,
            contentLength: content?.length,
            choices: result.data.choices,
            firstChoice: result.data.choices?.[0],
            fullResponse: result.data
          })
          return {
            success: false,
            error: 'AI 返回的内容为空'
          }
        }
      }

      console.error('GeminiUtils.textChat 调用失败:', result.error)
      return {
        success: false,
        error: result.error || 'AI 调用失败'
      }
    } catch (error) {
      console.error('GeminiUtils.textChat 异常:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI 调用异常'
      }
    }
  }

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
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
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

      console.log('GeminiUtils.imageChat 开始调用:', {
        promptLength: prompt.length,
        imageFormat,
        imageBase64Length: imageBase64.length,
        options
      })

      const result = await geminiAPI.chat(
        'gemini-2.5-flash',
        messages,
        options
      )

      console.log('GeminiUtils.imageChat API 调用结果:', {
        success: result.success,
        hasData: !!result.data,
        error: result.error,
        choicesLength: result.data?.choices?.length,
        firstChoiceContent: result.data?.choices?.[0]?.message?.content?.substring(0, 100)
      })

      if (result.success && result.data) {
        const content = result.data.choices?.[0]?.message?.content
        if (content && content.trim()) {
          console.log('GeminiUtils.imageChat 成功返回内容:', content.substring(0, 100) + '...')
          return {
            success: true,
            data: content.trim()
          }
        } else {
          console.error('GeminiUtils.imageChat 响应内容为空:', {
            choices: result.data.choices,
            firstChoice: result.data.choices?.[0]
          })
          return {
            success: false,
            error: 'AI 返回的内容为空'
          }
        }
      }

      console.error('GeminiUtils.imageChat 调用失败:', result.error)
      return {
        success: false,
        error: result.error || 'AI 调用失败'
      }
    } catch (error) {
      console.error('GeminiUtils.imageChat 异常:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI 调用异常'
      }
    }
  }




  /**
   * 多图像理解对话 - 用于多图编辑提示词生成
   */
  static async multiImageChat(
    prompt: string,
    imageBase64Array: string[],
    imageFormat: string = 'jpeg',
    options?: {
      temperature?: number
      max_tokens?: number
    }
  ): Promise<GeminiApiResult<string>> {
    try {
      // 构建包含多张图片的消息内容
      const content: any[] = [
        {
          type: 'text',
          text: prompt
        }
      ]

      // 添加所有图片
      imageBase64Array.forEach((imageBase64, index) => {
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/${imageFormat};base64,${imageBase64}`
          }
        })
      })

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: 'user',
          content
        }
      ]

      console.log('GeminiUtils.multiImageChat 开始调用:', {
        promptLength: prompt.length,
        imageCount: imageBase64Array.length,
        imageFormat,
        options
      })

      const result = await geminiAPI.chat(
        'gemini-2.5-flash',
        messages,
        options
      )

      console.log('GeminiUtils.multiImageChat API 调用结果:', {
        success: result.success,
        hasData: !!result.data,
        error: result.error,
        choicesLength: result.data?.choices?.length,
        firstChoiceContent: result.data?.choices?.[0]?.message?.content?.substring(0, 100)
      })

      if (result.success && result.data) {
        const content = result.data.choices?.[0]?.message?.content
        if (content && content.trim()) {
          console.log('GeminiUtils.multiImageChat 成功返回内容:', content.substring(0, 100) + '...')
          return {
            success: true,
            data: content.trim()
          }
        } else {
          console.error('GeminiUtils.multiImageChat 响应内容为空:', {
            choices: result.data.choices,
            firstChoice: result.data.choices?.[0]
          })
          return {
            success: false,
            error: 'AI 返回的内容为空'
          }
        }
      }

      console.error('GeminiUtils.multiImageChat 调用失败:', result.error)
      return {
        success: false,
        error: result.error || 'AI 调用失败'
      }
    } catch (error) {
      console.error('GeminiUtils.multiImageChat 异常:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'AI 调用异常'
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
