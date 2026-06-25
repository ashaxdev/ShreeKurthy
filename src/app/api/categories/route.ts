import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Category from '@/models/Category'
import { requireAdmin } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const filter = isAdmin ? {} : { isActive: true }

    const categories = await Category.find(filter)
      .populate('parentCategory', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .lean()

    return NextResponse.json({ success: true, data: categories })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()

    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const category = await Category.create(body)
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
