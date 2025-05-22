import { useState } from 'react';
import { addAndEditDealType } from '@/services/admin/adminService';
import { useToast } from '@/hooks/ui/toast';

interface DealTypeData {
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

interface UseDealTypeMutationOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useDealTypeMutation = (options?: UseDealTypeMutationOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const mutate = async (data: DealTypeData) => {
    if (!data.name.trim()) {
      toast.error("Deal type name is required");
      return { success: false };
    }

    setIsLoading(true);
    
    try {
      // Use _id if available, otherwise use id
      const dealTypeId = data._id || data.id;
      
      const response = await addAndEditDealType({
        id: dealTypeId,
        name: data.name,
        description: data.description
      });
      
      if (response.success) {
        toast.success(response.message || `Deal type ${dealTypeId ? "updated" : "created"} successfully`);
        if (options?.onSuccess) {
          options.onSuccess();
        }
      } else {
        toast.error(response.message || "Failed to save deal type");
        if (options?.onError) {
          options.onError(new Error(response.message || "Failed to save deal type"));
        }
      }
      
      return response;
    } catch (error) {
      const err  =  error as Error

      console.log("Error saving deal type:", err.response?.data);
      toast.error(err.response?.data?.message || "An error occurred");
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