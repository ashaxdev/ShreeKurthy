import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  product: mongoose.Types.ObjectId
  name: string
  image: string
  colorName: string
  colorHex: string
  size: string
  price: number
  mrp: number
  quantity: number
  sku?: string
}

export interface IOrder extends Document {
  orderNumber: string
  user: mongoose.Types.ObjectId
  items: IOrderItem[]
  shippingAddress: {
    name: string
    phone: string
    street: string
    city: string
    state: string
    pincode: string
  }
  paymentMethod: 'razorpay' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  razorpayOrderId?: string
  razorpayPaymentId?: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  subtotal: number
  discount: number
  couponCode?: string
  couponDiscount: number
  shippingCharge: number
  tax: number
  total: number
  notes?: string
  trackingNumber?: string
  courierName?: string
  courierBill?: string
  estimatedDelivery?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  colorName: { type: String },
  colorHex: { type: String },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  sku: { type: String },
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: { type: String },
    trackingNumber: { type: String },
    courierName: { type: String },
    courierBill: { type: String },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
)

OrderSchema.index({ user: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ createdAt: -1 })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
