import type React from "react";
import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Book,
  User,
  DollarSign,
  Calendar,
  ChevronLeft,
  Mail,
  Phone,
  AlertTriangle,
} from "lucide-react";
import { useSaleContract } from "@/hooks/user/saleContractquries/useBoughtBookDetailsQueries";
import LoadingSpinner from "@/hooks/ui/loading/loading";
import { Card, CardContent } from "@/Components/ui/card";
import { useToast } from "@/hooks/ui/toast";

const SoldBookDetails: React.FC = () => {
  const { saleContractId } = useParams<{ saleContractId: string }>();
  const toast = useToast();
  const { data, isLoading, error } = useSaleContract(saleContractId);
  const hasShownToast = useRef(false); // Prevent multiple toasts

  // Trigger toast notification in a useEffect to avoid render-time state updates
  useEffect(() => {
    if (error && !hasShownToast.current) {
      const errorMessage = error?.message || "The sale contract you're looking for doesn't exist or has been removed.";
      toast.error(errorMessage);
      hasShownToast.current = true;
    } else if (data && !error) {
      hasShownToast.current = false; // Reset toast flag on success
    }
  }, [error, data, toast]);

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "N/A";
    return format(new Date(date), "dd-MM-yyyy");
  };

  if (isLoading) return <LoadingSpinner message="Loading sold book details" />;

  if (error || !data?.saleBooksContracts) {
    const errorMessage = error?.message || "The sale contract you're looking for doesn't exist or has been removed.";
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-black font-sans flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Sale Contract Not Found</h2>
          <p className="text-gray-600">{errorMessage}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const saleContract = data.saleBooksContracts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-black font-sans">
      {/* Header */}
      <div className="bg-white px-10 py-6 ">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            to="/sold-books"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-black" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
            Sold Book Details
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pt-8">
        {/* Book Details Card */}
        <Card className="border border-gray-300 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Book Details</h2>
            <div className="flex flex-col md:flex-row items-start mb-6">
              <div className="relative w-full md:w-48 h-64 flex-shrink-0 overflow-hidden">
                <img
                  src={saleContract.bookId.images[0] || "/placeholder.svg"}
                  alt={saleContract.bookId.name}
                  className="w-full h-full object-cover rounded-md"
                  style={{ width: "192px", height: "256px", objectFit: "cover" }}
                />
                <div className="absolute top-0 right-0 m-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                  <p className="text-sm font-medium">Rs. {saleContract.bookId.originalAmount}</p>
                </div>
              </div>
              <div className="p-6 w-full md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">{saleContract.bookId.name}</h2>
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <Book className="h-4 w-4" />
                  <span>Book ID: {saleContract.bookId._id}</span>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">DESCRIPTION</p>
                  <p className="text-gray-700">{saleContract.bookId.description || "No description available"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sale Details Card */}
        <Card className="border border-gray-300 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Sale Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">PRICE</p>
                  <p className="font-medium">Rs. {saleContract.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">SALE DATE</p>
                  <p className="font-medium">{formatDate(saleContract.sale_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">CONTRACT CREATED</p>
                  <p className="font-medium">{formatDate(saleContract.created_at)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller and Buyer Details Card */}
        <Card className="border border-gray-300 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Transaction Parties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
              {/* Seller Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 mb-3">Your Details (Seller)</h3>
                <div className="space-y-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">NAME</p>
                      <p className="font-medium">{saleContract.ownerId.Name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">EMAIL</p>
                      <p className="font-medium">{saleContract.ownerId.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CONTACT</p>
                      <p className="font-medium">{saleContract.ownerId.phoneNumber || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buyer Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800 mb-3">Buyer Details</h3>
                <div className="space-y-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">NAME</p>
                      <p className="font-medium">{saleContract.buyerId.Name || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">EMAIL</p>
                      <p className="font-medium">{saleContract.buyerId.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium">{saleContract.buyerId.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SoldBookDetails;