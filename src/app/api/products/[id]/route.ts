import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/jwt'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    const product = await Product.findOne({
      $or: [{ _id: params.id.match(/^[0-9a-fA-F]{24}$/) ? params.id : null }, { slug: params.id }],
    }).populate('category', 'name slug')

    if (!product) return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: product })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()

    // Recalculate stock and sizes
    if (body.colorVariants) {
      let totalStock = 0
      const sizes = new Set<string>()
      body.colorVariants.forEach((cv: { sizes: { stock: number; size: string }[] }) => {
        cv.sizes?.forEach((s) => {
          totalStock += s.stock || 0
          sizes.add(s.size)
        })
      })
      body.totalStock = totalStock
      body.availableSizes = Array.from(sizes)
    }

    const product = await Product.findByIdAndUpdate(params.id, body, { new: true, runValidators: true })
    if (!product) return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: product })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    requireAdmin(req)
    await connectDB()
    await Product.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true, message: 'Deleted' })
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
