/**
 * Seed script - creates the admin account and a few starter categories.
 * Run with: node scripts/seed.js
 * Make sure .env.local has MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD set first.
 */
require('dotenv').config({ path: '.env.local' })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ssrkcollections.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

const UserSchema = new mongoose.Schema({
  name: String, email: String, phone: String, password: String,
  role: { type: String, default: 'user' }, isVerified: Boolean, isActive: Boolean,
}, { timestamps: true })

const CategorySchema = new mongoose.Schema({
  name: String, slug: String, description: String, image: String,
  isActive: Boolean, sortOrder: Number,
}, { timestamps: true })

const STARTER_CATEGORIES = [
  { name: 'Sarees', slug: 'sarees', description: 'Elegant sarees for every occasion', sortOrder: 1 },
  { name: 'Kurtis', slug: 'kurtis', description: 'Trendy and comfortable kurtis', sortOrder: 2 },
  { name: 'Lehengas', slug: 'lehengas', description: 'Beautiful lehengas for weddings and festivals', sortOrder: 3 },
  { name: 'Salwar Suits', slug: 'salwar-suits', description: 'Classic salwar suit sets', sortOrder: 4 },
  { name: 'Western Wear', slug: 'western-wear', description: 'Modern western fashion', sortOrder: 5 },
  { name: 'Accessories', slug: 'accessories', description: 'Jewellery and fashion accessories', sortOrder: 6 },
]

async function seed() {
  console.log('🔌 Connecting to MongoDB...')
  await mongoose.connect(MONGODB_URI)
  console.log('✅ Connected')

  const User = mongoose.models.User || mongoose.model('User', UserSchema)
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema)

  // Create admin
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
  if (existingAdmin) {
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`)
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12)
    await User.create({
      name: 'SSRK Admin', email: ADMIN_EMAIL, password: hashedPassword,
      role: 'admin', isVerified: true, isActive: true,
    })
    console.log(`✅ Admin account created`)
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log(`   ⚠️  Please change this password after first login!`)
  }

  // Create starter categories
  for (const cat of STARTER_CATEGORIES) {
    const exists = await Category.findOne({ slug: cat.slug })
    if (!exists) {
      await Category.create({ ...cat, isActive: true })
      console.log(`✅ Category created: ${cat.name}`)
    }
  }

  console.log('\n🎉 Seed complete! You can now login to /admin with the credentials above.')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
