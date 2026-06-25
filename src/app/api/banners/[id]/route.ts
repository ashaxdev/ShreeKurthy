import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'

import connectDB from '@/lib/db'
import { Banner } from '@/models/index'
import { requireAdmin } from '@/lib/jwt'


function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json({ success: false, message: 'Invalid banner id' }, { status: 400 })
    }

    const banner = await Banner.findById(id)
    if (!banner) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: banner })
  } catch (error) {
    console.error('GET /api/banners/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch banner' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json({ success: false, message: 'Invalid banner id' }, { status: 400 })
    }

    const body = await req.json()

    if (!body.title || !body.image) {
      return NextResponse.json({ success: false, message: 'Title and image are required' }, { status: 400 })
    }

    const updated = await Banner.findByIdAndUpdate(
      id,
      {
        title: body.title,
        subtitle: body.subtitle || '',
        image: body.image,
        link: body.link || '',
        buttonText: body.buttonText || 'Shop Now',
        type: body.type || 'hero',
        isActive: body.isActive ?? true,
      },
      { new: true, runValidators: true }
    )

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('PUT /api/banners/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Failed to update banner' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json({ success: false, message: 'Invalid banner id' }, { status: 400 })
    }

    const deleted = await Banner.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Banner deleted' })
  } catch (error) {
    console.error('DELETE /api/banners/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete banner' }, { status: 500 })
  }
}