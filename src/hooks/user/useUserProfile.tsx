// src/hooks/user/useProfileMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, getCloudinarySignature, type IUpdateUserData } from "@/services/user/userService";
import { useToast } from "@/hooks/ui/toast";
import { useDispatch } from "react-redux";
import { userUpdate } from "@/store/slice/user_slice";

export function useProfileMutations() {
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();
  const dispatch = useDispatch();

  // Mutation for uploading image to Cloudinary
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      try {
        // Get Cloudinary signature
        const signatureResponse = await getCloudinarySignature("user-profiles");

        if (!signatureResponse.success) {
          throw new Error("Failed to get upload signature");
        }

        const { data: signatureData } = signatureResponse;

        // Create form data for Cloudinary upload
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", signatureData.timestamp.toString());
        formData.append("signature", signatureData.signature);
        formData.append("folder", signatureData.folder);

        // Upload to Cloudinary
        const uploadResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("Image upload failed");
        }

        const uploadResult = await uploadResponse.json();
        return uploadResult.secure_url;
      } catch (err) {
        console.error("Error uploading image:", err);
        throw err;
      }
    },
    onSuccess: () => {
      info("Image uploaded successfully");
    },
    onError: (err) => {
      error("Failed to upload image. Please try again.");
      console.error("Error uploading image:", err);
    },
  });

  // Mutation for updating user profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: { userId: string; updateData: IUpdateUserData }) =>
      updateUserProfile(data.userId, data.updateData),
    onSuccess: (response) => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["userData"] });
      success("Your profile has been updated successfully");
      dispatch(userUpdate(response));
    },
    onError: (err) => {
      error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    },
  });

  return {
    uploadImageMutation,
    updateProfileMutation,
  };
}