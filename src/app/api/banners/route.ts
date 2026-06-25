import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Banner } from '@/models/index'
import { requireAdmin } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const isAdmin = searchParams.get('admin') === 'true'

    const filter: Record<string, unknown> = {}
    if (!isAdmin) filter.isActive = true
    if (type) filter.type = type

    const banners = await Banner.find(filter).sort({ sortOrder: 1 })
    return NextResponse.json({ success: true, data: banners })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()
    const banner = await Banner.create(body)
    return NextResponse.json({ success: true, data: banner }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
