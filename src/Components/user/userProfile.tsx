"use client"

import type React from "react"

import { useState } from "react"
import { useSelector } from "react-redux"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs"
import { Badge } from "@/Components/ui/badge"
import { Button } from "@/Components/ui/button"
import { Separator } from "@/Components/ui/separator"
import { Switch } from "@/Components/ui/switch"
import { Mail, Calendar, Edit, Star, Plus, Repeat, X, Check, Loader2, Upload } from "lucide-react"
import { Phone } from "lucide-react"
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
import { useToast } from "@/hooks/ui/toast"
import { updateUserProfile, type IUpdateUserData, getCloudinarySignature } from "@/services/user/userService"

interface RootState {
  user: {
    User: {
      _id: string
      id: string
      Name: string
      email: string
      profileImage: string
      phoneNumber: string
      role: string
    } | null
  }
}

export default function ProfilePage() {
  const userData = useSelector((state: RootState) => state.user.User)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [formData, setFormData] = useState<IUpdateUserData>({
    Name: "",
    phoneNumber: "",
    profileImage: "",
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const queryClient = useQueryClient()
  const { success, error, info } = useToast()

  // Mutation for uploading image to Cloudinary
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true)
      try {
        // Get Cloudinary signature
        const signatureResponse = await getCloudinarySignature("user-profiles")

        if (!signatureResponse.success) {
          throw new Error("Failed to get upload signature")
        }

        const { data: signatureData } = signatureResponse

        // Create form data for Cloudinary upload
        const formData = new FormData()
        formData.append("file", file)
        formData.append("api_key", signatureData.apiKey)
        formData.append("timestamp", signatureData.timestamp.toString())
        formData.append("signature", signatureData.signature)
        formData.append("folder", signatureData.folder)

        // Upload to Cloudinary
        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Image upload failed")
        }

        const uploadResult = await uploadResponse.json()
        return uploadResult.secure_url
      } finally {
        setIsUploading(false)
      }
    },
    onSuccess: (imageUrl) => {
      setFormData((prev) => ({ ...prev, profileImage: imageUrl }))
      info("Image uploaded successfully")
    },
    onError: (err) => {
      error("Failed to upload image. Please try again.")
      console.error("Error uploading image:", err)
    },
  })

  // Mutation for updating user profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: { userId: string; updateData: IUpdateUserData }) =>
     console.log( updateUserProfile(data.userId, data.updateData)),
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["userData"] })
      success("Your profile has been updated successfully")
      setIsEditDialogOpen(false)
    },
    onError: (err) => {
      error("Failed to update profile. Please try again.")
      console.error("Error updating profile:", err)
    },
  })

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please login to view your profile</p>
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
      phoneNumber: userData.phoneNumber,
      profileImage: userData.profileImage,
    })
    setImagePreview(userData.profileImage)
    setSelectedFile(null)
    setIsEditDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log("File selected:", file ? file.name : "No file selected")
    if (file) {
      // Create a preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        console.log("Preview created successfully")
      }
      reader.readAsDataURL(file)
  
      // Save the file for later upload
      setSelectedFile(file)
      console.log("File saved to state")
    }
  }
  
  const handleImageUpload = async () => {
    console.log("Upload starting, selectedFile:", selectedFile ? selectedFile.name : "No file")
    if (selectedFile) {
      try {
        console.log("Calling uploadImageMutation.mutateAsync")
        const result = await uploadImageMutation.mutateAsync(selectedFile)
        console.log("Upload completed successfully:", result)
      } catch (err) {
        console.error("Error in handleImageUpload:", err)
      }
    } else {
      console.log("No file selected to upload")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      userId: userData._id,
      updateData: formData,
    })
  }

  // Sample book data for demonstration
  const currentlyReading = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      coverUrl: "/placeholder.svg?height=120&width=80",
      dueDate: "May 15, 2025",
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      coverUrl: "/placeholder.svg?height=120&width=80",
      dueDate: "May 20, 2025",
    },
  ]

  const readingHistory = [
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      coverUrl: "/placeholder.svg?height=120&width=80",
      returnedDate: "April 1, 2025",
    },
    {
      id: 4,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      coverUrl: "/placeholder.svg?height=120&width=80",
      returnedDate: "March 15, 2025",
    },
    {
      id: 5,
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      coverUrl: "/placeholder.svg?height=120&width=80",
      returnedDate: "February 28, 2025",
    },
  ]

  const favoriteGenres = ["Fiction", "Mystery", "Science Fiction", "Biography", "Fantasy"]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="bg-white">
            <CardHeader className="relative pb-0">
              <div className="absolute top-0 left-0 right-0 h-32 rounded-t-lg bg-gray-200"></div>
              <div className="relative flex flex-col items-center pt-16">
                <Avatar className="w-24 h-24 border-4 border-white">
                  {userData.profileImage ? (
                    <AvatarImage src={userData.profileImage} alt={userData.Name} />
                  ) : (
                    <AvatarFallback className="text-xl bg-gray-200">{getInitials(userData.Name)}</AvatarFallback>
                  )}
                </Avatar>
                <CardTitle className="mt-4 text-2xl font-bold">{userData.Name}</CardTitle>
                <CardDescription className="text-gray-500">
                  <Badge variant="secondary" className="mt-2">
                    {userData.role}
                  </Badge>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{userData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span className="text-sm">{userData.phoneNumber}</span>
                </div>
              </div>

              <Separator className="my-6 bg-gray-200" />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-gray-500">Books Read</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-gray-500">Currently Borrowed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-gray-500">Favorites</p>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button className="w-full" onClick={handleEditProfile}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Reader Profile</CardTitle>
                <CardDescription>Manage your reading preferences and history</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="current">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="current">Borrowed Books</TabsTrigger>
                    <TabsTrigger value="history">My Books</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  </TabsList>

                  {/* Currently Reading Tab */}
                  <TabsContent value="current" className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Books Currently Borrowed</h3>
                      {currentlyReading.length > 0 ? (
                        <div className="space-y-4">
                          {currentlyReading.map((book) => (
                            <div key={book.id} className="flex gap-4 p-4 rounded-lg bg-gray-50">
                              <div className="flex-shrink-0">
                                <img
                                  src={book.coverUrl || "/placeholder.svg"}
                                  alt={book.title}
                                  className="w-20 h-30 object-cover rounded"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium">{book.title}</h4>
                                <p className="text-sm text-gray-500">{book.author}</p>
                                <div className="mt-2 flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                  <p className="text-xs text-gray-500">Due: {book.dueDate}</p>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <Button variant="outline" size="sm">
                                  Extend
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">You don't have any books currently borrowed.</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Recommended For You</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-4 rounded-lg bg-gray-50">
                            <div className="flex flex-col items-center text-center">
                              <img
                                src={`/placeholder.svg?height=120&width=80`}
                                alt={`Book ${i}`}
                                className="w-20 h-30 object-cover rounded mb-2"
                              />
                              <h4 className="font-medium text-sm">Recommended Book {i}</h4>
                              <p className="text-xs text-gray-500">Author Name</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Reading History Tab */}
                  <TabsContent value="history" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium mb-4">Your Reading History</h3>
                      <div className="space-y-4">
                        {readingHistory.map((book) => (
                          <div key={book.id} className="flex gap-4 p-4 rounded-lg bg-gray-50">
                            <div className="flex-shrink-0">
                              <img
                                src={book.coverUrl || "/placeholder.svg"}
                                alt={book.title}
                                className="w-20 h-30 object-cover rounded"
                              />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium">{book.title}</h4>
                              <p className="text-sm text-gray-500">{book.author}</p>
                              <div className="mt-2 flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                <p className="text-xs text-gray-500">Returned: {book.returnedDate}</p>
                              </div>
                            </div>
                            <div className="flex-shrink-0 flex items-center">
                              <Button variant="ghost" size="sm">
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Repeat className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center">
                        <Button variant="outline">View All History</Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Preferences Tab */}
                  <TabsContent value="preferences" className="mt-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Favorite Genres</h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {favoriteGenres.map((genre) => (
                            <Badge key={genre} variant="secondary">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" /> Add Genre
                        </Button>
                      </div>

                      <Separator className="bg-gray-200" />

                      <div>
                        <h3 className="text-lg font-medium mb-4">Reading Preferences</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-medium">Email Notifications for New Arrivals</h4>
                              <p className="text-xs text-gray-500">
                                Get notified when new books in your favorite genres arrive
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-medium">Due Date Reminders</h4>
                              <p className="text-xs text-gray-500">Receive reminders before your books are due</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <h4 className="text-sm font-medium">Reading Recommendations</h4>
                              <p className="text-xs text-gray-500">
                                Allow us to recommend books based on your reading history
                              </p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-2 mb-4">
                <Avatar className="w-24 h-24 border-4 border-white">
                  {imagePreview ? (
                    <AvatarImage src={imagePreview} alt="Profile preview" />
                  ) : (
                    <AvatarFallback className="text-xl bg-gray-200">
                      {getInitials(formData.Name || userData.Name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="profileImage" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                      Select Profile Picture
                    </Label>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>

                  {selectedFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleImageUpload}
                      disabled={isUploading || !selectedFile}
                      className="mt-1"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Upload to Cloudinary
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Your phone number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateProfileMutation.isPending || isUploading}
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" disabled={updateProfileMutation.isPending || isUploading}>
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
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
    </div>
  )
}

