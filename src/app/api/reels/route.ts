import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { Reel } from '@/models/index'
import { requireAdmin } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const filter = isAdmin ? {} : { isActive: true }

    const reels = await Reel.find(filter)
      .populate('productIds', 'name slug images basePrice')
      .sort({ sortOrder: 1, createdAt: -1 })

    return NextResponse.json({ success: true, data: reels })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()
    const reel = await Reel.create(body)
    return NextResponse.json({ success: true, data: reel }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
