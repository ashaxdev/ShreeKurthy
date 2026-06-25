import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ssrkcollections.com'
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/shop/account', '/shop/cart', '/shop/checkout', '/shop/orders'] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
