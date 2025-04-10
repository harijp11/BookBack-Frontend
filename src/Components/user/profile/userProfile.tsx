import type React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
  Mail,
  Calendar,
  Edit,
  Star,
  X,
  Check,
  Loader2,
  BookOpen,
  Phone,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/Components/ui/dialog";
import { type IUpdateUserData } from "@/services/user/userService";
import { useProfileMutations } from "@/hooks/user/useUserProfile";
import { usePasswordMutation } from "@/hooks/user/useUserPasswords";
import ImageCropper from "@/Components/common/ImageCropper/ImageCropper";
import FileUpload from "@/Components/common/FileUpload/useFileUpload";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { z } from "zod";

import {
  profileValidationSchema,
  passwordValidationSchema,
  type ProfileFormData,
  type PasswordFormData,
} from "@/utils/user/profileValidator";
import { AxiosError } from "axios";

interface RootState {
  user: {
    User: {
      _id: string;
      id: string;
      Name: string;
      email: string;
      profileImage: string;
      phoneNumber: string;
      role: string;
    } | null;
  };
}

// Define interfaces for form errors
interface ProfileFormErrors {
  Name?: string;
  phoneNumber?: string;
  profileImage?: string;
  general?: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export default function ProfilePage() {
  const userData = useSelector((state: RootState) => state.user.User);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    Name: "",
    phoneNumber: "",
    profileImage: "",
  });

  // Update to use field-specific errors
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // States for image cropper
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string>("");
  const [croppedImageBase64, setCroppedImageBase64] = useState<string | null>(
    null
  );

  // States for password change
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update to use field-specific password errors
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});

  // Import mutations from the custom hook
  const { uploadImageMutation, updateProfileMutation } = useProfileMutations();
  const passwordMutation = usePasswordMutation();

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-white via-blue-50 to-blue-100">
        <Card className="w-full max-w-md p-6 shadow-xl border-none bg-white">
          <CardContent className="flex flex-col items-center space-y-4">
            <BookOpen className="h-12 w-12 text-blue-800" />
            <p className="text-center text-gray-600">
              Please login to view your profile
            </p>
            <Button className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white transition-all duration-300">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleEditProfile = () => {
    setFormData({
      Name: userData.Name,
      phoneNumber: userData.phoneNumber || "",
      profileImage: userData.profileImage || "",
    });
    setImagePreview(userData.profileImage);
    setCroppedImageBase64(null);
    setProfileErrors({});
    setIsEditDialogOpen(true);
  };

  const handlePasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    // Reset password visibility states
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error when user starts typing
    if (profileErrors[name as keyof ProfileFormErrors]) {
      setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePasswordInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error when user starts typing
    if (passwordErrors[name as keyof PasswordFormErrors]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = (
    field: "currentPassword" | "newPassword" | "confirmPassword"
  ) => {
    switch (field) {
      case "currentPassword":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "newPassword":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirmPassword":
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  // Function to parse Zod errors into our error format
  const parseZodErrors = <T extends object>(
    result: z.SafeParseError<T>
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((error) => {
      const path = error.path[0].toString();
      errors[path] = error.message;
    });
    return errors;
  };

  // Handle the password change form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset states
    setPasswordErrors({});
    try {
      // Validate using Zod schema
      const validationResult = passwordValidationSchema.safeParse(passwordData);

      if (!validationResult.success) {
        // Parse and set field-specific errors from Zod
        const errors = parseZodErrors(validationResult);
        setPasswordErrors(errors);
        return;
      }

      // Submit the mutation
      await passwordMutation.mutateAsync({
        userId: userData._id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      // Clear the form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      // Close dialog after a brief delay to show success message
      setTimeout(() => {
        setIsPasswordDialogOpen(false);
      }, 500);
    } catch (error) {
      if(error instanceof AxiosError){
      // Handle backend validation errors or API errors
      if (error.response?.data?.field) {
        // If the API returns a specific field with an error
        setPasswordErrors({
          [error.response.data.field]: error.response.data.message,
        });
      } else {
        // General error
        setPasswordErrors({
          general:
            error.response?.data?.message ||
            "Failed to change password. Please try again.",
        });
      }
    }
    }
  };

  // Handle the cropped image from the cropper component
  const handleCropComplete = (croppedImage: string) => {
    setCroppedImageBase64(croppedImage);
    setImagePreview(croppedImage);
  };

  const handleFileSelected = (file: File | null) => {
    if (file) {
      // Create a file reader to read the file as data URL for cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCropperImageSrc(dataUrl);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (croppedImageBase64) {
      try {
        // Convert base64 to blob for upload
        const response = await fetch(croppedImageBase64);
        const blob = await response.blob();
        const croppedFile = new File([blob], "profile-image.jpg", {
          type: "image/jpeg",
        });

        // Upload the cropped image instead of original file
        const imageUrl = await uploadImageMutation.mutateAsync(croppedFile);
        return imageUrl;
      } catch (err) {
        console.error("Error in handleImageUpload:", err);
        throw err;
      }
    } else {
      // Fall back to original file if no cropped image
      return await uploadImageMutation.mutateAsync(file);
    }
  };

  const handleImageUploadComplete = (url: string) => {
    setFormData((prev) => ({ ...prev, profileImage: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate using Zod schema
    const validationResult = profileValidationSchema.safeParse(formData);

    if (!validationResult.success) {
      // Parse and set field-specific errors from Zod
      const errors = parseZodErrors(validationResult);
      setProfileErrors(errors);
      return;
    }

    updateProfileMutation.mutate(
      {
        userId: userData._id,
        updateData: formData as IUpdateUserData,
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setProfileErrors({});
        },
        onError: (error) => {
         if(error instanceof AxiosError){
          if (error.response?.data?.field) {
            setProfileErrors({
              [error.response.data.field]: error.response.data.message,
            });
          } else {
            setProfileErrors({
              general:
                error.response?.data?.message ||
                "Failed to update profile. Please try again.",
            });
          }
         }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Background */}
        <div className="relative rounded-xl bg-gradient-to-r from-blue-900 to-blue-700 text-white mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-opacity-10 bg-black"></div>
          <div className="absolute -bottom-8 -right-4 z-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-100 rounded-full opacity-20"></div>
          <div className="absolute -top-8 -left-4 z-0 w-24 h-24 bg-gradient-to-tr from-blue-300 to-blue-200 rounded-full opacity-20"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-6 p-8 md:p-10">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white/20 shadow-xl bg-blue-800/40 backdrop-blur-sm">
                {userData.profileImage ? (
                  <AvatarImage
                    src={userData.profileImage}
                    alt={userData.Name}
                  />
                ) : (
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-200 to-blue-100 text-blue-900">
                    {getInitials(userData.Name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold">
                {userData.Name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-500 to-blue-400 text-white border-none hover:from-blue-600 hover:to-blue-500 transition-all duration-200"
                >
                  {userData.role}
                </Badge>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{userData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">
                    {userData.phoneNumber || "Not provided"}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                <Button
                  onClick={handleEditProfile}
                  className="bg-white text-blue-700 hover:bg-blue-50 transition-all duration-300"
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>

                <Button
                  variant="outline"
                  onClick={handlePasswordChange}
                  className="bg-transparent border border-white text-white hover:bg-transparent hover:text-white hover:border-white"
                >
                  <Lock className="mr-2 h-4 w-4" /> Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow hover:translate-y-[-5px] transition-all duration-300">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Books Read</p>
                <p className="text-3xl font-bold text-blue-900">12</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-800" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow hover:translate-y-[-5px] transition-all duration-300">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Currently Borrowed
                </p>
                <p className="text-3xl font-bold text-blue-900">2</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-300 to-blue-200 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-800" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow hover:translate-y-[-5px] transition-all duration-300">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Favorites</p>
                <p className="text-3xl font-bold text-blue-900">5</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-300 flex items-center justify-center">
                <Star className="h-6 w-6 text-blue-800" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white border-none shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-white via-blue-50 to-blue-100 pb-6">
            <CardTitle className="text-black text-2xl">
              Reader Dashboard
            </CardTitle>
            <CardDescription className="text-gray-600">
              Manage your reading activities and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-blue-50">
                <TabsTrigger
                  value="current"
                  className="data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Borrowed Books
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  My Books
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="data-[state=active]:bg-blue-800 data-[state=active]:text-white"
                >
                  Preferences
                </TabsTrigger>
              </TabsList>
              {/* Here you would add the content for each tab */}
              <div className="p-4 text-center text-gray-600">
                <p>Select a tab to view your reading information</p>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] bg-white border-none shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-white via-blue-50 to-blue-100 p-6 rounded-t-lg">
            <DialogTitle className="text-black text-2xl">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-6 px-6">
              {/* Display general error if exists */}
              {profileErrors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{profileErrors.general}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center gap-2 mb-4">
                <Avatar className="w-24 h-24 border-4 border-blue-100 shadow-lg">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} alt="Profile preview" />
                  ) : (
                    <AvatarFallback className="text-xl bg-gradient-to-br from-blue-200 to-blue-100 text-blue-900">
                      {getInitials(formData.Name || userData.Name)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <FileUpload
                  id="profileImage"
                  label="Select Profile Picture"
                  accept="image/*"
                  previewUrl={imagePreview}
                  uploadFunction={handleImageUpload}
                  onFileSelected={handleFileSelected}
                  onUploadComplete={handleImageUploadComplete}
                  className="mt-2"
                />
                {/* Display profile image error if exists */}
                {profileErrors.profileImage && (
                  <p className="text-sm text-red-500 mt-1">
                    {profileErrors.profileImage}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="name"
                  className="flex items-center justify-between text-gray-700"
                >
                  <span>Name</span>
                  {profileErrors.Name && (
                    <span className="text-xs font-normal text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {profileErrors.Name}
                    </span>
                  )}
                </Label>
                <Input
                  id="name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className={
                    profileErrors.Name
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-blue-200 focus-visible:ring-blue-500"
                  }
                />
                {/* Tooltip for name requirements */}
                <p className="text-xs text-gray-500">
                  You Can Update Your Name Here
                </p>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="phoneNumber"
                  className="flex items-center justify-between text-gray-700"
                >
                  <span>Phone Number</span>
                  {profileErrors.phoneNumber && (
                    <span className="text-xs font-normal text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {profileErrors.phoneNumber}
                    </span>
                  )}
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                  className={
                    profileErrors.phoneNumber
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-blue-200 focus-visible:ring-blue-500"
                  }
                />
                <p className="text-xs text-gray-500">
                  You Can Update Your Phone Number Here
                </p>
              </div>
            </div>
            <DialogFooter className="bg-gray-50 p-4 rounded-b-lg">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateProfileMutation.isPending}
                className="border-blue-800 text-blue-800 hover:bg-blue-50"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white transition-all duration-300"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-white via-blue-50 to-blue-100 p-6 rounded-t-lg">
            <DialogTitle className="text-black text-2xl">
              Change Password
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter Your Current Password And Choose a New Secure Password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 py-6 px-6">
              {/* Show general error at the top if it exists */}
              {passwordErrors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordErrors.general}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label
                  htmlFor="currentPassword"
                  className="flex items-center justify-between text-gray-700"
                >
                  <span>Current Password</span>
                  {passwordErrors.currentPassword && (
                    <span className="text-xs font-normal text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {passwordErrors.currentPassword}
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your current password"
                    className={
                      passwordErrors.currentPassword
                        ? "border-red-500 focus-visible:ring-red-500 pr-10"
                        : "border-blue-200 focus-visible:ring-blue-500 pr-10"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="newPassword"
                  className="flex items-center justify-between text-gray-700"
                >
                  <span>New Password</span>
                  {passwordErrors.newPassword && (
                    <span className="text-xs font-normal text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {passwordErrors.newPassword}
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Enter your new password"
                    className={
                      passwordErrors.newPassword
                        ? "border-red-500 focus-visible:ring-red-500 pr-10"
                        : "border-blue-200 focus-visible:ring-blue-500 pr-10"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Enter Your New Password Here
                </p>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="confirmPassword"
                  className="flex items-center justify-between text-gray-700"
                >
                  <span>Confirm New Password</span>
                  {passwordErrors.confirmPassword && (
                    <span className="text-xs font-normal text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {passwordErrors.confirmPassword}
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm your new password"
                    className={
                      passwordErrors.confirmPassword
                        ? "border-red-500 focus-visible:ring-red-500 pr-10"
                        : "border-blue-200 focus-visible:ring-blue-500 pr-10"
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Please confirm your new password
                </p>
              </div>
            </div>
            <DialogFooter className="bg-gray-50 p-4 rounded-b-lg">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={passwordMutation.isPending}
                className="border-blue-800 text-blue-800 hover:bg-blue-50"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={passwordMutation.isPending}
                className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white transition-all duration-300"
              >
                {passwordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Change Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Dialog */}
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="sm:max-w-[700px] bg-white border-none shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-white via-blue-50 to-blue-100 p-6 rounded-t-lg">
            <DialogTitle className="text-black text-2xl">
              Crop Profile Image
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Adjust your profile picture to fit perfectly.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            jsx
            {/* Image Cropper Dialog */}
            {isCropperOpen && (
              <ImageCropper
                isOpen={isCropperOpen}
                onClose={() => setIsCropperOpen(false)}
                imageSrc={cropperImageSrc}
                onCropComplete={handleCropComplete}
              />
            )}
            Alternatively, you can modify your ImageCropper component to align
            with how you're currently using it. Here's a simplified version that
            would work with your current implementation: Fixed ImageCropper
            Component Code
          </div>
          <DialogFooter className="bg-gray-50 p-4 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCropperOpen(false)}
              className="border-blue-800 text-blue-800 hover:bg-blue-50"
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setIsCropperOpen(false)}
              className="bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white transition-all duration-300"
            >
              <Check className="mr-2 h-4 w-4" /> Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
