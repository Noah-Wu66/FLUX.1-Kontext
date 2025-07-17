# Kontext 提示词优化功能示例

## 功能概述
基于 Black Forest Labs Kontext 官方指南，我们的 AI 提示词优化功能现在能够：
- 分析图片内容并理解编辑意图
- 应用 Kontext 最佳实践生成精确的编辑指令
- 自动添加元素保持和构图控制条款
- 确保提示词在 512 token 限制内

## 优化示例

### 1. 基本对象修改
**用户输入**：给女孩戴上墨镜
**AI 优化后**：
```
Add stylish sunglasses to the woman with [具体发色] hair while maintaining the same facial features, eye color, and facial expression. Keep the exact same position, scale, pose, camera angle, and framing.
```

### 2. 背景替换
**用户输入**：把背景换成海滩
**AI 优化后**：
```
Change the background to a sunny beach while keeping the person in the exact same position, scale, and pose. Maintain identical subject placement, camera angle, framing, and perspective. Only replace the environment around them.
```

### 3. 服装变换
**用户输入**：换成古装
**AI 优化后**：
```
Change the clothes to traditional Chinese hanfu dress while preserving the exact facial features, eye color, facial expression, and body pose. Maintain the same lighting and background.
```

### 4. 风格转换
**用户输入**：变成油画风格
**AI 优化后**：
```
Convert to oil painting style with visible brush strokes, thick paint texture, and rich color depth while maintaining the exact same composition, subject positioning, and all facial features.
```

### 5. 文本编辑
**用户输入**：把招牌上的文字改成"咖啡店"
**AI 优化后**：
```
Replace '[原始文字]' with 'Coffee Shop' while maintaining the same font style, color, and sign design.
```

### 6. 复杂编辑
**用户输入**：让她在雨中，加把伞
**AI 优化后**：
```
Add rain falling in the scene and place a colorful umbrella in the woman's hand while maintaining her exact facial features, eye color, facial expression, and original pose. Keep the same camera angle and framing.
```

## 关键优化特点

### 精确性控制
- 使用具体的颜色名称和详细描述
- 明确指定保持不变的元素
- 选择精确的动作动词

### 身份保持
- 自动添加面部特征保持条款
- 使用具体描述而非代词
- 保持角色一致性

### 构图控制
- 明确保持位置、比例、姿势
- 指定相机角度和取景不变
- 防止意外的重新定位

### 风格应用
- 指定确切的风格名称
- 描述关键视觉特征
- 明确保留的原始元素

## 文生图优化示例

### 1. 人物肖像
**用户输入**：一个美丽的女孩
**AI 优化后**：
```
Portrait of a beautiful young woman with flowing auburn hair, gentle smile, and bright hazel eyes. Soft natural lighting from a window, shallow depth of field with bokeh background. Professional photography style, high resolution, sharp focus on face. Warm color palette with golden hour lighting. Shot with 85mm lens, f/1.4 aperture.
```

### 2. 风景场景
**用户输入**：夕阳下的海滩
**AI 优化后**：
```
Serene beach scene during golden hour sunset, warm orange and pink sky reflecting on calm ocean waves. Silhouetted palm trees on the left, pristine white sand in foreground. Dramatic lighting with sun rays breaking through clouds. Wide landscape shot, rule of thirds composition. Photorealistic style, highly detailed, professional landscape photography.
```

### 3. 建筑摄影
**用户输入**：现代建筑
**AI 优化后**：
```
Modern glass skyscraper with sleek geometric design, reflecting blue sky and white clouds. Clean architectural lines, minimalist aesthetic. Shot from low angle to emphasize height and grandeur. Bright daylight with sharp shadows creating contrast. Urban photography style, high contrast, crystal clear details. Professional architectural photography, award-winning composition.
```

### 4. 艺术风格
**用户输入**：油画风格的花朵
**AI 优化后**：
```
Vibrant bouquet of roses and peonies in classical oil painting style. Rich impasto technique with visible brush strokes, thick paint texture. Warm color palette of deep reds, soft pinks, and emerald greens. Dramatic chiaroscuro lighting reminiscent of Dutch Golden Age masters. Highly detailed petals and leaves, museum-quality artwork.
```

### 5. 动物摄影
**用户输入**：可爱的小猫
**AI 优化后**：
```
Adorable orange tabby kitten with bright blue eyes, sitting on a soft white blanket. Macro photography with shallow depth of field, bokeh background. Soft natural lighting highlighting the fluffy fur texture. Close-up portrait shot, sharp focus on eyes. Professional pet photography, high resolution, heartwarming mood.
```

## 文生图优化特点

### 场景构建
- 详细的环境描述
- 具体的时间和天气设定
- 丰富的背景元素

### 视觉技术
- 专业摄影术语
- 相机设置和镜头选择
- 构图和取景技巧

### 风格指定
- 明确的艺术风格
- 技术手法描述
- 质量和细节要求

### 氛围营造
- 情绪和氛围描述
- 色彩搭配方案
- 光影效果设定

## 多图互动编辑优化示例

### 1. 元素转移融合
**用户输入**：把苹果作为图案放在女孩的衣服上
**AI 优化后**：
```
Take the red apple and use it as a repeating pattern on the woman's blue dress. Scale the apple appropriately to fit the fabric texture, adjust the lighting to match the dress material, and distribute the apple pattern evenly across the dress while maintaining the original dress shape, fit, and the woman's pose.
```

### 2. 背景元素融合
**用户输入**：把花园作为背景放到人物照片后面
**AI 优化后**：
```
Replace the background with the lush garden scene while keeping the person in the exact same position, scale, and pose. Adjust the garden lighting to match the person's lighting, ensure proper depth of field with the person in sharp focus, and blend the edges naturally for seamless integration.
```

### 3. 纹理材质转移
**用户输入**：把木纹应用到桌子上
**AI 优化后**：
```
Apply the rich wood grain texture to the table surface. Match the wood texture's scale and orientation to the table's perspective, adjust the lighting and shadows to maintain the table's three-dimensional form, while preserving all other objects and the overall composition.
```

### 4. 人物服装融合
**用户输入**：让女孩穿上那条裙子
**AI 优化后**：
```
Replace the woman's clothing with the elegant floral dress while maintaining her exact facial features, eye color, facial expression, and body pose. Adjust the dress size and fit to match her body proportions, ensure proper lighting and shadows on the fabric, and preserve the background and camera angle.
```

### 5. 装饰元素添加
**用户输入**：把花朵装饰到女孩的头发上
**AI 优化后**：
```
Take the delicate pink flowers and place them as hair accessories in the woman's hair. Scale the flowers appropriately for hair decoration, adjust their colors and lighting to complement her hair color and the overall lighting, while maintaining her facial features, expression, and the original composition.
```

### 6. 物体替换融合
**用户输入**：用猫替换沙发上的抱枕
**AI 优化后**：
```
Replace the cushion on the sofa with the orange tabby cat. Position the cat naturally on the sofa in the same location as the original cushion, adjust the cat's size to fit proportionally, match the lighting conditions, and ensure the cat appears comfortably settled while maintaining the sofa's texture and the room's atmosphere.
```

## 多图互动编辑优化特点

### 元素识别与转移
- 精确识别源图片中的可转移元素
- 理解目标图片的接收位置
- 生成无缝融合指令

### 视觉属性匹配
- 光照条件协调
- 比例和透视调整
- 色彩和材质匹配

### 自然融合控制
- 边缘混合处理
- 阴影和反射调整
- 深度和层次保持

### 构图完整性
- 保持目标图片的主体构图
- 维护原始视觉平衡
- 确保编辑后的自然效果

## 技术实现
1. **多图像分析**：同时分析所有图片，识别可转移的元素和目标位置
2. **互动关系理解**：理解图片间的元素融合和转移需求
3. **意图解析**：解析用户的生成/编辑需求
4. **最佳实践应用**：按照 Kontext 指南构建提示词
5. **模式区分**：
   - 文生图：重点场景构建
   - 单图编辑：重点精确控制和元素保持
   - 多图互动编辑：重点元素融合和视觉匹配
6. **长度控制**：确保在 512 token 限制内
7. **质量验证**：检查提示词的完整性和准确性
