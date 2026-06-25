import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, requireAuth } from '@/lib/jwt'
import { uploadImage, uploadVideo } from '@/lib/cloudinary'

// Folders any logged-in user (customer) may upload into.
// Everything else (products, categories, banners, reels) is admin-only.
const CUSTOMER_ALLOWED_FOLDERS = ['ssrk/reviews']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const targetFolder = (formData.get('folder') as string) || 'ssrk'
    const type = formData.get('type') as string || 'image'

    if (!file) return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })

    if (CUSTOMER_ALLOWED_FOLDERS.includes(targetFolder)) {
      requireAuth(req) // any logged-in user (customer or admin) can upload review images
    } else {
      requireAdmin(req) // products, categories, banners, reels remain admin-only
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

    let result
    if (type === 'video') {
      result = await uploadVideo(base64, targetFolder)
    } else {
      result = await uploadImage(base64, targetFolder)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
