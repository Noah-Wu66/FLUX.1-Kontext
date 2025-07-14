# FLUX.1 Kontext AI 绘图应用

基于 FLUX.1 Kontext Max 模型的高质量 AI 图片生成应用，支持文本到图片生成和图片编辑功能。

## 功能特点

- 🎨 **高质量图片生成** - 基于 FLUX.1 Kontext Max 模型
- 🖼️ **多种图片比例** - 支持正方形、宽屏、竖屏等多种比例
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ⚡ **快速生成** - 通常 10-30 秒内完成生成
- 🔧 **高级参数** - 支持引导强度、安全等级、随机种子等设置
- 📤 **图片上传** - 支持参考图片上传进行图片编辑
- 💾 **便捷下载** - 一键下载生成的图片

## 技术栈

- **前端框架**: Next.js 14 + React 18
- **样式**: Tailwind CSS
- **语言**: TypeScript
- **API**: FLUX.1 Kontext Max (FAL.ai)
- **图标**: Lucide React

## 快速开始

### 1. 环境要求

- Node.js 18+ 
- npm/yarn/pnpm

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 环境配置

复制 `.env.example` 文件为 `.env.local`：

```bash
cp .env.example .env.local
```

在 `.env.local` 中配置你的 FAL API Key：

```env
FAL_KEY=your_fal_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. 获取 FAL API Key

1. 访问 [FAL.ai](https://fal.ai)
2. 注册账号并登录
3. 在控制台中获取 API Key
4. 将 API Key 填入 `.env.local` 文件

### 5. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. 在环境变量中设置 `FAL_KEY`
4. 部署完成

### 其他平台

应用支持部署到任何支持 Next.js 的平台，如：
- Netlify
- Railway
- Render
- 自托管服务器

## API 使用

### 生成图片

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: '一只可爱的小猫',
    aspectRatio: '1:1',
    guidanceScale: 3.5,
    numImages: 1,
    outputFormat: 'jpeg',
    safetyTolerance: '2'
    // sync_mode 自动设置为 true，无需手动指定
  }),
})

const result = await response.json()
```

### 上传图片

```typescript
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})

const result = await response.json()
```

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── GenerationForm.tsx # 生成表单
│   ├── ImageGallery.tsx  # 图片展示
│   └── ImageUpload.tsx   # 图片上传
├── lib/                  # 工具库
│   ├── flux-api.ts       # FLUX API 集成
│   ├── types.ts          # 类型定义
│   └── utils.ts          # 工具函数
└── public/               # 静态资源
```

## 支持的参数

### 图片比例
- 正方形 (1:1)
- 宽屏 (16:9)
- 手机竖屏 (9:16)
- 标准 (4:3)
- 竖版 (3:4)
- 超宽屏 (21:9)
- 超长竖屏 (9:21)
- 经典 (3:2)
- 竖版 (2:3)

### 输出格式
- JPEG
- PNG

### 安全等级
- 1-6 级，1 为最严格，6 为最宽松

### 重要说明
- `sync_mode` 参数固定为 `true`，确保同步生成模式
- 这样可以直接在响应中获取生成的图片，无需轮询

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 支持

如有问题，请提交 Issue 或联系开发者。
