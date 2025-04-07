import { useState } from 'react';
import { addAndEditCategory } from '@/services/admin/adminService';
import { useToast } from '@/hooks/ui/toast';

interface CategoryData {
  id?: string;
  _id?: string; // Add this to support both formats
  name: string;
  description?: string;
}

interface UseCategoryMutationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useCategoryMutation = (options?: UseCategoryMutationOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const mutate = async (data: CategoryData) => {
    if (!data.name.trim()) {
      toast.error("Category name is required");
      return { success: false };
    }

    setIsLoading(true);
    
    try {
      // Use _id if available, otherwise use id
      const categoryId = data._id || data.id;
      
      const response = await addAndEditCategory({
        id: categoryId,
        name: data.name,
        description: data.description
      });
      console.log("addoeedit",response)
      if (response.success) {
        toast.success(response.message || `Category ${categoryId ? "updated" : "created"} successfully`);
        if (options?.onSuccess) {
          options.onSuccess();
        }
      } else {
        toast.error(response.message || "Failed to save category");
        if (options?.onError) {
          options.onError(new Error(response.message || "Failed to save category"));
        }
      }
      
      return response;
    } catch (error:any) {
      console.log("Error saving category:", error.response.data);
      toast.error( error.response.data.message);
      if (options?.onError) {
        options.onError(error);
      }
      return { success: false, message: "An error occurred" };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    isLoading
  };
};
