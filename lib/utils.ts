import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 生成随机种子
 */
export function generateRandomSeed(): number {
  return Math.floor(Math.random() * 1000000)
}

/**
 * 验证图片文件类型
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return validTypes.includes(file.type)
}

/**
 * 下载图片
 */
export async function downloadImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('下载失败:', error)
    throw new Error('下载失败')
  }
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 获取图片尺寸信息
 */
export function getAspectRatioInfo(aspectRatio: string) {
  const ratioMap: Record<string, { width: number; height: number; label: string }> = {
    'auto': { width: 1024, height: 1024, label: '自动' },
    '21:9': { width: 1344, height: 576, label: '超宽屏 (21:9)' },
    '16:9': { width: 1344, height: 768, label: '宽屏 (16:9)' },
    '4:3': { width: 1152, height: 896, label: '标准 (4:3)' },
    '3:2': { width: 1216, height: 832, label: '经典 (3:2)' },
    '1:1': { width: 1024, height: 1024, label: '正方形 (1:1)' },
    '2:3': { width: 832, height: 1216, label: '竖版 (2:3)' },
    '3:4': { width: 896, height: 1152, label: '竖版 (3:4)' },
    '9:16': { width: 768, height: 1344, label: '手机竖屏 (9:16)' },
    '9:21': { width: 576, height: 1344, label: '超长竖屏 (9:21)' }
  }

  return ratioMap[aspectRatio] || ratioMap['1:1']
}

/**
 * 从图片 URL 获取图片尺寸
 */
export function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }

    img.onerror = () => {
      reject(new Error('无法加载图片'))
    }

    img.src = imageUrl
  })
}

/**
 * 根据图片尺寸计算最接近的预设比例
 */
export function detectAspectRatio(width: number, height: number): Exclude<import('./types').AspectRatio, 'auto'> {
  const ratio = width / height

  // 预设比例及其数值
  const presetRatios = [
    { key: '21:9', value: 21/9, label: '超宽屏 (21:9)' },
    { key: '16:9', value: 16/9, label: '宽屏 (16:9)' },
    { key: '4:3', value: 4/3, label: '标准 (4:3)' },
    { key: '3:2', value: 3/2, label: '经典 (3:2)' },
    { key: '1:1', value: 1/1, label: '正方形 (1:1)' },
    { key: '2:3', value: 2/3, label: '竖版 (2:3)' },
    { key: '3:4', value: 3/4, label: '竖版 (3:4)' },
    { key: '9:16', value: 9/16, label: '手机竖屏 (9:16)' },
    { key: '9:21', value: 9/21, label: '超长竖屏 (9:21)' }
  ]

  // 找到最接近的比例
  let closestRatio = presetRatios[0]
  let minDifference = Math.abs(ratio - closestRatio.value)

  for (const preset of presetRatios) {
    const difference = Math.abs(ratio - preset.value)
    if (difference < minDifference) {
      minDifference = difference
      closestRatio = preset
    }
  }

  return closestRatio.key as Exclude<import('./types').AspectRatio, 'auto'>
}

/**
 * 格式化比例显示文本
 */
export function formatAspectRatioText(width: number, height: number, detectedRatio: string): string {
  const ratioValue = (width / height).toFixed(2)
  const ratioInfo = getAspectRatioInfo(detectedRatio)
  return `${width} × ${height} (${ratioValue}) → ${ratioInfo.label}`
}

/**
 * 移动端自动滚动到生成结果
 */
export function scrollToResultOnMobile(delay: number = 100): void {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    setTimeout(() => {
      const resultElement = document.querySelector('.order-2')
      if (resultElement) {
        resultElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, delay)
  }
}

/**
 * 生成结果本地存储管理
 */
const GENERATION_RESULT_KEY = 'flux-kontext-last-result'

export interface SavedGenerationResult {
  images: import('./types').GeneratedImage[]
  prompt: string
  seed?: number
  model: string
  timestamp: number
}

/**
 * 保存生成结果到本地存储
 */
export function saveGenerationResult(result: Omit<SavedGenerationResult, 'timestamp'>): void {
  if (typeof window === 'undefined') return

  try {
    const savedResult: SavedGenerationResult = {
      ...result,
      timestamp: Date.now()
    }
    localStorage.setItem(GENERATION_RESULT_KEY, JSON.stringify(savedResult))
  } catch (error) {
    console.error('保存生成结果失败:', error)
  }
}

/**
 * 从本地存储加载生成结果
 */
export function loadGenerationResult(): SavedGenerationResult | null {
  if (typeof window === 'undefined') return null

  try {
    const saved = localStorage.getItem(GENERATION_RESULT_KEY)
    if (saved) {
      const parsed: SavedGenerationResult = JSON.parse(saved)
      // 检查是否过期（7天）
      const isExpired = Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000
      if (!isExpired) {
        return parsed
      } else {
        // 清除过期数据
        localStorage.removeItem(GENERATION_RESULT_KEY)
      }
    }
  } catch (error) {
    console.error('加载生成结果失败:', error)
  }
  return null
}

/**
 * 清除保存的生成结果
 */
export function clearGenerationResult(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(GENERATION_RESULT_KEY)
  } catch (error) {
    console.error('清除生成结果失败:', error)
  }
}

// 模型解锁状态管理
const UNLOCK_STORAGE_KEY = 'flux-kontext-unlocked-models'

export interface UnlockStatus {
  unlockedModels: string[]
  unlockTime: number
}

/**
 * 加载解锁状态
 */
export function loadUnlockStatus(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(UNLOCK_STORAGE_KEY)
    if (stored) {
      const unlockStatus: UnlockStatus = JSON.parse(stored)
      return unlockStatus.unlockedModels || []
    }
  } catch (error) {
    console.error('加载解锁状态失败:', error)
  }
  return []
}

/**
 * 保存解锁状态
 */
export function saveUnlockStatus(unlockedModels: string[]): void {
  if (typeof window === 'undefined') return

  try {
    const unlockStatus: UnlockStatus = {
      unlockedModels,
      unlockTime: Date.now()
    }
    localStorage.setItem(UNLOCK_STORAGE_KEY, JSON.stringify(unlockStatus))
  } catch (error) {
    console.error('保存解锁状态失败:', error)
  }
}

/**
 * 清除解锁状态
 */
export function clearUnlockStatus(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(UNLOCK_STORAGE_KEY)
  } catch (error) {
    console.error('清除解锁状态失败:', error)
  }
}

/**
 * 检查模型是否已解锁
 */
export function isModelUnlocked(model: string): boolean {
  const unlockedModels = loadUnlockStatus()
  return unlockedModels.includes(model)
}
