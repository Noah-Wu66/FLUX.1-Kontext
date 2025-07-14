import { NextRequest, NextResponse } from 'next/server'
import { fluxAPI } from '@/lib/flux-api'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '没有找到文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '不支持的文件类型，请上传 JPEG、PNG 或 WebP 格式的图片' },
        { status: 400 }
      )
    }

    // 验证文件大小 (最大 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '文件大小不能超过 10MB' },
        { status: 400 }
      )
    }

    // 上传文件到 FAL 存储
    const result = await fluxAPI.uploadFile(file)
    
    if (result.url) {
      return NextResponse.json({
        success: true,
        url: result.url,
        filename: file.name,
        size: file.size,
        type: file.type
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error || '文件上传失败' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('文件上传错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}
