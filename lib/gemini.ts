// Gemini 2.5 Flash 模块 - 仅用于图片分析生成提示词

// 导出 API 类和实例
export { GeminiAPI, geminiAPI } from './gemini-api'

// 导入工具类
import GeminiUtils from './gemini-utils'

// 导出工具类
export { default as GeminiUtils } from './gemini-utils'

// 导出所有类型
export * from './gemini-types'

// 导出核心方法
export const imageChat = GeminiUtils.imageChat
export const fileToBase64 = GeminiUtils.fileToBase64

// 默认导出 API 实例
export default geminiAPI
