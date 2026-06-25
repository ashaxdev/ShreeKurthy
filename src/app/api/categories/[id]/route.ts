import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Category from '@/models/Category'
import { requireAdmin } from '@/lib/jwt'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const cat = await Category.findOne({
      $or: [{ _id: params.id.match(/^[0-9a-fA-F]{24}$/) ? params.id : null }, { slug: params.id }],
    })
    if (!cat) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: cat })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()
    const cat = await Category.findByIdAndUpdate(params.id, body, { new: true })
    if (!cat) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: cat })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    await Category.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
