"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  DollarSign,
  User,
  ArrowLeft,
  Share2,
  BookOpen,
  FileText,
  XCircle,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useBookDetails,
  useRelatedBooks,
  useSendContractRequest,
  useCheckIfRequestExists,
} from "@/hooks/common/useGetBookdetailsMutation";
import { useAddUserNotify } from "@/hooks/common/useNotifyUserMutation";
import MapLocationPicker from "@/common/maping/googleMapIframe";
import { useSelector } from "react-redux";
import { useToast } from "@/hooks/ui/toast";
import { RootState } from "@/store/store";

const BookView: React.FC = () => {
  const [activeImage, setActiveImage] = useState<string>("");
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
  const toast = useToast();
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

  if (!bookId) {
    throw new Error("Book ID is required");
  }

  // Check if a request already exists for this book and user, only enabled if user exists
  const {
    data: requestExistsData,
    isLoading: checkingRequest,
    refetch,
  } = useCheckIfRequestExists(user?._id ?? "", bookId);

  // Contract request mutation
  const { mutate: sendContractRequest, isPending: isSubmitting } =
    useSendContractRequest();

  // Notification mutation
  const { mutate: addNotify, isPending: isNotifying } = useAddUserNotify(
    user?._id || ""
  );

  // Fetch related books once we have the category ID from the book
  const categoryId = book?.categoryId?._id;
  const { data: relatedBooks = [], isLoading: relatedLoading } =
    useRelatedBooks(categoryId, bookId);

  // Compute if a request exists
  let requestStatus = null;
  const existingRequest = requestExistsData?.success || false;
  if (requestExistsData && "request" in requestExistsData) {
    requestStatus = existingRequest ? requestExistsData?.request?.status : null;
  }

  // Check if user is in notifyUsers array
  const isUserNotified = user?._id && book?.notifyUsers?.includes(user._id);

  // Set active image when book data is loaded
  useEffect(() => {
    if (book?.images && book.images.length > 0) {
      setActiveImage(book.images[0]);
    }
  }, [book]);

 
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      if (headerRef.current) {
        headerRef.current.style.backgroundPositionY = `${
          scrollPosition * 0.5
        }px`;
      }
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

    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    setShowLocationPicker(false);
  };

  const navigateToMyRequests = () => {
    navigate("/contract-requests");
  };

  const handleContractRequest = async (requestType: "borrow" | "buy") => {
    if (!user || !user?._id) {
      toast.error("Please login to continue");
      navigate("/auth");
      return;
    }

    if (!book || !book.ownerId?._id) {
      toast.error("Book details not available");
      return;
    }

    try {
      const { data: refetchedData } = await refetch();
      if (
        refetchedData?.success &&
        refetchedData?.request?.status !== "rejected"
      ) {
        toast.info("You've already sent a request for this book.");
        return;
      }
    } catch (error) {
      toast.error("Failed to verify request status. Please try again.");
      console.error("Refetch error:", error);
      return;
    }

    const payload = {
      requesterId: user?._id,
      ownerId: book.ownerId?._id,
      bookId: bookId || "",
      request_type: requestType,
    };

    interface Error {
      name: string;
      response: { data?: { message?: string } };
      message: string;
      stack?: string;
    }
    // Send the contract request using the mutation
    sendContractRequest(payload, {
      onSuccess: (response) => {
        if (response) {
          toast.success(
            `Your ${
              requestType === "borrow" ? "rental" : "purchase"
            } request has been sent!`
          );
        }
      },
      onError: (error: unknown) => {
        const err = error as Error;

        if (err?.response?.data?.message === "Book not Available now") {
          toast.info(err.response.data.message);
        }

        console.log("Contract request error:", err);
      },
    });
  };

  // Updated handleNotifyMe function for BookView component
  const [localIsUserNotified, setLocalIsUserNotified] =
    useState(isUserNotified);

  useEffect(() => {
    setLocalIsUserNotified(user?._id && book?.notifyUsers?.includes(user._id));
  }, [book, user]);

  const handleNotifyMe = () => {
    if (!user || !user?._id) {
      toast.error("Please login to continue");
      navigate("/auth");
      return;
    }
    if (!bookId) {
      toast.error("Book ID not available");
      return;
    }
    addNotify(bookId, {
      onSuccess: (data) => {
        setLocalIsUserNotified(data.success);
      },
      onError: (error) => {
        console.error("Failed to set notification:", error);
      },
    });
  };

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
              Sorry, we couldn't find the book you're looking for.
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

  // Handle share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/book/${bookId}`;
    const shareData = {
      title: book.name,
      text: `Check out this book: ${book.name}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      toast.error("Failed to share the book link");
      console.error("Share error:", err);
    }
    setShowShareTooltip(false);
  };

  // Handle copy link
  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/book/${bookId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy the link");
      console.error("Copy link error:", err);
    }
    setShowShareTooltip(false);
  };

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
                    <button
                      onClick={handleShare}
                      className="text-left hover:text-black transition-colors flex items-center gap-2 py-1"
                    >
                      <Share2 size={16} />
                      Share via...
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="text-left hover:text-black transition-colors flex items-center gap-2 py-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy Link
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
                <span
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full transform transition-all duration-300 hover:scale-105 shadow-sm",
                    isAvailable
                      ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                      : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                  )}
                >
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

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <span className="text-sm text-gray-500 block mb-2">
                    Number of Pages
                  </span>
                  <span className="text-2xl font-bold text-gray-800 flex items-end gap-1">
                    {book.numberOfPages}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      pages
                    </span>
                  </span>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <span className="text-sm text-gray-500 block mb-2">
                    Avg. Reading Time
                  </span>
                  <span className="text-2xl font-bold text-gray-800 flex items-end gap-1">
                    {book.avgReadingTime}
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
                  {book?.ownerId?.profileImage ? (
                    <img
                      src={book.ownerId.profileImage}
                      className="w-full h-full rounded-full object-cover"
                      alt="Owner profile"
                    />
                  ) : (
                    <User size={24} className="text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    {book.ownerId?.Name || "Unknown owner"}
                  </p>
                  <p className="text-gray-500">Book Owner</p>
                </div>

                <button
                  onClick={() => navigate(`/chats/${book.ownerId?._id}`)}
                  className="ml-auto bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                >
                  Chat
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {!isAvailable ? (
                  <>
                    {/* Not Available button */}
                    <button
                      className="w-full bg-gradient-to-r from-gray-400 to-gray-600 text-white px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 cursor-not-allowed opacity-80"
                      disabled={true}
                    >
                      <XCircle size={20} />
                      Not Available For Deal
                    </button>
                    {/* Notify Me button */}
                    <button
                      className={cn(
                        "w-full px-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transform hover:-translate-y-1 transition-all duration-300",
                        localIsUserNotified
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:shadow-lg hover:shadow-yellow-200/50"
                          : "bg-gradient-to-r from-gray-50 to-gray-200 text-gray-800 hover:shadow-lg hover:shadow-gray-200/50",
                        isNotifying && "opacity-75 cursor-wait"
                      )}
                      onClick={handleNotifyMe}
                      disabled={isNotifying}
                    >
                      {isNotifying ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <Bell size={20} />
                      )}
                      {localIsUserNotified
                        ? "You will be notified"
                        : "Notify Me"}
                    </button>
                  </>
                ) : user &&
                  existingRequest &&
                  (requestStatus === "pending" ||
                    requestStatus === "accepted") ? (
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
                        disabled={
                          !hasRentAmount || isSubmitting || checkingRequest
                        }
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
                  key={relatedBook?._id}
                  to={`/book/${relatedBook?._id}`}
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
                        <div
                          className={cn(
                            "absolute top-4 right-4 px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium",
                            relatedBook.status === "Available"
                              ? "bg-green-500/80 text-white"
                              : "bg-red-500/80 text-white"
                          )}
                        >
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
                <p className="text-gray-500 font-medium mb-4">
                  No related books found
                </p>
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
