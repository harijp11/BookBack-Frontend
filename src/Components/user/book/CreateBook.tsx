import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, X, Upload, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {z} from 'zod';

// UI components
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/Components/ui/form";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { useToast } from "@/hooks/ui/toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";

// Custom components
import { LocationPicker } from "@/common/maping/LocationPickerComponent";
import ImageCropper from "@/Components/common/ImageCropper/ImageCropper";

// Queries and mutations hook
import { useBookQueries } from "@/hooks/common/useBookMutation";

// Form handling and validation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "@/utils/bookForm_validator";
import { AxiosError } from "axios";

// Form type inference
type FormValues = z.infer<typeof formSchema>;

// Interfaces
interface Category {
  _id: string; 
  name: string;
}

interface DealType {
  _id: string;
  name: string;
}


interface BookFormPageProps {
  mode: 'create' | 'update';
}

function BookFormPage({ mode }: BookFormPageProps) {
  const { userId, bookId } = useParams<{ userId: string; bookId?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  // const [isGeocoding, setIsGeocoding] = useState(false);
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isFormReady, setIsFormReady] = useState(mode === 'create');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const { success, warning, error } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      dealTypeId: "",
      originalAmount: 0,
      rentAmount: 0,
      description: "",
      maxRentalPeriod: 30,
      locationName: "",
      latitude: 0,
      longitude: 0,
      latitude2: undefined,
      longitude2: undefined,
    },
  });

  // Use queries and mutations
  const {
    categoriesQuery,
    dealTypesQuery,
    createBookMutation,
    updateBookMutation,
    getCloudinarySignatureMutation,
    useBookByIdQuery,
  } = useBookQueries();

  // Fetch book data for update mode
  const bookQuery = useBookByIdQuery(bookId ?? "", userId ?? "", {
    enabled: mode === "update" && !!bookId && !!userId,
  });

  // Populate form with book data when all queries are ready
  useEffect(() => {
    if (
      mode === 'update' &&
      bookQuery?.data &&
      categoriesQuery.data &&
      dealTypesQuery.data
    ) {
      const book = bookQuery.data;
      console.log("Populating form with book data:", book);
      // Validate categoryId and dealTypeId
      const categoryExists = categoriesQuery.data.some(
        (cat) => cat._id === book.categoryId._id
      );
      const dealTypeExists = dealTypesQuery.data.some(
        (deal) => deal._id === book.dealTypeId._id
      );
      if (!categoryExists) {
        console.warn(`Category ID ${book.categoryId._id} not found in categories`);
        warning("Category not found. Please select a new category.");
      }
      if (!dealTypeExists) {
        console.warn(`Deal Type ID ${book.dealTypeId._id} not found in deal types`);
        warning("Deal Type not found. Please select a new deal type.");
      }
      form.reset({
        name: book.name,
        categoryId: categoryExists && book.categoryId._id ? book.categoryId._id : "",
        dealTypeId: dealTypeExists && book.dealTypeId._id ? book.dealTypeId._id : "",
        originalAmount: book.originalAmount,
        rentAmount: book.rentAmount,
        description: book.description || "",
        maxRentalPeriod: book.maxRentalPeriod,
        locationName: book.locationName,
        latitude: book.location.coordinates[1],
        longitude: book.location.coordinates[0],
        latitude2: undefined,
        longitude2: undefined,
      }, { keepDefaultValues: false });
      setImages(book.images || []);
      setIsFormReady(true);
      console.log("Book images:", book.images);
    }
  }, [bookQuery?.data, categoriesQuery.data, dealTypesQuery.data, mode, form]);

  // Debug form values and errors
  useEffect(() => {
    console.log("Form values:", {
      categoryId: form.getValues("categoryId"),
      dealTypeId: form.getValues("dealTypeId"),
    });
    console.log("Form errors:", form.formState.errors);
  }, [form, isFormReady]);

  // Handle location change from LocationPicker
  const handleLocationChange = useCallback(
    async (
      locationName: string,
      point1: [number, number],
      // point2: [number, number] | null
    ) => {
      const [latitude, longitude] = point1;
      form.setValue("locationName", locationName);
      form.setValue("latitude", latitude);
      form.setValue("longitude", longitude);
      form.setValue("latitude2", undefined);
      form.setValue("longitude2", undefined);
    },
    [form]
  );

  // Handle toggle live location
  const handleToggleLiveLocation = useCallback((enabled: boolean) => {
    setLiveLocationEnabled(enabled);
  }, []);

  // Image handling functions
  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        const newFiles = Array.from(event.target.files);
        setPendingFiles(newFiles);
        if (newFiles.length > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            setCurrentImageSrc(reader.result as string);
            setIsCropperOpen(true);
          };
          reader.readAsDataURL(newFiles[0]);
        }
      }
    },
    []
  );

  const handleCropComplete = useCallback((croppedImageBase64: string) => {
    fetch(croppedImageBase64)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], `cropped_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setImageFiles((prev) => [...prev, file]);
        const remainingFiles = pendingFiles.slice(1);
        setPendingFiles(remainingFiles);

        if (remainingFiles.length > 0) {
          const reader = new FileReader();
          reader.onload = () => {
            setCurrentImageSrc(reader.result as string);
            setIsCropperOpen(true);
          };
          reader.readAsDataURL(remainingFiles[0]);
        } else {
          setIsCropperOpen(false);
        }
      });
  }, [pendingFiles]);

  const handleCropCancel = useCallback(() => {
    setPendingFiles((prev) => prev.slice(1));
    if (pendingFiles.length > 1) {
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImageSrc(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(pendingFiles[1]);
    } else {
      setIsCropperOpen(false);
    }
  }, [pendingFiles]);

  const removeFile = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const uploadImagesToCloudinary = useCallback(
    async (files: File[]): Promise<string[]> => {
      if (files.length === 0) {
        return [];
      }
      setIsUploading(true);
      setUploadProgress(0);
      const uploadedUrls: string[] = [];
      try {
        for (let i = 0; i < files.length; i++) {
          const signatureData = await getCloudinarySignatureMutation.mutateAsync();
          if (
            !signatureData ||
            !signatureData.signature ||
            !signatureData.timestamp ||
            !signatureData.apiKey ||
            !signatureData.cloudName
          ) {
            throw new Error("Invalid signature data received from server");
          }
          const formData = new FormData();
          formData.append("file", files[i]);
          formData.append("signature", signatureData.signature.toString());
          formData.append("timestamp", signatureData.timestamp.toString());
          formData.append("api_key", signatureData.apiKey);
          if (signatureData.folder) {
            formData.append("folder", signatureData.folder);
          }
          const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          if (!uploadResponse.ok) {
            throw new Error(
              `Failed to upload to Cloudinary: ${uploadResponse.status} ${uploadResponse.statusText}`
            );
          }
          const data = await uploadResponse.json();
          uploadedUrls.push(data.secure_url);
          const progress = Math.round(((i + 1) / files.length) * 100);
          setUploadProgress(progress);
        }
        success(`${uploadedUrls.length} images uploaded successfully.`);
        return uploadedUrls;
      } catch (err) {
        console.error("Error uploading images:", err);
        error("Failed to upload images. Please try again.");
        throw err;
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [getCloudinarySignatureMutation, success, error]
  );

  // Form submission
  const onSubmit = useCallback(
    async (values: FormValues) => {
      console.log("Form submitted with values:", values);
      if (!userId) {
        warning("User ID is missing. Please check your URL.");
        return;
      }
      setIsSubmitting(true);
      try {
        let imageUrls = [...images];
        if (imageFiles.length > 0) {
          const uploadedUrls = await uploadImagesToCloudinary(imageFiles);
          imageUrls = [...imageUrls, ...uploadedUrls];
        }
        if (imageUrls.length === 0 && mode === 'create') {
          warning("Please add at least one image");
          return;
        }
        
        const locationData: { type: 'Point'; coordinates: [number, number] } = {
          type: 'Point',
          coordinates: [values.longitude, values.latitude]
        };

        const bookData = {
          name: values.name,
          categoryId: values.categoryId,
          dealTypeId: values.dealTypeId,
          originalAmount: Number(values.originalAmount),
          rentAmount: Number(values.rentAmount),
          description: values.description || "",
          maxRentalPeriod: Number(values.maxRentalPeriod),
          images: imageUrls,
          ownerId: userId,
          location: locationData,
          locationName: values.locationName,
        };
        console.log("Submitting book data:", bookData);

        if (mode === 'create') {
          await createBookMutation.mutateAsync(bookData);
          success("Book has been created successfully");
        } else {
          if (!bookId) {
            throw new Error("Book ID is missing for update operation");
          }
          await updateBookMutation.mutateAsync({ bookId, bookData });
          success("Book has been updated successfully");
        }

        form.reset();
        setImages([]);
        setImageFiles([]);
        setTimeout(() => navigate(`/Books/${userId}`), 2000);
      } catch (err) {
        if(err instanceof AxiosError){
        console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} book:`, err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          `Failed to ${mode === 'create' ? 'create' : 'update'} book`;
        error(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      imageFiles,
      images,
      userId,
      bookId,
      mode,
      form,
      createBookMutation,
      updateBookMutation,
      uploadImagesToCloudinary,
      success,
      warning,
      error,
      navigate,
    ]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate(`/Books/${userId}`);
  }, [navigate, userId]);

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (value === "location") {
      setIsLocationModalOpen(true);
    } else if (value === "images") {
      setIsImagesModalOpen(true);
    }
  }, []);

  // Handle Done buttons for modals
  const handleImagesDone = useCallback(() => {
    setIsImagesModalOpen(false);
  }, []);

  const handleLocationDone = useCallback(() => {
    setIsLocationModalOpen(false);
  }, []);

  // Handle loading and error states
  if (categoriesQuery.isLoading || dealTypesQuery.isLoading || (mode === 'update' && bookQuery?.isLoading)) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <p className="ml-2 text-black font-medium">Loading...</p>
      </div>
    );
  }

  if (categoriesQuery.isError || dealTypesQuery.isError || (mode === 'update' && bookQuery?.isError)) {
    error("Failed to load required data. Please reload the page.");
    return null;
  }

  const categories: Category[] = categoriesQuery.data || [];
  const dealTypes: DealType[] = dealTypesQuery.data || [];

  if (mode === 'update' && !isFormReady) {
    return (
      <div className="container py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <p className="ml-2 text-black font-medium">Loading form...</p>
      </div>
    );
  }

  return (
    <div className="container py-10 bg-white text-black">
      <Card className="max-w-3xl mx-auto border-black">
        <CardHeader className="border-b border-black">
          <CardTitle className="text-2xl font-bold">
            {mode === 'create' ? 'Add New Book' : 'Edit Book'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {mode === 'create' ? 'Create a new book listing for rental' : 'Update the book listing details'}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => {
            console.log("handleSubmit triggered");
            onSubmit(values);
          })}>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="details">Book Details</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>

              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black font-medium">
                          Book Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter book name"
                            {...field}
                            className="border-black focus:ring-black focus:border-black bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage className="text-black" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black font-medium">
                          Category
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                          disabled={categories.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="border-black focus:ring-black focus:border-black bg-white text-black">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category._id}
                                value={category._id}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-black" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dealTypeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black font-medium">
                          Deal Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                          disabled={dealTypes.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger className="border-black focus:ring-black focus:border-black bg-white text-black">
                              <SelectValue placeholder="Select a deal type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dealTypes.map((dealType) => (
                              <SelectItem
                                key={dealType._id}
                                value={dealType._id}
                              >
                                {dealType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-black" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="originalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black font-medium">
                          Original Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="border-black focus:ring-black focus:border-black bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage className="text-black" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black font-medium">
                          Rental Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="border-black focus:ring-black focus:border-black bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage className="text-black" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxRentalPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black font-medium">
                          Max Rental Period (days)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="30"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="border-black focus:ring-black focus:border-black bg-white text-black"
                          />
                        </FormControl>
                        <FormMessage className="text-black" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="locationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black font-medium">
                          Location
                        </FormLabel>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Select location"
                              {...field}
                              readOnly
                              onClick={() => {
                                setActiveTab("location");
                                setIsLocationModalOpen(true);
                              }}
                              className="border-black focus:ring-black focus:border-black bg-white text-black cursor-pointer"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setActiveTab("location");
                                setIsLocationModalOpen(true);
                              }}
                              className="border-black"
                            >
                              <MapPin className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-black" />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel className="text-black font-medium">
                      Images
                    </FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Upload images"
                          value={
                            imageFiles.length > 0
                              ? `${imageFiles.length} file(s) selected`
                              : images.length > 0
                              ? `${images.length} image(s) selected`
                              : ""
                          }
                          readOnly
                          onClick={() => {
                            setActiveTab("images");
                            setIsImagesModalOpen(true);
                          }}
                          className="border-black focus:ring-black focus:border-black bg-white text-black cursor-pointer"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setActiveTab("images");
                            setIsImagesModalOpen(true);
                          }}
                          className="border-black"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-black" />
                  </FormItem>
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black font-medium">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter book description"
                          {...field}
                          value={field.value ?? ""}
                          className="min-h-32 border-black focus:ring-black focus:border-black bg-white text-black"
                        />
                      </FormControl>
                      <FormMessage className="text-black" />
                    </FormItem>
                  )}
                />
              </CardContent>

              <Dialog
                open={isLocationModalOpen}
                onOpenChange={setIsLocationModalOpen}
              >
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] border-black overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-black">
                      Set Book Location
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 p-4">
                    <p className="text-gray-600">
                      Select a location for your book listing.
                    </p>
                     <FormField
                      control={form.control}
                      name="locationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black font-medium">
                            Location Name
                          </FormLabel> 
                           <FormControl>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Enter location name"
                                {...field}
                                // disabled={isGeocoding}
                                className="border-black focus:ring-black focus:border-black bg-white text-black"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="border-black"
                                // disabled={isGeocoding}
                              >
                                {/* {isGeocoding ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Get Current
                                  </>
                                )} */}
                              </Button>
                            </div>
                          </FormControl> 
                           <FormMessage className="text-black" />
                        </FormItem>
                      )}
                    /> 
                    <div className="border border-black rounded-md p-4 flex-1">
                      <LocationPicker
                        onLocationChange={handleLocationChange}
                        isModalVisible={isLocationModalOpen}
                        liveLocationEnabled={liveLocationEnabled}
                        onToggleLiveLocation={handleToggleLiveLocation}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={handleLocationDone}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isImagesModalOpen}
                onOpenChange={setIsImagesModalOpen}
              >
                <DialogContent className="sm:max-w-[600px] border-black">
                  <DialogHeader>
                    <DialogTitle className="text-black">
                      {mode === 'create' ? 'Add Book Images' : 'Edit Book Images'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Upload images for your book.
                    </p>
                    <div className="space-y-3">
                      <h4 className="font-medium">Upload Images</h4>
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={handleUploadClick}
                          variant="outline"
                          className="border-black text-black"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Files
                        </Button>
                        <p className="text-gray-600 text-sm">
                          {imageFiles.length > 0
                            ? `${imageFiles.length} file(s) selected`
                            : "No files selected"}
                        </p>
                      </div>
                      {isUploading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-black h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                      {imageFiles.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                          {imageFiles.map((file, index) => (
                            <div
                              key={index}
                              className="relative border border-black rounded-md p-2"
                            >
                              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index}`}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <p className="truncate text-sm mt-2">
                                {file.name}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 border border-black"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {images.length > 0 && (
                      <div className="border-t border-gray-300 pt-4 space-y-3">
                        <h4 className="font-medium">Existing Images</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {images.map((url, index) => (
                            <div
                              key={index}
                              className="relative border border-black rounded-md p-2"
                            >
                              <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                                <img
                                  src={url}
                                  alt={`Book image ${index}`}
                                  className="max-h-full max-w-full object-contain"
                                  onError={() =>
                                    console.error(`Failed to load image: ${url}`)
                                  }
                                />
                              </div>
                              <p className="truncate text-sm mt-2">
                                Image {index + 1}
                              </p>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 border border-black"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={handleImagesDone}
                      className="bg-black text-white hover:bg-gray-800"
                    >
                      Done
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <CardFooter className="flex justify-between space-x-4 pt-6 border-t border-black">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-black text-black"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    mode === 'create' ? 'Create Book' : 'Update Book'
                  )}
                </Button>
              </CardFooter>
            </Tabs>
          </form>
        </Form>
      </Card>

      <ImageCropper
        isOpen={isCropperOpen}
        onClose={handleCropCancel}
        imageSrc={currentImageSrc}
        onCropComplete={handleCropComplete}
        title="Crop Book Image"
      />
    </div>
  );
}

export default BookFormPage;