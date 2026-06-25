import mongoose, { Schema, Document } from 'mongoose'

// ---- COUPON ----
export interface ICoupon extends Document {
  code: string
  description: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  userLimit: number
  isActive: boolean
  expiresAt: Date
  applicableCategories?: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    userLimit: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  },
  { timestamps: true }
)

// ---- BANNER ----
export interface IBanner extends Document {
  title: string
  subtitle?: string
  image: string
  mobileImage?: string
  link?: string
  buttonText?: string
  isActive: boolean
  sortOrder: number
  type: 'hero' | 'promo' | 'category'
  createdAt: Date
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    mobileImage: { type: String },
    link: { type: String },
    buttonText: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    type: { type: String, enum: ['hero', 'promo', 'category'], default: 'hero' },
  },
  { timestamps: true }
)

// ---- REEL ----
export interface IReel extends Document {
  title: string
  videoUrl: string
  thumbnail?: string
  productIds: mongoose.Types.ObjectId[]
  isActive: boolean
  views: number
  sortOrder: number
  createdAt: Date
}

const ReelSchema = new Schema<IReel>(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String },
    productIds: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// ---- REVIEW ----
export interface IReview extends Document {
  product: mongoose.Types.ObjectId
  user?: mongoose.Types.ObjectId
  userName: string
  rating: number
  title?: string
  comment: string
  images?: string[]
  isVerified: boolean
  isApproved: boolean
  isAdminCreated: boolean
  helpfulCount: number
  createdAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String },
    comment: { type: String, required: true },
    images: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isAdminCreated: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema)
export const Banner = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema)
export const Reel = mongoose.models.Reel || mongoose.model<IReel>('Reel', ReelSchema)
export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
