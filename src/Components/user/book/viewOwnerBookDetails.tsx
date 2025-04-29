"use client"

import type React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { 
   Edit, Clock, DollarSign, Tag, ShoppingBag, 
   MapPin, ChevronLeft, BookOpen, FileText, 
   Calendar, Package, AlertCircle, 
   Clock as ClockIcon, DollarSign as DollarSignIcon,
} from "lucide-react"
import { useBookDetails } from "@/hooks/common/useGetBookdetailsMutation" // Import the hook
import { Card } from "@/Components/ui/card"
import { FormFieldBook } from "@/Components/ui/form"
import { useState } from 'react'
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"

// Types based on your provided interface
export interface Category {
  _id: string;
  name: string;
}

export interface DealType { 
  _id: string;
  name: string;
}

export interface IBook {
  _id: string;
  name: string;
  categoryId: Category;
  dealTypeId: DealType;
  originalAmount: number;
  rentAmount: number;
  description: string;
  maxRentalPeriod: number;
  images: string[];
  ownerId: string;
  status: string;
  isActive: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  locationName: string;
  createdAt: Date;
  updatedAt: Date;
}

// UI Components
const Button = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  variant?: "default" | "outline" | "secondary" | "primary"
  size?: "sm" | "md" | "lg"
  className?: string
  onClick?: () => void
  disabled?: boolean
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50"

  const variantStyles = {
    default: "bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-700 hover:to-gray-900 border border-black",
    outline: "border-2 border-black bg-white text-gray-800 hover:bg-gray-50",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-300 text-gray-800 hover:from-gray-200 hover:to-gray-400 border border-black",
    primary: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border border-black",
  }

  const sizeStyles = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-11 px-6",
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} rounded-md shadow-sm ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

const Loading = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
  </div>
)

const ErrorDisplay = ({ message }: { message: string }) => (
  <div className="bg-red-50 border-2 border-red-500 p-4 rounded-md text-center">
    <p className="text-red-600 font-medium">{message}</p>
  </div>
)

// New Image Gallery Component with wider main image
const ImageGallery = ({ images, bookId }: { images: string[], bookId?: string }) => {
  const defaultImage = "https://m.media-amazon.com/images/I/81PNeyIYVfL._AC_UF1000,1000_QL80_.jpg";
  const allImages = images.length > 0 ? images : [defaultImage];
  
  const [mainImage, setMainImage] = useState(allImages[0]);
  
  return (
    <div className="flex flex-col gap-2 w-60">
      {/* Main image - wider and fixed height */}
      <div className="bg-gradient-to-b from-white to-gray-100 rounded-md p-3 w-full border-2 border-black shadow-md">
        <div className="w-full h-full overflow-hidden">
          <img
            src={mainImage}
            alt="Book cover"
            className="w-full h-full object-fill rounded border border-gray-300"
          />
        </div>
      </div>
      
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((img, index) => (
            <div 
              key={index}
              onClick={() => setMainImage(img)}
              className={`cursor-pointer border-2 p-1 rounded-md w-16 h-16 flex-shrink-0 transition-all duration-200 ${
                mainImage === img ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-500'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-1 text-center">
        <div className="bg-black text-white py-1 rounded font-medium text-xs">
          ID: {bookId ? bookId.substring(0, 8) + '...' : 'No ID'}
        </div>
      </div>
    </div>
  );
};

// Format date helper
const formatDate = (date: Date | string | undefined): string => {
  if (!date) return "N/A";
  
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Main Component
const BookDetailsPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { data: book, isLoading, isError, error } = useBookDetails(bookId);
  const navigate = useNavigate()

  const user = useSelector((state:RootState)=>state.user.User)
  // For navigating back
  const handleBack = () => {
    window.history.back();
  };

  const handleEdit = () => {
    navigate(`/editBook/${user?._id}/${bookId}`)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-5xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center text-black">
            <div className="p-2 rounded-full border-2 border-black mr-3 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
              <ChevronLeft className="w-5 h-5" onClick={handleBack} />
            </div>
            View Book Details
          </h1>
          <div className="flex items-center text-sm text-gray-600 mt-3 border-b-2 border-gray-200 pb-3">
            <span className="hover:text-black cursor-pointer transition-colors duration-200">My Account</span>
            <span className="mx-2">•</span>
            <span className="hover:text-black cursor-pointer transition-colors duration-200">My Books</span>
            <span className="mx-2">•</span>
            <span className="text-black font-medium">View Book</span>
          </div>
        </div>

        <Card className="overflow-hidden">
          {isLoading && <Loading />}
          
          {isError && (
            <ErrorDisplay message={error instanceof Error ? error.message : "Failed to load book details"} />
          )}
          
          {book && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Book Cover with Gallery */}
                <div className="flex-shrink-0">
                  <ImageGallery images={book.images} bookId={book._id} />
                </div>

                {/* Book Details */}
                <div className="flex-1">
                  <FormFieldBook 
                    icon={<BookOpen className="w-5 h-5 text-blue-600" />}
                    label="Name" 
                    value={<div className="font-semibold text-lg">{book.name}</div>}
                  />
                  
                  <FormFieldBook 
                    icon={<FileText className="w-5 h-5 text-gray-600" />}
                    label="Description" 
                    value={<div className="text-gray-700">{book.description}</div>}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFieldBook 
                      icon={<Tag className="w-5 h-5 text-green-600" />}
                      label="Category" 
                      value={
                        <div className="flex items-center">
                          <span className="inline-block bg-green-100 border border-green-300 text-green-800 rounded-full px-3 py-1 font-medium">
                            {book.categoryId.name}
                          </span>
                        </div>
                      }
                    />
                    
                    <FormFieldBook 
                      icon={<DollarSign className="w-5 h-5 text-amber-600" />}
                      label="Original Price" 
                      value={
                        <div className="font-semibold text-amber-700">
                          Rs. {book.originalAmount.toLocaleString()}
                        </div>
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFieldBook 
                      icon={<Calendar className="w-5 h-5 text-purple-600" />}
                      label="Posted Date" 
                      value={
                        <div className="flex items-center">
                          <span className="bg-purple-100 border border-purple-300 text-purple-800 rounded-md px-2 py-1">
                            {formatDate(book.createdAt)}
                          </span>
                        </div>
                      }
                    />
                    
                    <FormFieldBook 
                      icon={<Package className="w-5 h-5 text-orange-600" />}
                      label="Deal Available" 
                      value={
                        <div className="bg-orange-100 border border-orange-300 text-orange-800 rounded-md px-2 py-1 inline-block font-medium">
                          {book.dealTypeId.name}
                        </div>
                      }
                    />
                  </div>
                  
                  <FormFieldBook 
                    icon={<AlertCircle className="w-5 h-5 text-red-600" />}
                    label="Status" 
                    value={
                      <div className="flex items-center">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${book.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className={`font-medium ${book.isActive ? 'text-green-700' : 'text-red-700'}`}>
                          {book.status} {book.isActive ? '(Active)' : '(Inactive)'}
                        </span>
                      </div>
                    }
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFieldBook 
                      icon={<ClockIcon className="w-5 h-5 text-blue-600" />}
                      label="Minimum Rental Days" 
                      value={
                        <div className="flex items-center">
                          <span className="bg-blue-100 border border-blue-300 text-blue-800 rounded-md px-3 py-1 font-medium">
                            {book.maxRentalPeriod} Days
                          </span>
                        </div>
                      }
                    />
                    
                    <FormFieldBook 
                      icon={<DollarSignIcon className="w-5 h-5 text-green-600" />}
                      label="Rental Amount" 
                      value={
                        <div className="bg-green-100 border border-green-300 text-green-800 rounded-md px-3 py-1 inline-block font-medium">
                          Rs. {book.rentAmount.toLocaleString()}
                        </div>
                      }
                    />
                  </div>
                  
                  <FormFieldBook 
                    icon={<MapPin className="w-5 h-5 text-pink-600" />}
                    label="Location" 
                    value={
                      <div className="flex items-center">
                        <span className="font-medium">{book.locationName}</span>
                      </div>
                    }
                  />
                  
                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" size="md" className="flex-1">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Checkout Details
                    </Button>
                    <Button variant="primary" size="md" className="flex-1">
                      <Clock className="w-4 h-4 mr-2" />
                      Rental Details
                    </Button>
                    <Button 
                      variant="default" 
                      size="md" 
                      className="flex-1"
                      onClick={handleEdit}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Book
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default BookDetailsPage