'use client'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new product with color and size variants</p>
      </div>
      <ProductForm />
    </AdminLayout>
  )
}