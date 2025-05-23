import { useState } from 'react';
import { addAndEditCategory } from '@/services/admin/adminService';
import { useToast } from '@/hooks/ui/toast';


interface CategoryData {
  id?: string;
  _id?: string; // Add this to support both formats
  name: string;
  description?: string;
}

interface Error {
      name: string;
      response: { data?: { message?: string } };
      message: string;
      stack?: string;
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
    } catch (error:unknown) {
       const err = error as Error
      console.log("Error saving category:", err.response.data);
      if(err && err.response && err.response.data && err.response.data.message)
      toast.error( err.response.data.message);
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
