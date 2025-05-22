"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { RootState } from "@/store/store"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import {
  Mail,
  Edit,
  X,
  Check,
  Loader2,
  BookOpen,
  Phone,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  BarChart3,
  Clock,
  Settings,
} from "lucide-react"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/Components/ui/dialog"
import { Alert, AlertDescription } from "@/Components/ui/alert"
import {  SafeParseReturnType } from "zod"
import { AxiosError } from "axios"
import ProfileSidebar from "./profileSideBar"
import type { IUpdateUserData } from "@/services/user/userService"
import { useProfileMutations } from "@/hooks/user/useUserProfile"
import { usePasswordMutation } from "@/hooks/user/useUserPasswords"
import ImageCropper from "@/Components/common/ImageCropper/ImageCropper"
import FileUpload from "@/Components/common/FileUpload/useFileUpload"
import {
  profileValidationSchema,
  passwordValidationSchema,
  type ProfileFormData,
  type PasswordFormData,
} from "@/utils/user/profileValidator"
import { useSelector } from "react-redux"


interface ProfileFormErrors {
  Name?: string
  phoneNumber?: string
  profileImage?: string
  general?: string
}

interface PasswordFormErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  general?: string
}

 

const UserProfile = () => {
  const userData = useSelector((state: RootState) => state.user.User)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    Name: "",
    phoneNumber: "",
    profileImage: "",
  })
  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [cropperImageSrc, setCropperImageSrc] = useState<string>("")
  const [croppedImageBase64, setCroppedImageBase64] = useState<string | null>(null)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({})
  const { uploadImageMutation, updateProfileMutation } = useProfileMutations()
  const passwordMutation = usePasswordMutation()

 

  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [sidebarLeft, setSidebarLeft] = useState(0)

  const handleDragStart = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.closest("a, button, input")) return
    setIsDragging(true)
    setStartX(e.clientX - sidebarLeft)
    document.body.style.userSelect = "none"
  }

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging) return
    const newLeft = e.clientX - startX
    const maxLeft = window.innerWidth <= 640 ? window.innerWidth - 100 : window.innerWidth - 256
    const constrainedLeft = Math.max(0, Math.min(newLeft, maxLeft))
    setSidebarLeft(constrainedLeft)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    document.body.style.userSelect = ""
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDrag)
      window.addEventListener("mouseup", handleDragEnd)
    }
    return () => {
      window.removeEventListener("mousemove", handleDrag)
      window.removeEventListener("mouseup", handleDragEnd)
    }
  }, [isDragging, sidebarLeft, startX])

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-sm p-4 shadow-lg bg-white border-none">
          <CardContent className="flex flex-col items-center space-y-4 p-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <p className="text-center text-gray-700 font-medium text-base">Please login to view your profile</p>
            <Button className="bg-gradient-to-r from-gray-800 to-black text-white hover:from-black hover:to-gray-700 w-full shadow-md">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleEditProfile = () => {
    setFormData({
      Name: userData.Name,
      phoneNumber: userData.phoneNumber || "",
      profileImage: userData.profileImage || "",
    })
    setImagePreview(userData.profileImage)
    setCroppedImageBase64(null)
    setProfileErrors({})
    setIsEditDialogOpen(true)
  }

  const handlePasswordChange = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordErrors({})
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setIsPasswordDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (profileErrors[name as keyof ProfileFormErrors]) {
      setProfileErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    if (passwordErrors[name as keyof PasswordFormErrors]) {
      setPasswordErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const togglePasswordVisibility = (field: "currentPassword" | "newPassword" | "confirmPassword") => {
    switch (field) {
      case "currentPassword":
        setShowCurrentPassword(!showCurrentPassword)
        break
      case "newPassword":
        setShowNewPassword(!showNewPassword)
        break
      case "confirmPassword":
        setShowConfirmPassword(!showConfirmPassword)
        break
    }
  }

  

const parseZodErrors = <T extends object>(
  result: SafeParseReturnType<T, T>
): Record<string, string> => {
  if (!result.success) {
    const errors: Record<string, string> = {}
    result.error.errors.forEach((error) => {
      const path = error.path[0]?.toString() ?? "unknown"
      errors[path] = error.message
    })
    return errors
  }
  return {}
}


  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrors({})
    try {
      const validationResult = passwordValidationSchema.safeParse(passwordData)
      if (!validationResult.success) {
        const errors = parseZodErrors(validationResult)
        setPasswordErrors(errors)
        return
      }
      await passwordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => {
        setIsPasswordDialogOpen(false)
      }, 500)
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.field) {
          setPasswordErrors({
            [error.response.data.field]: error.response.data.message,
          })
        } else {
          setPasswordErrors({
            general: error.response?.data?.message || "Failed to change password. Please try again.",
          })
        }
      }
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setCroppedImageBase64(croppedImage)
    setImagePreview(croppedImage)
  }

  const handleFileSelected = (file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setCropperImageSrc(dataUrl)
        setIsCropperOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async (file: File) => {
    if (croppedImageBase64) {
      const response = await fetch(croppedImageBase64)
      const blob = await response.blob()
      const croppedFile = new File([blob], "profile-image.jpg", { type: "image/jpeg" })
      const imageUrl = await uploadImageMutation.mutateAsync(croppedFile)
      return imageUrl
    } else {
      return await uploadImageMutation.mutateAsync(file)
    }
  }

  const handleImageUploadComplete = (url: string) => {
    setFormData((prev) => ({ ...prev, profileImage: url }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationResult = profileValidationSchema.safeParse(formData)
    if (!validationResult.success) {
      const errors = parseZodErrors(validationResult)
      setProfileErrors(errors)
      return
    }
    updateProfileMutation.mutate(
      {
        updateData: formData as IUpdateUserData,
      },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          setProfileErrors({})
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            if (error.response?.data?.field) {
              setProfileErrors({
                [error.response.data.field]: error.response.data.message,
              })
            } else {
              setProfileErrors({
                general: error.response?.data?.message || "Failed to update profile. Please try again.",
              })
            }
          }
        },
      },
    )
  }


  return (
    <div className="min-h-screen bg-gray-50 flex md:flex-row gap-4">

      {/* Sidebar */}
        <ProfileSidebar sidebarRef={sidebarRef} onDragStart={handleDragStart} />
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 bg-white shadow-md p-4 rounded-lg">
        {/* Profile Card Section */}
        <div className="w-full md:w-2/4 p-4 ">
        <Card className="bg-white rounded-lg shadow-md overflow-hidden w-full ">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-gray-100 shadow-lg ring-2 ring-gray-50 transition-all duration-300 group-hover:ring-gray-200">
                    {userData.profileImage ? (
                      <AvatarImage src={userData.profileImage || "/placeholder.svg"} alt={userData.Name} />
                    ) : (
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-gray-800 to-black text-white font-bold">
                        {getInitials(userData.Name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <Button
                    onClick={handleEditProfile}
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-gray-800 text-white hover:bg-gray-900 h-8 w-8 shadow-md transition-transform duration-300 transform group-hover:scale-110"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <h1 className="mt-4 text-xl font-bold text-gray-900">{userData.Name}</h1>
                <Badge className="mt-2 bg-gray-800 text-white border-none shadow-sm">{userData.role}</Badge>

                <div className="mt-6 space-y-3 w-full">
                  <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Mail className="h-5 w-5 text-gray-700" />
                    <span className="text-sm truncate">{userData.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                    <Phone className="h-5 w-5 text-gray-700" />
                    <span className="text-sm">{userData.phoneNumber || "Not provided"}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordChange}
                  variant="outline"
                  className="mt-6 w-full border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Lock className="mr-2 h-4 w-4" /> Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="w-full md:w-2/3 p-4">
          <Tabs defaultValue="current" className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-white border border-gray-200 p-1 rounded-lg shadow-md">
                <TabsTrigger
                  value="current"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md px-4 py-2 transition-all duration-300"
                >
                  Current Books
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md px-4 py-2 transition-all duration-300"
                >
                  Reading History
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md px-4 py-2 transition-all duration-300"
                >
                  Preferences
                </TabsTrigger>
              </TabsList>
            </div>

            {["current", "history", "preferences"].map((tab, index) => (
              <TabsContent key={index} value={tab}>
                <Card className="border-none shadow-md overflow-hidden">
                  <CardHeader className="bg-gray-50 pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {tab === "current"
                            ? "Current Reading"
                            : tab === "history"
                              ? "Reading History"
                              : "Reading Preferences"}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-sm">
                          {tab === "current"
                            ? "Books you're currently reading or have borrowed"
                            : tab === "history"
                              ? "Your complete reading history and activity"
                              : "Customize your reading experience and preferences"}
                        </CardDescription>
                      </div>
                      {tab === "current" ? (
                        <BarChart3 className="h-5 w-5 text-gray-500" />
                      ) : tab === "history" ? (
                        <Clock className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Settings className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 text-center bg-white">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">
                      {tab === "current"
                        ? "You have no books in your current reading list"
                        : tab === "history"
                          ? "Your reading history is currently empty"
                          : "Set your reading preferences to enhance your experience"}
                    </p>
                    <Button className="bg-gray-800 text-white hover:bg-gray-900 shadow-md transition-all duration-300 hover:shadow-lg">
                      {tab === "current"
                        ? "Browse Library"
                        : tab === "history"
                          ? "View All History"
                          : "Update Preferences"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white border-none shadow-xl rounded-lg">
          <DialogHeader className="bg-gray-50 p-4 rounded-t-lg border-b border-gray-100">
            <DialogTitle className="text-gray-900 text-xl font-bold">Edit Profile</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Update your profile information below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 px-4">
              {profileErrors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{profileErrors.general}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-20 h-20 border-2 border-gray-200 shadow-md">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview || "/placeholder.svg"} alt="Profile preview" />
                  ) : (
                    <AvatarFallback className="text-xl bg-gradient-to-br from-gray-800 to-black text-white font-bold">
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
                />
                {profileErrors.profileImage && <p className="text-sm text-red-500">{profileErrors.profileImage}</p>}
              </div>
              <div className="grid gap-1">
                <Label htmlFor="name" className="text-gray-700 flex items-center justify-between">
                  <span>Name</span>
                  {profileErrors.Name && (
                    <span className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> {profileErrors.Name}
                    </span>
                  )}
                </Label>
                <Input
                  id="name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className={profileErrors.Name ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300"}
                />
                <p className="text-xs text-gray-500">You can update your name here</p>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="phoneNumber" className="text-gray-700 flex items-center justify-between">
                  <span>Phone Number</span>
                  {profileErrors.phoneNumber && (
                    <span className="text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> {profileErrors.phoneNumber}
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
                    profileErrors.phoneNumber ? "border-red-500 focus-visible:ring-red-500" : "border-gray-300"
                  }
                />
                <p className="text-xs text-gray-500">You can update your phone number here</p>
              </div>
            </div>
            <DialogFooter className="bg-gray-50 p-4 rounded-b-lg flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateProfileMutation.isPending}
                className="border-gray-700 text-gray-700 hover:bg-gray-50 px-3 py-1"
              >
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-gray-800 text-white hover:bg-gray-900 shadow-md px-3 py-1"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-xl rounded-lg">
          <DialogHeader className="bg-gray-50 p-4 rounded-t-lg border-b border-gray-100">
            <DialogTitle className="text-gray-900 text-xl font-bold">Change Password</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 py-4 px-4">
              {passwordErrors.general && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordErrors.general}</AlertDescription>
                </Alert>
              )}
              {["currentPassword", "newPassword", "confirmPassword"].map((field, index) => (
                <div key={index} className="grid gap-1">
                  <Label htmlFor={field} className="text-gray-700 flex items-center justify-between">
                    <span>
                      {field === "currentPassword"
                        ? "Current Password"
                        : field === "newPassword"
                          ? "New Password"
                          : "Confirm New Password"}
                    </span>
                    {passwordErrors[field as keyof PasswordFormErrors] && (
                      <span className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" /> {passwordErrors[field as keyof PasswordFormErrors]}
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      id={field}
                      name={field}
                      type={
                        field === "currentPassword"
                          ? showCurrentPassword
                            ? "text"
                            : "password"
                          : field === "newPassword"
                            ? showNewPassword
                              ? "text"
                              : "password"
                            : showConfirmPassword
                              ? "text"
                              : "password"
                      }
                      value={passwordData[field as keyof PasswordFormData]}
                      onChange={handlePasswordInputChange}
                      placeholder={`Enter your ${field === "currentPassword" ? "current" : field === "newPassword" ? "new" : "confirm new"} password`}
                      className={
                        passwordErrors[field as keyof PasswordFormErrors]
                          ? "border-red-500 focus-visible:ring-red-500 pr-10"
                          : "border-gray-300 pr-10"
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility(field as "currentPassword" | "newPassword" | "confirmPassword")
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      tabIndex={-1}
                    >
                      {(field === "currentPassword" && showCurrentPassword) ||
                      (field === "newPassword" && showNewPassword) ||
                      (field === "confirmPassword" && showConfirmPassword) ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {field === "currentPassword"
                      ? "Enter your current password"
                      : field === "newPassword"
                        ? "Enter your new password"
                        : "Please confirm your new password"}
                  </p>
                </div>
              ))}
            </div>
            <DialogFooter className="bg-gray-50 p-4 rounded-b-lg flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
                disabled={passwordMutation.isPending}
                className="border-gray-700 text-gray-700 hover:bg-gray-50 px-3 py-1"
              >
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button
                type="submit"
                disabled={passwordMutation.isPending}
                className="bg-gray-800 text-white hover:bg-gray-900 shadow-md px-3 py-1"
              >
                {passwordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Check className="mr-1 h-4 w-4" /> Change Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-none shadow-xl rounded-lg">
          <DialogHeader className="bg-gray-50 p-4 rounded-t-lg border-b border-gray-100">
            <DialogTitle className="text-gray-900 text-xl font-bold">Crop Profile Image</DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Adjust your profile picture to fit perfectly.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <ImageCropper
              imageSrc={cropperImageSrc}
              isOpen={isCropperOpen}
              onClose={() => setIsCropperOpen(false)}
              onCropComplete={handleCropComplete}
            />
          </div>
          <DialogFooter className="bg-gray-50 p-4 rounded-b-lg flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCropperOpen(false)}
              className="border-gray-700 text-gray-700 hover:bg-gray-50 px-3 py-1"
            >
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
            <Button
              type="button"
              onClick={() => setIsCropperOpen(false)}
              className="bg-gray-800 text-white hover:bg-gray-900 shadow-md px-3 py-1"
            >
              <Check className="mr-1 h-4 w-4" /> Apply Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserProfile
