import { MetadataRoute } from 'next'
import connectDB from '@/lib/db'
import Product from '@/models/Product'
import Category from '@/models/Category'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssrkcollections.com'

  let productEntries: MetadataRoute.Sitemap = []
  let categoryEntries: MetadataRoute.Sitemap = []

  try {
    await connectDB()
    const [products, categories] = await Promise.all([
      Product.find({ isActive: true }).select('slug updatedAt').lean(),
      Category.find({ isActive: true }).select('slug updatedAt').lean(),
    ])

    productEntries = products.map((p) => ({
      url: `${baseUrl}/shop/products/${p.slug}`,
      lastModified: p.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    categoryEntries = categories.map((c) => ({
      url: `${baseUrl}/shop/category/${c.slug}`,
      lastModified: c.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB not available at build time; sitemap will just contain static routes
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/shop/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/track-order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]

  return [...staticEntries, ...categoryEntries, ...productEntries]
}
