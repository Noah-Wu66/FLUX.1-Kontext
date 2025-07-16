// FLUX.1 Kontext API 类型定义

export type AspectRatio = 'auto' | '21:9' | '16:9' | '4:3' | '3:2' | '1:1' | '2:3' | '3:4' | '9:16' | '9:21'

export type OutputFormat = 'jpeg' | 'png'

export type SafetyTolerance = '1' | '2' | '3' | '4' | '5'

export type FluxModel = 'max' | 'pro' | 'max-multi' | 'max-text-to-image' | 'pro-text-to-image'

export interface FluxKontextInput {
  prompt: string
  seed?: number
  guidance_scale?: number
  sync_mode: boolean // 必须为 true，不允许调整
  num_images?: number
  output_format?: OutputFormat
  safety_tolerance?: SafetyTolerance
  aspect_ratio?: AspectRatio
  image_url?: string
}

export interface FluxKontextMultiInput {
  prompt: string
  seed?: number
  guidance_scale?: number
  sync_mode: boolean // 必须为 true，不允许调整
  num_images?: number
  output_format?: OutputFormat
  safety_tolerance?: SafetyTolerance
  aspect_ratio?: AspectRatio
  image_urls?: string[] // 多图片输入
}

export interface GeneratedImage {
  url: string
  width: number
  height: number
  content_type?: string
}

export interface FluxKontextOutput {
  images: GeneratedImage[]
  timings?: any
  seed: number
  has_nsfw_concepts: boolean[]
  prompt: string
}

export interface GenerationRequest {
  prompt: string
  imageUrl?: string
  imageUrls?: string[] // 多图片输入，用于 max-multi 模型
  aspectRatio: Exclude<AspectRatio, 'auto'> // 'auto' 在前端处理，不传递到后端
  guidanceScale: number
  numImages: number
  outputFormat: OutputFormat
  safetyTolerance: SafetyTolerance
  seed?: number
  model: FluxModel
  usePreset?: boolean // 是否使用预设模式
  presetName?: string // 预设名称
  subject?: string // 预设中的主体（用于 Zoom 等预设）
}

export interface GenerationResult {
  success: boolean
  data?: FluxKontextOutput
  error?: string
  requestId?: string
}

export interface QueueStatus {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  logs?: Array<{ message: string }>
  progress?: number
}

// 导出 Gemini 相关类型
export * from './gemini-types'

// 导出预设系统相关类型
export * from './presets'
