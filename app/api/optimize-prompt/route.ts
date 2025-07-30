import { NextRequest, NextResponse } from 'next/server'
import GeminiUtils from '@/lib/gemini-utils'

interface OptimizePromptRequest {
  prompt: string
  model: string // FLUX 模型类型，用于针对性优化
  imageUrl?: string // 单图片URL，用于图像理解
  imageUrls?: string[] // 多图片URLs，用于多图编辑
}

export async function POST(request: NextRequest) {
  let body: OptimizePromptRequest | null = null

  try {
    body = await request.json()

    // 验证 body 不为空
    if (!body) {
      return NextResponse.json(
        { success: false, error: '请求数据不能为空' },
        { status: 400 }
      )
    }

    // 验证必需字段
    if (!body.prompt || !body.prompt.trim()) {
      return NextResponse.json(
        { success: false, error: '提示词不能为空' },
        { status: 400 }
      )
    }

    if (!body.model) {
      return NextResponse.json(
        { success: false, error: '模型类型不能为空' },
        { status: 400 }
      )
    }

    // 检查环境变量配置
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY 环境变量未配置')
      return NextResponse.json(
        { success: false, error: 'AI 服务未配置，请联系管理员' },
        { status: 500 }
      )
    }

    // 检查是否有图片需要分析
    const hasImages = body.imageUrl || (body.imageUrls && body.imageUrls.length > 0)

    if (hasImages) {
      // 确定要处理的图片URLs
      const imageUrlsToProcess = body.imageUrls && body.imageUrls.length > 0
        ? body.imageUrls
        : body.imageUrl ? [body.imageUrl] : []

      console.log('检测到图片，使用图像理解优化提示词:', {
        imageCount: imageUrlsToProcess.length,
        isMultiImage: imageUrlsToProcess.length > 1,
        prompt: body.prompt
      })

      // 下载所有图片并转换为 base64
      const imageBase64Array: string[] = []
      try {
        for (const imageUrl of imageUrlsToProcess) {
          const imageResponse = await fetch(imageUrl)
          if (!imageResponse.ok) {
            throw new Error(`无法下载图片: ${imageUrl}`)
          }

          const imageBuffer = await imageResponse.arrayBuffer()
          const imageBase64 = Buffer.from(imageBuffer).toString('base64')
          imageBase64Array.push(imageBase64)
        }
      } catch (error) {
        console.error('图片下载失败:', error)
        return NextResponse.json(
          { success: false, error: '无法下载图片，请重试' },
          { status: 400 }
        )
      }

      // 构建图像理解的提示词（基于 Kontext 最佳实践）
      const isMultiImage = imageBase64Array.length > 1

      const imageAnalysisPrompt = isMultiImage
        ? `You are an expert at analyzing multiple images and optimizing prompts for FLUX.1 Kontext max-multi interactive image editing models.

KONTEXT MULTI-IMAGE INTERACTIVE EDITING PRINCIPLES:
- Analyze ALL images to understand individual elements that can be combined or interact
- Multi-image editing involves taking elements from one image and integrating them into another image
- Use specific, precise language with exact color names and clear verbs
- Identify transferable elements (objects, patterns, textures, people) from source images
- Specify precise integration instructions for combining elements across images
- Use natural element descriptions (e.g., "the red apple", "the woman's blue dress", "the wooden texture")
- Preserve the target image's composition while seamlessly integrating new elements
- Consider lighting, scale, perspective, and style matching for realistic integration
- Keep prompts under 512 tokens

User's instruction: "${body.prompt.trim()}"
Number of images: ${imageBase64Array.length}

TASK: Analyze all uploaded images and create an optimized Kontext multi-image interactive editing prompt.

MULTI-IMAGE INTERACTIVE ANALYSIS STEPS:
1. Analyze each image individually: identify key objects, people, patterns, textures, backgrounds
2. Understand which elements from which images should be transferred or combined
3. Identify the target image(s) where elements will be integrated
4. Determine integration method: overlay, pattern, replacement, fusion, etc.
5. Consider scale, lighting, perspective adjustments needed for seamless integration
6. Apply Kontext best practices for precision and control

OPTIMIZATION RULES FOR INTERACTIVE MULTI-IMAGE EDITING:
- Clearly identify source elements: "the red apple", "the floral pattern", "the wooden texture"
- Specify target location: "on the woman's dress", "as the background", "on the table surface"
- Define integration method: "as a repeating pattern", "overlaid on", "replacing the existing", "blended into"
- Preserve target image integrity: "while maintaining the original dress shape and fit"
- Match visual properties: "adjust the apple's lighting to match the dress fabric", "scale appropriately"
- Specify seamless integration: "blend naturally with the existing texture", "maintain realistic shadows"
- Use precise positioning: "centered on the chest area", "scattered across the fabric", "as a border design"

EXAMPLE STRUCTURES:
- "Take the [element description] and place it [location] while [preservation clause]"
- "Use the [pattern/texture description] as [application method] on the [target description]"
- "Integrate the [object description] into the [scene description] with [matching requirements]"

OUTPUT: Optimized English prompt only (under 512 tokens), following Kontext interactive multi-image best practices.`

        : `You are an expert at analyzing images and optimizing prompts for FLUX.1 Kontext image editing models.

KONTEXT EDITING PRINCIPLES:
- Use specific, precise language with exact color names and clear verbs
- Preserve important elements by explicitly stating what should remain unchanged
- Use direct subject naming instead of pronouns (e.g., "the woman with black hair" not "she")
- For character consistency, specify "while maintaining the same facial features, eye color, and facial expression"
- For composition control, specify "keeping the exact same position, scale, pose, camera angle, and framing"
- Choose verbs carefully: "change the clothes" vs "transform" (which implies complete change)
- Keep prompts under 512 tokens

STYLE TRANSFER BEST PRACTICES:
- Specify exact style names: "Transform to Bauhaus art style" not "make it more artistic"
- Reference known artists/movements: "Renaissance painting style", "watercolor painting"
- Describe visual characteristics: "oil painting with visible brushstrokes, thick paint texture, and rich color depth"
- Always preserve important elements: "while maintaining the original composition and object placement"

VISUAL CUES SUPPORT:
- If boxes or markings are visible in the image, reference them: "Add hats in the boxes"
- Use visual markers to guide specific area edits

ITERATIVE EDITING GUIDELINES:
- Maintain character consistency across multiple edits
- Use specific descriptors: "the woman with short black hair" not "she"
- For complex transformations, suggest step-by-step approach

TROUBLESHOOTING GUIDELINES:
- For identity preservation: Use "Change the clothes to [X]" instead of "Transform the person into [X]"
- For composition control: "Change the background to [X] while keeping the person in the exact same position, scale, and pose. Maintain identical subject placement, camera angle, framing, and perspective. Only replace the environment around them"
- For style application: "Convert to [style] with [specific characteristics] while preserving [important elements]"

User's instruction: "${body.prompt.trim()}"

TASK: Analyze the uploaded image and create an optimized Kontext editing prompt.

ANALYSIS STEPS:
1. Identify key subjects (people, objects, main elements) with specific descriptors
2. Understand the user's editing intention
3. Determine what should be preserved vs. changed
4. Check for visual cues (boxes, markings) that indicate specific areas to edit
5. Apply Kontext best practices for precision and control
6. Consider if this is a complex edit that should be broken into steps

OPTIMIZATION RULES:
- Use specific language: exact colors, detailed descriptions, clear action verbs
- Explicitly preserve important elements: "while maintaining the same [facial features/composition/lighting/style]"
- For people: preserve identity with "keeping the exact facial features, eye color, and facial expression"
- For backgrounds: "change the background to [X] while keeping the person in the exact same position, scale, and pose"
- For style changes: specify the exact style and what to preserve
- For text editing: use format "Replace '[original text]' with '[new text]'"
- For object modifications: be specific about what changes and what stays the same
- Apply troubleshooting guidelines for common issues

OUTPUT: Optimized English prompt only (under 512 tokens), following Kontext best practices.`

      // 使用 Gemini 进行图像理解和提示词优化
      const result = isMultiImage
        ? await GeminiUtils.multiImageChat(
            imageAnalysisPrompt,
            imageBase64Array,
            'jpeg',
            {
              temperature: 0.7
            }
          )
        : await GeminiUtils.imageChat(
            imageAnalysisPrompt,
            imageBase64Array[0],
            'jpeg',
            {
              temperature: 0.7
            }
          )

      if (result.success && result.data) {
        const optimizedPrompt = result.data.trim()
        if (optimizedPrompt) {
          console.log('图像理解提示词优化成功:', {
            originalLength: body.prompt.length,
            optimizedLength: optimizedPrompt.length,
            optimizedPreview: optimizedPrompt.substring(0, 100) + '...'
          })
          return NextResponse.json({
            success: true,
            optimizedPrompt,
            originalPrompt: body.prompt.trim(),
            usedImageAnalysis: true
          })
        }
      }

      // 如果图像理解失败，回退到纯文本优化
      console.warn('图像理解失败，回退到纯文本优化:', result.error)
    }

    // 纯文本优化（无图片或图像理解失败时）
    let systemPrompt: string
    let userPrompt: string

    if (body.model.includes('text-to-image')) {
      // 文生图优化 - 专注于场景描述、风格、构图
      systemPrompt = `You are an AI prompt optimizer for FLUX.1 Kontext text-to-image models.

KONTEXT TEXT-TO-IMAGE PRINCIPLES (adapted from Kontext editing best practices):
- Use specific, precise language with exact color names and detailed descriptions
- Create vivid, detailed scene descriptions with specific visual elements
- Include lighting, atmosphere, and mood descriptions
- Specify camera angles, composition, and framing
- Use professional photography/art terminology
- Include style references (art movements, photography styles, etc.)
- Add technical details (camera settings, lens types, etc.) when appropriate
- Keep prompts under 512 tokens

STYLE SPECIFICATION BEST PRACTICES (from Kontext guidelines):
- Specify exact style names: "Renaissance painting style", "Bauhaus art style", "watercolor painting"
- Reference known artists/movements when appropriate
- Describe visual characteristics: "oil painting with visible brushstrokes, thick paint texture, and rich color depth"
- Use precise art terminology: "chiaroscuro lighting", "impressionist brushwork", "photorealistic rendering"

PRECISION AND CLARITY (core Kontext principles):
- Use exact color names: "crimson red", "azure blue", "golden yellow" instead of generic colors
- Be specific about materials and textures: "weathered oak wood", "polished marble", "soft velvet fabric"
- Define clear spatial relationships: "in the foreground", "centered in the composition", "background bokeh"
- Specify lighting quality: "soft diffused lighting", "dramatic side lighting", "golden hour sunlight"

OPTIMIZATION RULES FOR TEXT-TO-IMAGE:
1. Translate to English if needed
2. Expand basic descriptions into rich, detailed scenes
3. Add specific visual elements: lighting (golden hour, soft lighting, dramatic shadows)
4. Include composition details: close-up, wide shot, rule of thirds, symmetrical
5. Specify style with exact names and characteristics (following Kontext style guidelines)
6. Add atmosphere: mood, weather, time of day, season
7. Include technical details: shallow depth of field, bokeh, high resolution, sharp focus
8. Use professional terminology: portrait, landscape, macro, architectural
9. Add color palette descriptions with specific color names
10. Specify quality markers: highly detailed, professional photography, award-winning
11. Apply Kontext precision principles: exact descriptions, specific materials, clear spatial relationships

STRUCTURE: [Subject with specific descriptors] + [Action/Pose] + [Setting/Background with details] + [Precise lighting description] + [Exact style specification] + [Technical details] + [Mood/Atmosphere]

Output: Optimized English prompt only (under 512 tokens), following Kontext text-to-image best practices.`

      userPrompt = `Create a detailed text-to-image prompt from this description, applying Kontext precision principles for exact colors, specific materials, clear spatial relationships, and precise style specifications: ${body.prompt.trim()}`
    } else {
      // 图片编辑优化 - 专注于精确编辑指令
      systemPrompt = `You are an AI prompt optimizer for FLUX.1 Kontext image editing models.

KONTEXT EDITING PRINCIPLES:
- Use specific, precise language with exact color names and clear verbs
- Preserve important elements by explicitly stating what should remain unchanged
- Use direct subject naming instead of pronouns (e.g., "the woman with black hair" not "she")
- For character edits: specify "while maintaining the same facial features, eye color, and facial expression"
- For composition control: specify "keeping the exact same position, scale, pose, camera angle, and framing"
- Choose verbs carefully: "change the clothes" vs "transform" (complete change)
- Keep prompts under 512 tokens

STYLE TRANSFER GUIDELINES:
- Specify exact style names: "Transform to Bauhaus art style" not "make it more artistic"
- Reference known artists/movements: "Renaissance painting style", "watercolor painting"
- Describe key characteristics: "oil painting with visible brushstrokes, thick paint texture, and rich color depth"
- Always preserve important elements: "while maintaining the original composition and object placement"

ITERATIVE EDITING BEST PRACTICES:
- For complex transformations, suggest step-by-step approach
- Maintain character consistency across edits
- Use specific descriptors for subjects: "the woman with short black hair" not "she"

TROUBLESHOOTING COMMON ISSUES:
- For identity preservation: Use "Change the clothes to [X]" instead of "Transform the person into [X]"
- For composition control: "Change the background to [X] while keeping the person in the exact same position, scale, and pose. Maintain identical subject placement, camera angle, framing, and perspective. Only replace the environment around them"
- For style application: Describe specific visual characteristics of the target style

BEST PRACTICES SUMMARY:
1. Be specific and clear: Use exact color names, detailed descriptions, clear verbs
2. Start simple, add complexity: Begin with core modifications, then add details
3. Deliberately preserve: State what should NOT change using "while maintaining the same [features]"
4. Iterate when needed: Break complex transformations into sequential small edits
5. Name directly: Use "the woman with black hair" instead of "she"
6. Quote text changes: Use "Replace 'joy' with 'BFL'" format
7. Control composition: Specify "keeping the exact same camera angle, position, and framing"
8. Choose verbs carefully: "Transform" implies complete change, "Change the clothes" is more controlled

OPTIMIZATION RULES FOR IMAGE EDITING:
1. Translate to English if needed
2. Make the prompt complete and specific with exact details
3. Use precise language: specific colors, detailed descriptions, clear action verbs
4. For people: preserve identity with specific descriptors
5. For backgrounds: specify preservation of subject positioning
6. For style changes: name exact style and what to preserve
7. For text editing: use "Replace '[original]' with '[new]'" format
8. Add appropriate preservation clauses
9. For complex edits: suggest breaking into multiple steps
10. Apply troubleshooting guidelines for common issues
11. Follow the 8 best practices summary above

Output: Optimized English prompt only (under 512 tokens), following Kontext editing best practices.`

      userPrompt = `Optimize this editing instruction following Kontext best practices: ${body.prompt.trim()}`
    }

    console.log('开始优化提示词:', {
      originalPrompt: body.prompt.substring(0, 100) + '...',
      model: body.model,
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length
    })

    // 使用 Gemini 优化提示词
    const result = await GeminiUtils.textChat(
      userPrompt,
      systemPrompt,
      {
        temperature: 0.7
      }
    )

    console.log('优化提示词结果:', {
      success: result.success,
      hasData: !!result.data,
      dataLength: result.data?.length || 0,
      error: result.error
    })

    if (result.success && result.data) {
      const optimizedPrompt = result.data.trim()
      if (optimizedPrompt) {
        console.log('提示词优化成功:', {
          originalLength: body.prompt.length,
          optimizedLength: optimizedPrompt.length,
          optimizedPreview: optimizedPrompt.substring(0, 100) + '...'
        })
        return NextResponse.json({
          success: true,
          optimizedPrompt,
          originalPrompt: body.prompt.trim()
        })
      } else {
        console.error('优化后的提示词为空')
        return NextResponse.json(
          { success: false, error: '优化后的提示词为空，请重试' },
          { status: 500 }
        )
      }
    } else {
      const errorMessage = result.error || 'AI 优化失败'
      console.error('Gemini API 调用失败:', {
        error: errorMessage,
        prompt: body.prompt.substring(0, 100) + '...',
        model: body.model,
        resultSuccess: result.success,
        resultData: result.data
      })
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('优化提示词错误:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      prompt: body?.prompt ? body.prompt.substring(0, 100) + '...' : '未知',
      model: body?.model || '未知'
    })

    let errorMessage = '服务器内部错误'
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = '网络连接错误，请检查网络设置'
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请稍后重试'
      } else if (error.message.includes('JSON')) {
        errorMessage = '数据格式错误'
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
