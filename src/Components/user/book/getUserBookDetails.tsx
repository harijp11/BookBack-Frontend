"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  DollarSign,
  User,
  ArrowLeft,
  Heart,
  Share2,
  BookOpen,
  FileText,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useBookDetails,
  useRelatedBooks,
  useSendContractRequest,
  useCheckIfRequestExists,
} from "@/hooks/common/useGetBookdetailsMutation";
import MapLocationPicker from "@/common/maping/googleMapIframe";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast"; // Adjust this import if you use a different toast library
import { RootState } from "@/store/store";

const BookView: React.FC = () => {
  const [activeImage, setActiveImage] = useState<string>("");
  const [isHeartActive, setIsHeartActive] = useState<boolean>(false);
  const [showShareTooltip, setShowShareTooltip] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  // Refs for scroll animations
  const headerRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  // Get user from Redux store
  const user = useSelector((state: RootState) => state.user.User);

  // Use our custom query hooks
  const {
    data: book,
    isLoading: loading,
    error: bookError,
  } = useBookDetails(bookId);

  // Check if a request already exists for this book and user
  const { data: requestExistsData, isLoading: checkingRequest } =
    useCheckIfRequestExists(user?._id, bookId);

  // Contract request mutation
  const { mutate: sendContractRequest, isPending: isSubmitting } =
    useSendContractRequest();

  // Fetch related books once we have the category ID from the book
  const categoryId = book?.categoryId?._id;
  const { data: relatedBooks = [], isLoading: relatedLoading } =
    useRelatedBooks(categoryId, bookId);

  // Compute if a request exists
  const existingRequest = requestExistsData?.success || false;
  const requestStatus = existingRequest
    ? requestExistsData?.request?.status
    : null;
  console.log("existing request data", requestExistsData);
  console.log("existing request status", requestStatus);
  // Set active image when book data is loaded
  useEffect(() => {
    if (book?.images && book.images.length > 0) {
      setActiveImage(book.images[0]);
    }
  }, [book]);

  // Initialize selectedLocation with book coordinates if available
  useEffect(() => {
    if (book?.location?.coordinates) {
      const [lng, lat] = book.location.coordinates;
      setSelectedLocation({
        lat,
        lng,
        address: book.locationName || "Book location",
      });
    }
  }, [book]);

  // Handle scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Parallax effect for the header
      if (headerRef.current) {
        headerRef.current.style.backgroundPositionY = `${
          scrollPosition * 0.5
        }px`;
      }
      // Reveal animations when elements come into view
      [descriptionRef, galleryRef, relatedRef].forEach((ref) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isInView = rect.top < window.innerHeight - 100;

          if (isInView) {
            ref.current.classList.add("animate-fade-in", "opacity-100");
            ref.current.classList.remove("opacity-0", "translate-y-8");
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    // Trigger once on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle location selection
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    setShowLocationPicker(false);
  };

  // Navigate to My Requests page
  const navigateToMyRequests = () => {
    navigate("/contract-requests");
  };

  // Handle contract request (for both rent and buy)
  const handleContractRequest = (requestType: "borrow" | "buy") => {
    // Check if user is logged in
    if (!user || !user._id) {
      toast.error("Please login to continue");
      navigate("/auth");
      return;
    }

    // Check if book exists
    if (!book || !book.ownerId?._id) {
      toast.error("Book details not available");
      return;
    }

    // Prepare request payload
    const payload = {
      requesterId: user._id,
      ownerId: book.ownerId._id,
      bookId: bookId || "",
      request_type: requestType,
    };

    // Send the contract request using the mutation
    sendContractRequest(payload, {
      onSuccess: (response) => {
        if (response) {
          toast.success(
            `Your ${
              requestType === "borrow" ? "rental" : "purchase"
            } request has been sent!`
          );
          // You could invalidate the check request query here if needed
          // queryClient.invalidateQueries(['contractRequestExists', user._id, bookId]);
        }
      },
      onError: (error) => {
        toast.error(`Failed to send request. Please try again.`);
        console.error("Contract request error:", error);
      },
    });
  };

  // Error handling for React Query errors
  const error = bookError ? (bookError as Error).message : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-24 bg-gradient-to-r from-amber-100 to-amber-50 rounded-md shadow-lg animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-xl font-serif font-medium text-gray-800 animate-pulse">
            Opening the book...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-xl border border-gray-100 animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-800 mb-3">
              {error}
            </h2>
            <p className="text-gray-600 mb-6">
              Sorry, we couldn&apos;t find the book you&apos;re looking for.
            </p>
          </div>
          <Link
            to="/"
            className="block w-full text-center px-6 py-4 bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-300 font-medium shadow-lg hover:shadow-gray-200/50"
          >
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-serif font-medium text-gray-800">
          No book data available
        </div>
      </div>
    );
  }

  const isForRent =
    book.dealTypeId?.name === "For Rent Only" ||
    book.dealTypeId?.name === "For Rent And Sale";
  const isForSale =
    book.dealTypeId?.name === "For Sale Only" ||
    book.dealTypeId?.name === "For Rent And Sale";
  const hasRentAmount =
    book.rentAmount !== undefined &&
    book.rentAmount !== null &&
    book.rentAmount !== 0;
  
  // Check if the book is available
  const isAvailable = book.status === "Available";

  return (
    <div className="min-h-screen bg-gray-50">
      {showLocationPicker && (
        <MapLocationPicker
          onClose={() => setShowLocationPicker(false)}
          onLocationSelect={handleLocationSelect}
          initialLocation={
            book.location?.coordinates
              ? {
                  lat: book.location.coordinates[1],
                  lng: book.location.coordinates[0],
                  address: book.locationName || "Book location",
                }
              : selectedLocation ?? undefined
          }
        />
      )}

      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 text-gray-700 hover:text-black transition-colors duration-300"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
            <span className="font-medium">Back to Library</span>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHeartActive(!isHeartActive)}
              className={cn(
                "p-2 rounded-full bg-white text-gray-600 shadow-sm border border-gray-100 transition-all duration-300 hover:scale-110",
                isHeartActive && "text-red-500 hover:text-red-600 bg-red-50"
              )}
            >
              <Heart size={20} fill={isHeartActive ? "currentColor" : "none"} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareTooltip(!showShareTooltip)}
                className="p-2 rounded-full bg-white text-gray-600 hover:text-black shadow-sm border border-gray-100 transition-all duration-300 hover:scale-110"
              >
                <Share2 size={20} />
              </button>
              {showShareTooltip && (
                <div className="absolute right-0 mt-2 py-2 px-4 bg-white rounded-md shadow-xl border border-gray-100 z-30 animate-scale-in min-w-[130px]">
                  <div className="flex flex-col gap-2 text-sm">
                    <button className="text-left hover:text-black transition-colors flex items-center gap-2 py-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" />
                      </svg>
                      Facebook
                    </button>
                    <button className="text-left hover:text-black transition-colors flex items-center gap-2 py-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" />
                      </svg>
                      Twitter
                    </button>
                    <button className="text-left hover:text-black transition-colors flex items-center gap-2 py-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                      </svg>
                      Instagram
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Book Images */}
          <div className="lg:w-2/5" ref={galleryRef}>
            <div className="mb-8 bg-white rounded-2xl p-6 shadow-xl transform transition-all duration-300 hover:shadow-2xl border border-gray-100 translate-y-8">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white text-xl font-serif font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {book.name}
                </p>
              </div>
              <img
                src={
                  activeImage ||
                  "https://res.cloudinary.com/dqnfhjzjj/image/upload/v1744744321/books/ayj8ujsdeloxrkoc4fwq.jpg"
                }
                alt={book.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {book.images && book.images.length > 0 && (
              <div className="mt-10 grid grid-cols-4 gap-4">
                {book.images.map((img, index) => (
                  <button
                    key={index}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-105",
                      activeImage === img
                        ? "ring-4 ring-black ring-offset-2 ring-offset-gray-50 scale-95 hover:scale-100"
                        : "opacity-70 hover:opacity-100 shadow-md hover:shadow-lg"
                    )}
                    onClick={() => setActiveImage(img)}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${book.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:w-3/5 space-y-8">
            <div className="opacity-0 translate-y-8" ref={descriptionRef}>
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                <span className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-full transform transition-all duration-300 hover:scale-105 shadow-sm",
                  isAvailable 
                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800" 
                    : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                )}>
                  {book.status || "Unknown Status"}
                </span>
                {book.categoryId?.name && (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-sm font-medium rounded-full transform transition-all duration-300 hover:scale-105 shadow-sm">
                    {book.categoryId.name}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4 tracking-tight">
                {book.name}
              </h1>

              <button
                onClick={() => setShowLocationPicker(true)}
                className="flex items-center gap-2 text-gray-500 mb-8 hover:text-black transition-colors"
              >
                <MapPin size={16} className="text-black" />
                <span>
                  {selectedLocation?.address ||
                    book.locationName ||
                    "Location unavailable"}
                </span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <span className="text-sm text-gray-500 block mb-2">
                    Original Price
                  </span>
                  <span className="text-2xl font-bold text-gray-800 flex items-end gap-1">
                    ₹{book.originalAmount}
                    <span className="text-sm font-normal text-gray-500 ml-1"></span>
                  </span>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-200 p-6 rounded-xl shadow-lg border border-gray-300/50 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <span className="text-sm text-gray-500 block mb-2">
                    Rent Price
                  </span>
                  <span className="text-2xl font-bold text-black flex items-end gap-1">
                    {hasRentAmount ? (
                      <>
                        ₹{book.rentAmount}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          /contract
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-normal text-gray-500">
                        Not available for rent
                      </span>
                    )}
                  </span>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <span className="text-sm text-gray-500 block mb-2">
                    Max Rental
                  </span>
                  <span className="text-2xl font-bold text-gray-800 flex items-end gap-1">
                    {book.maxRentalPeriod}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      days
                    </span>
                  </span>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 mb-10 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-xl font-serif font-semibold text-gray-800 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {book.description ||
                    "No description available for this book."}
                </p>
              </div>

              <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200/30 mb-10 transform transition-all duration-300 hover:shadow-xl shadow-lg">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                  <User size={24} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    {book.ownerId?.Name || "Unknown owner"}
                  </p>
                  <p className="text-gray-500">Book Owner</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
        {!isAvailable ? (
          // Not Available button when status is not "Available"
          <button
            className="w-full bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-not-allowed opacity-80"
            disabled={true}
          >
            <XCircle size={20} />
            Not Available For Deal
          </button>
        ) : user && existingRequest && (requestStatus === "pending" || requestStatus === "accepted") ? (
          <div className="w-full">
            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-blue-200/50 transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1"
              onClick={navigateToMyRequests}
            >
              <FileText size={20} />
              View My Request
            </button>
          </div>
        ) : (
          <>
            {isForRent && (
              <button
                className={cn(
                  "flex-1 px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transform hover:-translate-y-1 transition-all duration-300",
                  hasRentAmount
                    ? "bg-gradient-to-r from-gray-700 to-black text-white hover:shadow-lg hover:shadow-gray-200/50"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed",
                  isSubmitting && "opacity-75 cursor-wait"
                )}
                disabled={!hasRentAmount || isSubmitting || checkingRequest}
                onClick={() => handleContractRequest("borrow")}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <BookOpen size={20} />
                )}
                {hasRentAmount ? "Rent Now" : "Not Available for Rent"}
              </button>
            )}

            {isForSale && (
              <button
                className={cn(
                  "flex-1 bg-white text-gray-800 border-2 border-gray-300 px-6 py-4 rounded-xl font-semibold text-lg hover:border-black hover:text-black transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-1 shadow-md hover:shadow-lg",
                  isSubmitting && "opacity-75 cursor-wait"
                )}
                onClick={() => handleContractRequest("buy")}
                disabled={isSubmitting || checkingRequest}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <DollarSign size={20} />
                )}
                Buy Now
              </button>
            )}
          </>
        )}
      </div>
            </div>
          </div>
        </div>

        {/* Related Books Section */}
        <div className="mt-24 opacity-0 translate-y-8" ref={relatedRef}>
          <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">
            Related Books
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-gray-400 to-black rounded-full mb-10"></div>

          {relatedLoading ? (
            <div className="w-full py-20 flex justify-center">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
                <span className="text-gray-500 font-medium">
                  Finding similar books for you...
                </span>
              </div>
            </div>
          ) : relatedBooks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {relatedBooks.map((relatedBook) => (
                <Link
                  key={relatedBook._id}
                  to={`/book/${relatedBook._id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 h-full flex flex-col border border-gray-100 transform group-hover:-translate-y-2">
                    <div className="aspect-[3/4] bg-gray-50 overflow-hidden relative">
                      <img
                        src={
                          relatedBook.images?.[0] ||
                          "https://images.unsplash.com/photo-1532012197267-da84d127e765?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                        }
                        alt={relatedBook.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                     {relatedBook.dealTypeId?.name && (
                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium">
                          {relatedBook.dealTypeId.name}
                        </div>
                      )}
                      {relatedBook.status && (
                        <div className={cn(
                          "absolute top-4 right-4 px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium",
                          relatedBook.status === "Available" 
                            ? "bg-green-500/80 text-white" 
                            : "bg-red-500/80 text-white"
                        )}>
                          {relatedBook.status}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-serif font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-black transition-colors">
                        {relatedBook.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {relatedBook.description || "No description available."}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-gray-700" />
                          <span className="font-medium">
                            ₹{relatedBook.originalAmount}
                          </span>
                        </div>
                        {relatedBook.categoryId?.name && (
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            {relatedBook.categoryId.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="w-full py-16 flex justify-center">
              <div className="text-center">
                <p className="text-gray-500 font-medium mb-4">No related books found</p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-black/20"
                >
                  <ArrowLeft size={16} />
                  Browse all books
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookView;