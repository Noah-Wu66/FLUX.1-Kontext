import { fal } from '@fal-ai/client'
import type {
  FluxKontextInput,
  FluxKontextMultiInput,
  FluxKontextDevInput,
  FluxKontextOutput,
  GenerationRequest,
  GenerationResult,
  QueueStatus,
  FluxModel
} from './types'

// 配置 FAL 客户端
if (typeof window === 'undefined') {
  // 服务器端配置
  fal.config({
    credentials: process.env.FAL_KEY
  })
}

// 模型端点映射
const FLUX_MODELS = {
  max: 'fal-ai/flux-pro/kontext/max',
  pro: 'fal-ai/flux-pro/kontext',
  'max-multi': 'fal-ai/flux-pro/kontext/max/multi',
  'max-text-to-image': 'fal-ai/flux-pro/kontext/max/text-to-image',
  'pro-text-to-image': 'fal-ai/flux-pro/kontext/text-to-image',
  'kontext-dev': 'fal-ai/flux-kontext/dev'
} as const

const getModelEndpoint = (model: FluxModel): string => {
  return FLUX_MODELS[model]
}

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
      const modelEndpoint = getModelEndpoint(request.model)

      // 根据模型类型构建不同的输入
      let input: FluxKontextInput | FluxKontextMultiInput | FluxKontextDevInput

      if (request.model === 'kontext-dev') {
        // FLUX.1 Kontext [dev] 模型 - 使用 resolution_mode 而不是 aspect_ratio
        // 优先使用 resolutionMode，如果没有设置则使用 aspectRatio，默认为 'auto'
        const finalResolutionMode = request.resolutionMode || request.aspectRatio || 'auto'

        input = {
          prompt: request.prompt,
          ...(request.imageUrl && { image_url: request.imageUrl }),
          ...(request.numInferenceSteps && { num_inference_steps: request.numInferenceSteps }),
          ...(request.seed && { seed: request.seed }),
          guidance_scale: request.guidanceScale,
          ...(request.numImages && { num_images: request.numImages }),
          ...(request.enableSafetyChecker !== undefined && { enable_safety_checker: request.enableSafetyChecker }),
          output_format: request.outputFormat,
          ...(request.acceleration && { acceleration: request.acceleration }),
          resolution_mode: finalResolutionMode
        } as FluxKontextDevInput
      } else if (request.model === 'max-multi') {
        // 多图片模型
        input = {
          prompt: request.prompt,
          guidance_scale: request.guidanceScale,
          num_images: request.numImages,
          output_format: request.outputFormat,
          safety_tolerance: request.safetyTolerance,
          aspect_ratio: request.aspectRatio,
          sync_mode: true, // 必须为 true，不允许调整
          ...(request.imageUrls && request.imageUrls.length > 0 && { image_urls: request.imageUrls }),
          ...(request.seed && { seed: request.seed })
        } as FluxKontextMultiInput
      } else {
        // 单图片模型
        input = {
          prompt: request.prompt,
          guidance_scale: request.guidanceScale,
          num_images: request.numImages,
          output_format: request.outputFormat,
          safety_tolerance: request.safetyTolerance,
          aspect_ratio: request.aspectRatio,
          sync_mode: true, // 必须为 true，不允许调整
          ...(request.imageUrl && { image_url: request.imageUrl }),
          ...(request.seed && { seed: request.seed })
        } as FluxKontextInput
      }

      const result = await fal.subscribe(modelEndpoint, {
        input,
        logs: false
      }) as any

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
   * 提交生成请求到队列 - 异步方式（备用方法，主要使用同步模式）
   */
  async submitToQueue(request: GenerationRequest): Promise<{ requestId?: string; error?: string }> {
    try {
      const modelEndpoint = getModelEndpoint(request.model)

      // 根据模型类型构建不同的输入
      let input: FluxKontextInput | FluxKontextMultiInput | FluxKontextDevInput

      if (request.model === 'kontext-dev') {
        // FLUX.1 Kontext [dev] 模型 - 使用 resolution_mode 而不是 aspect_ratio
        // 优先使用 resolutionMode，如果没有设置则使用 aspectRatio，默认为 'auto'
        const finalResolutionMode = request.resolutionMode || request.aspectRatio || 'auto'

        input = {
          prompt: request.prompt,
          ...(request.imageUrl && { image_url: request.imageUrl }),
          ...(request.numInferenceSteps && { num_inference_steps: request.numInferenceSteps }),
          ...(request.seed && { seed: request.seed }),
          guidance_scale: request.guidanceScale,
          ...(request.numImages && { num_images: request.numImages }),
          ...(request.enableSafetyChecker !== undefined && { enable_safety_checker: request.enableSafetyChecker }),
          output_format: request.outputFormat,
          ...(request.acceleration && { acceleration: request.acceleration }),
          resolution_mode: finalResolutionMode
        } as FluxKontextDevInput
      } else if (request.model === 'max-multi') {
        // 多图片模型
        input = {
          prompt: request.prompt,
          guidance_scale: request.guidanceScale,
          num_images: request.numImages,
          output_format: request.outputFormat,
          safety_tolerance: request.safetyTolerance,
          aspect_ratio: request.aspectRatio,
          sync_mode: true, // 必须为 true，不允许调整
          ...(request.imageUrls && request.imageUrls.length > 0 && { image_urls: request.imageUrls }),
          ...(request.seed && { seed: request.seed })
        } as FluxKontextMultiInput
      } else {
        // 单图片模型
        input = {
          prompt: request.prompt,
          guidance_scale: request.guidanceScale,
          num_images: request.numImages,
          output_format: request.outputFormat,
          safety_tolerance: request.safetyTolerance,
          aspect_ratio: request.aspectRatio,
          sync_mode: true, // 必须为 true，不允许调整
          ...(request.imageUrl && { image_url: request.imageUrl }),
          ...(request.seed && { seed: request.seed })
        } as FluxKontextInput
      }

      const result = await fal.queue.submit(modelEndpoint, {
        input
      }) as any

      return { requestId: result.request_id }
    } catch (error) {
      console.error('提交队列失败:', error)
      return { error: error instanceof Error ? error.message : '未知错误' }
    }
  }

  /**
   * 检查队列状态（备用方法，主要使用同步模式）
   */
  async checkQueueStatus(requestId: string, model: FluxModel = 'max'): Promise<QueueStatus> {
    try {
      const modelEndpoint = getModelEndpoint(model)

      const status: any = await fal.queue.status(modelEndpoint, {
        requestId,
        logs: false
      })

      return {
        status: status.status as QueueStatus['status'],
        logs: [],
        progress: status.progress
      }
    } catch (error) {
      console.error('检查状态失败:', error)
      return { status: 'FAILED' }
    }
  }

  /**
   * 获取队列结果（备用方法，主要使用同步模式）
   */
  async getQueueResult(requestId: string, model: FluxModel = 'max'): Promise<GenerationResult> {
    try {
      const modelEndpoint = getModelEndpoint(model)

      const result = await fal.queue.result(modelEndpoint, {
        requestId
      }) as any

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
