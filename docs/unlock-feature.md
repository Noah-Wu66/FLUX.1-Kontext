# 模型解锁功能说明

## 功能概述

项目中的高级模型（Kontext Pro、Kontext Max、Kontext Multi、FLUX.1 Max）默认处于锁定状态，需要通过特定操作解锁后才能使用。

## 锁定的模型

### 图片编辑模型
- **Kontext Pro** - 专业图片编辑模型，平衡性能与质量的最佳选择
- **Kontext Max** - 旗舰图片编辑模型，处理复杂场景与精细调整  
- **Kontext Multi** - 多图融合编辑模型，支持复杂的多图片处理任务

### 图片生成模型
- **FLUX.1 Max** - 顶级文本生图模型，极致画质与细节表现

## 解锁方法

### 正常解锁流程
1. 在模型选择器中选择想要的模型类型（图片生成/图片编辑）
2. 找到带有小锁图标🔒的模型
3. **连续点击小锁图标5次**
4. 每次点击时小锁会震动，并显示剩余点击次数
5. 点击5次后，小锁消失，模型解锁成功
6. 解锁状态会显示绿色"已解锁"标签

### 解锁状态持久化
- 解锁状态会自动保存到浏览器本地存储
- 刷新页面或重新打开网站，解锁状态依然保持
- 解锁状态包含解锁时间戳，便于管理

## 重置解锁状态

### 方法1：长按重置（推荐）
1. 打开模型选择器
2. **长按标题"选择生图类型"或"选择模型"10秒**
3. 控制台会显示"已重置所有模型解锁状态"
4. 所有模型重新锁定

### 方法2：手动清除
在浏览器开发者工具控制台执行：
```javascript
localStorage.removeItem('flux-kontext-unlocked-models')
```

### 方法3：清除浏览器数据
清除网站的本地存储数据

## 开发调试

### 查看解锁状态
在浏览器开发者工具控制台执行：
```javascript
// 查看当前解锁状态
console.log(JSON.parse(localStorage.getItem('flux-kontext-unlocked-models') || '{}'))

// 手动解锁所有模型（仅用于测试）
localStorage.setItem('flux-kontext-unlocked-models', JSON.stringify({
  unlockedModels: ['pro', 'max', 'max-multi', 'max-text-to-image'],
  unlockTime: Date.now()
}))
```

### API端点
- `GET /api/unlock-status` - 获取解锁功能说明
- `DELETE /api/unlock-status` - 获取清除解锁状态的方法说明

## 技术实现

### 存储结构
```typescript
interface UnlockStatus {
  unlockedModels: string[]  // 已解锁的模型列表
  unlockTime: number        // 解锁时间戳
}
```

### 相关文件
- `components/ui/ModelSelector.tsx` - 主要的解锁逻辑
- `lib/utils.ts` - 解锁状态管理工具函数
- `app/globals.css` - 解锁动画样式
- `app/api/unlock-status/route.ts` - 调试API端点

## 用户体验特性

1. **视觉反馈**：小锁震动动画，解锁成功动画
2. **进度提示**：显示剩余点击次数，带背景高亮
3. **状态持久化**：解锁状态永久保存
4. **开发友好**：提供多种重置方法
5. **无障碍设计**：支持键盘和触摸操作
6. **移动端优化**：
   - 48px×48px 最小触摸目标，符合移动端标准
   - 触摸振动反馈（支持的设备）
   - 增强的触摸反馈动画
   - 更大的图标和更清晰的提示文本
   - 长按重置提示显示
