import mongoose, { Schema, Document } from 'mongoose'

export interface IColorVariant {
  colorName: string
  colorHex: string
  images: string[]
  sizes: {
    size: string
    price: number
    mrp: number
    stock: number
    sku: string
  }[]
}

export interface IProduct extends Document {
  name: string
  slug: string
  description: string
  shortDescription?: string
  category: mongoose.Types.ObjectId
  subcategory?: mongoose.Types.ObjectId
  basePrice: number
  mrp: number
  discount: number
  images: string[]
  colorVariants: IColorVariant[]
  availableSizes: string[]
  tags: string[]
  fabric?: string
  care?: string
  occasion?: string
  brand: string
  isFeatured: boolean
  isNewArrival: boolean
  isBestSeller: boolean
  isActive: boolean
  totalStock: number
  totalSold: number
  averageRating: number
  reviewCount: number
  weight?: number
  dimensions?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  createdAt: Date
  updatedAt: Date
}

const ColorVariantSchema = new Schema<IColorVariant>({
  colorName: { type: String, required: true },
  colorHex: { type: String, required: true },
  images: [{ type: String }],
  sizes: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
      mrp: { type: Number, required: true },
      stock: { type: Number, default: 0 },
      sku: { type: String },
    },
  ],
})

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    basePrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    images: [{ type: String }],
    colorVariants: [ColorVariantSchema],
    availableSizes: [{ type: String }],
    tags: [{ type: String }],
    fabric: { type: String },
    care: { type: String },
    occasion: { type: String },
    brand: { type: String, default: 'SSRK' },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    totalStock: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    weight: { type: Number },
    dimensions: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    seoKeywords: [{ type: String }],
  },
  { timestamps: true }
)

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' })
ProductSchema.index({ category: 1, isActive: 1 })
ProductSchema.index({ isFeatured: 1, isActive: 1 })

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema)
