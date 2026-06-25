import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IAddress {
  name: string
  phone: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface IUser extends Document {
  name: string
  email: string
  phone?: string
  password: string
  role: 'user' | 'admin'
  avatar?: string
  addresses: IAddress[]
  wishlist: mongoose.Types.ObjectId[]
  isVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const AddressSchema = new Schema<IAddress>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
})

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    addresses: [AddressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
