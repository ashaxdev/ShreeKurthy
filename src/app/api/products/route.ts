import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import { requireAdmin } from '@/lib/jwt'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const size = searchParams.get('size')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const featured = searchParams.get('featured')
    const newArrival = searchParams.get('newArrival')
    const bestSeller = searchParams.get('bestSeller')
    const isAdmin = searchParams.get('admin') === 'true'

    const filter: Record<string, unknown> = {}
    if (!isAdmin) filter.isActive = true
    if (category) filter.category = category
    if (featured === 'true') filter.isFeatured = true
    if (newArrival === 'true') filter.isNewArrival = true
    if (bestSeller === 'true') filter.isBestSeller = true
    if (size) filter.availableSizes = { $in: [size] }
    if (search) filter.$text = { $search: search }
    if (minPrice || maxPrice) {
      filter.basePrice = {}
      if (minPrice) (filter.basePrice as Record<string, number>).$gte = parseInt(minPrice)
      if (maxPrice) (filter.basePrice as Record<string, number>).$lte = parseInt(maxPrice)
    }

    const skip = (page - 1) * limit
    const sortObj: Record<string, 1 | -1> = { [sort]: order === 'asc' ? 1 : -1 }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req)
    await connectDB()
    const body = await req.json()

    // Auto-generate slug
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    // Calculate total stock from color variants
    let totalStock = 0
    if (body.colorVariants) {
      body.colorVariants.forEach((cv: { sizes: { stock: number }[] }) => {
        cv.sizes?.forEach((s) => { totalStock += s.stock || 0 })
      })
    }
    body.totalStock = totalStock

    // Collect available sizes
    const sizes = new Set<string>()
    body.colorVariants?.forEach((cv: { sizes: { size: string }[] }) => {
      cv.sizes?.forEach((s) => sizes.add(s.size))
    })
    body.availableSizes = Array.from(sizes)

    const product = await Product.create(body)
    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
