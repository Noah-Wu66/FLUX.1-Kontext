# Gemini 2.5 Flash 大语言模型模块

本模块集成了 Google Gemini 2.5 Flash 大语言模型，提供了完整的 API 接口和便捷的工具方法。

## 功能特性

- ✅ 文本对话（支持系统消息）
- ✅ 流式对话
- ✅ 图像理解
- ✅ 音频理解
- ✅ 函数调用
- ✅ 结构化输出
- ✅ 文本嵌入
- ✅ 图像生成（Imagen 3.0）
- ✅ 思考型推理（Reasoning）
- ✅ 环境变量配置

## 环境配置

在 `.env` 文件中添加以下配置：

```env
# OpenAI API 密钥（必需，用于 Gemini 2.5 Flash）
OPENAI_API_KEY=your_openai_api_key_here

# OpenAI API 基础 URL（可选，默认值如下）
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
```

## 基础使用

### 1. 导入模块

```typescript
import { geminiAPI, GeminiUtils, simpleChat } from '@/lib/gemini'
```

### 2. 简单文本对话

```typescript
const result = await simpleChat(
  "解释一下人工智能是如何工作的",
  "你是一个专业的AI助手", // 系统消息（可选）
  {
    model: 'gemini-2.5-flash',
    reasoning_effort: 'medium',
    temperature: 0.7
  }
)

if (result.success) {
  console.log(result.data) // AI 的回复
}
```

### 3. 图像理解

```typescript
const imageBase64 = await GeminiUtils.fileToBase64(imageFile)
const result = await imageChat(
  "描述这张图片中的内容",
  imageBase64,
  'jpeg'
)
```

### 4. 流式对话

```typescript
const stream = await streamChat(
  "写一首关于春天的诗",
  "你是一位诗人"
)

if ('success' in stream) {
  console.error(stream.error)
} else {
  for await (const chunk of stream) {
    console.log(chunk) // 实时输出文本片段
  }
}
```

### 5. 文本嵌入

```typescript
const embedding = await getEmbedding("这是一段需要向量化的文本")
if (embedding.success) {
  console.log(embedding.data) // 数字向量数组
}
```

## 高级使用

### 1. 直接使用 API 类

```typescript
import { geminiAPI } from '@/lib/gemini'

const response = await geminiAPI.chat({
  model: 'gemini-2.5-flash',
  messages: [
    { role: 'system', content: '你是一个专业助手' },
    { role: 'user', content: '你好' }
  ],
  reasoning_effort: 'high',
  thinking_budget: 1024,
  include_thoughts: true
})
```

### 2. 函数调用

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市的天气信息',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称' }
        },
        required: ['city']
      }
    }
  }
]

const response = await geminiAPI.chat({
  model: 'gemini-2.5-flash',
  messages: [{ role: 'user', content: '北京今天天气怎么样？' }],
  tools,
  tool_choice: 'auto'
})
```

### 3. 音频理解

```typescript
const audioBase64 = await GeminiUtils.fileToBase64(audioFile)
const result = await audioChat(
  "转录这段音频内容",
  audioBase64,
  'wav'
)
```

### 4. 图像生成

```typescript
const images = await generateImage(
  "一只穿着斗篷的牧羊犬的肖像",
  {
    format: 'url',
    count: 1
  }
)
```

## API 参考

### 模型类型

- `gemini-2.5-flash`: 快速响应模型
- `gemini-2.5-pro`: 高性能模型

### 推理级别

- `none`: 无推理
- `low`: 低级推理（1,024 tokens）
- `medium`: 中级推理（8,192 tokens）
- `high`: 高级推理（24,576 tokens）

### 响应格式

所有方法都返回统一的响应格式：

```typescript
interface GeminiApiResult<T> {
  success: boolean
  data?: T
  error?: string
}
```

## 错误处理

```typescript
const result = await simpleChat("你好")

if (!result.success) {
  console.error('请求失败:', result.error)
  return
}

console.log('AI 回复:', result.data)
```

## 注意事项

1. 确保在服务器端使用，客户端调用需要通过 API 路由
2. API 密钥不要暴露在客户端代码中
3. 图像和音频文件需要转换为 Base64 格式
4. 流式响应需要正确处理异步迭代器
5. 思考型推理会消耗更多 tokens，请根据需要选择合适的级别

## 许可证

本模块遵循项目的整体许可证。
