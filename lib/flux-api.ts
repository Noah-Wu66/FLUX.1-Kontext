import { fal } from '@fal-ai/client'
import type { 
  FluxKontextInput, 
  FluxKontextOutput, 
  GenerationRequest, 
  GenerationResult,
  QueueStatus 
} from './types'

// 配置 FAL 客户端
if (typeof window === 'undefined') {
  // 服务器端配置
  fal.config({
    credentials: process.env.FAL_KEY
  })
}

const FLUX_KONTEXT_MODEL = 'fal-ai/flux-pro/kontext/max'

export class FluxAPI {
  private static instance: FluxAPI
  
  private constructor() {}
  
  static getInstance(): FluxAPI {
    if (!FluxAPI.instance) {
      FluxAPI.instance = new FluxAPI()
    }
    return FluxAPI.instance
  }

  /**
   * 生成图片 - 同步方式
   */
  async generateImage(request: GenerationRequest): Promise<GenerationResult> {
    try {
      const input: FluxKontextInput = {
        prompt: request.prompt,
        guidance_scale: request.guidanceScale,
        num_images: request.numImages,
        output_format: request.outputFormat,
        safety_tolerance: request.safetyTolerance,
        aspect_ratio: request.aspectRatio,
        sync_mode: true, // 必须为 true，不允许调整
        ...(request.imageUrl && { image_url: request.imageUrl }),
        ...(request.seed && { seed: request.seed })
      }

      const result = await fal.subscribe(FLUX_KONTEXT_MODEL, {
        input,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log('生成进度:', update.logs?.map(log => log.message).join('\n'))
          }
        }
      })

      return {
        success: true,
        data: result.data as FluxKontextOutput,
        requestId: result.requestId
      }
    } catch (error) {
      console.error('图片生成失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 提交生成请求到队列 - 异步方式
   */
  async submitToQueue(request: GenerationRequest): Promise<{ requestId?: string; error?: string }> {
    try {
      const input: FluxKontextInput = {
        prompt: request.prompt,
        guidance_scale: request.guidanceScale,
        num_images: request.numImages,
        output_format: request.outputFormat,
        safety_tolerance: request.safetyTolerance,
        aspect_ratio: request.aspectRatio,
        sync_mode: true, // 必须为 true，不允许调整
        ...(request.imageUrl && { image_url: request.imageUrl }),
        ...(request.seed && { seed: request.seed })
      }

      const { request_id } = await fal.queue.submit(FLUX_KONTEXT_MODEL, {
        input
      })

      return { requestId: request_id }
    } catch (error) {
      console.error('提交队列失败:', error)
      return { error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  /**
   * 检查队列状态
   */
  async checkQueueStatus(requestId: string): Promise<QueueStatus> {
    try {
      const status = await fal.queue.status(FLUX_KONTEXT_MODEL, {
        requestId,
        logs: true
      })

      return {
        status: status.status as QueueStatus['status'],
        logs: status.logs,
        progress: status.progress
      }
    } catch (error) {
      console.error('检查状态失败:', error)
      return { status: 'FAILED' }
    }
  }

  /**
   * 获取队列结果
   */
  async getQueueResult(requestId: string): Promise<GenerationResult> {
    try {
      const result = await fal.queue.result(FLUX_KONTEXT_MODEL, {
        requestId
      })

      return {
        success: true,
        data: result.data as FluxKontextOutput,
        requestId: result.requestId
      }
    } catch (error) {
      console.error('获取结果失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 上传文件到 FAL 存储
   */
  async uploadFile(file: File): Promise<{ url?: string; error?: string }> {
    try {
      const url = await fal.storage.upload(file)
      return { url }
    } catch (error) {
      console.error('文件上传失败:', error)
      return { error: error instanceof Error ? error.message : '文件上传失败' }
    }
  }
}

export const fluxAPI = FluxAPI.getInstance()
