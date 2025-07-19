import { NextRequest, NextResponse } from 'next/server'

// 模拟服务端解锁状态管理（实际上解锁状态存储在客户端）
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: '解锁状态由客户端本地存储管理',
      storageKey: 'flux-kontext-unlocked-models',
      instructions: {
        check: '在浏览器开发者工具中查看 localStorage',
        reset: '长按模型选择器标题10秒可重置解锁状态',
        manual: '可在控制台执行 localStorage.removeItem("flux-kontext-unlocked-models") 手动清除'
      }
    })
  } catch (error) {
    console.error('获取解锁状态信息失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 这个端点主要用于文档说明，实际清除操作在客户端进行
    return NextResponse.json({
      success: true,
      message: '请在客户端执行清除操作',
      instructions: [
        '方法1: 长按模型选择器标题10秒',
        '方法2: 在浏览器控制台执行: localStorage.removeItem("flux-kontext-unlocked-models")',
        '方法3: 清除浏览器数据'
      ]
    })
  } catch (error) {
    console.error('清除解锁状态失败:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
