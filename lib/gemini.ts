// Gemini 2.5 Flash 大语言模型模块主入口

// 导出 API 类和实例
export { GeminiAPI, geminiAPI } from './gemini-api'

// 导入工具类
import GeminiUtils from './gemini-utils'

// 导出工具类
export { default as GeminiUtils } from './gemini-utils'

// 导出所有类型
export * from './gemini-types'

// 导出便捷方法
export const simpleChat = GeminiUtils.simpleChat
export const imageChat = GeminiUtils.imageChat
export const audioChat = GeminiUtils.audioChat
export const streamChat = GeminiUtils.streamChat
export const getEmbedding = GeminiUtils.getEmbedding
export const getBatchEmbeddings = GeminiUtils.getBatchEmbeddings
export const generateImage = GeminiUtils.generateImage
export const checkApiHealth = GeminiUtils.checkApiHealth
export const fileToBase64 = GeminiUtils.fileToBase64

// 默认导出 API 实例
export default geminiAPI
