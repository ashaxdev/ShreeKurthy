'use client'
import { useParams } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'

export default function EditProductPage() {
  const { id } = useParams()
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 text-sm mt-1">Update product details, colors and sizes</p>
      </div>
      <ProductForm productId={id as string} />
    </AdminLayout>
  )
}