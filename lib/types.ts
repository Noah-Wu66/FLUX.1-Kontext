// FLUX.1 Kontext API 类型定义

export type AspectRatio = '21:9' | '16:9' | '4:3' | '3:2' | '1:1' | '2:3' | '3:4' | '9:16' | '9:21'

export type OutputFormat = 'jpeg' | 'png'

export type SafetyTolerance = '1' | '2' | '3' | '4' | '5' | '6'

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
  aspectRatio: AspectRatio
  guidanceScale: number
  numImages: number
  outputFormat: OutputFormat
  safetyTolerance: SafetyTolerance
  seed?: number
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
