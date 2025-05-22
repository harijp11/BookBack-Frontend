"use client"

import type React from "react"
import { useState, type FormEvent } from "react"
import { addAndEditCategory } from "@/services/admin/adminService"
import { useToast } from "@/hooks/ui/toast"
import { AxiosError } from "axios"

interface CategoryData {
  id?: string
  name: string
  description?: string
}



const AddCategoryForm: React.FC = () => {
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const toast = useToast()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const categoryData: CategoryData = {
        name,
        description: description || undefined,
      }

      const response = await addAndEditCategory(categoryData)

      if (response.success) {
        toast.success("Category added successfully!")
        setName("")
        setDescription("")
      }
    } catch (err) {
      if(err instanceof AxiosError)
      toast.error("Failed to add category. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-5">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl text-black text-center mb-8 font-bold">Add New Category</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-black text-sm font-medium">
              Category Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              required
              disabled={loading}
              className="w-full p-3 bg-white text-black border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-black text-sm font-medium">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description"
              rows={4}
              disabled={loading}
              className="w-full p-3 bg-white text-black border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 bg-black text-white font-semibold rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:hover:bg-black transition-colors"
          >
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddCategoryForm