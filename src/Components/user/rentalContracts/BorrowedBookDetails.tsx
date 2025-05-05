import type React from "react";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  Mail,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
import {
  fetchRentalContractDetails,
  RentalContract,
} from "@/services/rental/rentalService";
import { format } from "date-fns";
import LoadingSpinner from "@/hooks/ui/loading/loading";
import { AxiosError } from "axios";
import { Card, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";

const BorrowedBookDetailsPage: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const [rentalContract, setRentalContract] = useState<RentalContract | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRentalContractDetails = async () => {
      if (!rentalId) {
        setError("Rental ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetchRentalContractDetails(rentalId);
        if (response && response.success) {
          setRentalContract(response.rentedBooksContracts);
        } else {
          setError("Failed to load rental contract details");
        }
      } catch (err) {
        if (err instanceof AxiosError)
          setError("An error occurred while fetching rental details");
      } finally {
        setLoading(false);
      }
    };

    loadRentalContractDetails();
  }, [rentalId]);

  // Calculate remaining days
  const calculateRemainingDays = (endDate: Date): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Format date to display
  const formatDate = (date: Date): string => {
    return format(new Date(date), "dd-MM-yyyy");
  };

  if (loading) return <LoadingSpinner message="Loading book rental details" />;

  const totalDays = Math.max(
    1,
    Math.ceil(
      (new Date(rentalContract!.rent_end_date).getTime() -
        new Date(rentalContract!.rent_start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const elapsedDays = Math.min(
    totalDays,
    Math.ceil(
      (Date.now() - new Date(rentalContract!.rent_start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  if (!rentalContract && error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-black font-sans flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Contract Not Found</h2>
          <p className="text-gray-600">
            The rental contract you're looking for doesn't exist or has been
            removed.
          </p>
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

  const remainingDays = calculateRemainingDays(rentalContract!.rent_end_date);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-black font-sans">
      {/* Side Heading */}
      <div className="  bg-white  px-10 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            to="/borrowed-books"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-black" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
            Borrowed Book Details
          </h1>
        </div>
      </div>

      {/* Main Content Section */}
      <main className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pt-8">
        {/* Borrowed Book Details Card */}
        <Card className="border border-gray-300 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Contract Details</h2>

            {/* Book Info */}
            <div className="flex flex-col md:flex-row items-start mb-6">
              <div className="relative w-full md:w-48 h-64 flex-shrink-0 overflow-hidden">
                <img
                  src={rentalContract!.bookId.images[0] || "/placeholder.svg"}
                  alt={rentalContract!.bookId.name}
                  className="w-full h-full object-cover rounded-md"
                  style={{
                    width: "192px",
                    height: "256px",
                    objectFit: "cover",
                  }}
                />
                <div className="absolute top-0 right-0 m-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                  <p className="text-sm font-medium">
                    Rs.{rentalContract!.original_amount}
                  </p>
                </div>
              </div>
              <div className="p-6 w-full md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">
                  {rentalContract!.bookId.name}
                </h2>
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Owned by {rentalContract!.ownerId.Name}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">PERIOD</p>
                      <p className="font-medium">
                        {rentalContract!.period_of_contract} Days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">RENTAL AMOUNT</p>
                      <p className="font-medium">
                        Rs. {rentalContract!.rent_amount}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-5 inline-block px-4 py-1 rounded-full text-sm font-medium ${
                    rentalContract!.status === "On Rental"
                      ? "bg-blue-100 text-blue-800"
                      : rentalContract!.status === "Return Requested"
                      ? "bg-yellow-100 text-yellow-800"
                      : rentalContract!.status === "Returned"
                      ? "bg-green-100 text-green-800"
                      : rentalContract!.status === "Return Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {rentalContract!.status}
                </div>
              </div>
            </div>

            {/* Combined Timeline and Contact Details Card */}
            <Card className="border border-gray-300 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Contract Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Timeline on the left */}
                  <div className="space-y-6">
  <h3 className="font-semibold text-gray-800 text-lg">Timeline</h3>

  <div className="relative pl-10 pr-4 max-h-90 overflow-y-auto space-y-14">
    {/* Background vertical line */}
    <div className="absolute left-4 top-5 bottom-5 w-[3px] bg-gray-300 z-0" />

    {/* Progress vertical line */}
    <div
      className="absolute left-4 top-5 w-[3px] bg-blue-500 z-10 rounded"
      style={{ height: `${Math.min((elapsedDays / totalDays) * 100, 100)}%` }}
    />

    {/* START DATE */}
    <div className="relative z-20 min-h-[72px]">
      <div className="absolute left-[-36px] top-1 bg-blue-500 w-7 h-7 rounded-full flex items-center justify-center">
        <Calendar className="h-4 w-4 text-white" />
      </div>
      <p className="text-xs text-gray-500 mb-1">START DATE</p>
      <p className="font-medium text-base">{formatDate(rentalContract!.rent_start_date)}</p>
    </div>

    {/* CURRENT STATUS */}
    <div className="relative z-20 min-h-[72px]">
      <div className="absolute left-[-36px] top-1 bg-gray-400 w-7 h-7 rounded-full flex items-center justify-center">
        <Clock className="h-4 w-4 text-white" />
      </div>
      <p className="text-xs text-gray-500 mb-1">CURRENT STATUS</p>
      <div className="flex items-center">
        <p className="font-medium text-base">{remainingDays} days remaining</p>
        {remainingDays < 5 && (
          <span className="ml-2 text-xs text-red-500 font-medium">Return soon!</span>
        )}
      </div>
    </div>

    {/* END DATE */}
    <div className="relative z-20 min-h-[76px]">
      <div className="absolute left-[-36px]  bg-red-500 w-7 h-7 rounded-full flex items-center justify-center">
        <Calendar className="h-4 w-4 text-white" />
      </div>
      <p className="text-xs text-gray-500 mb-1">END DATE</p>
      <p className="font-medium text-base">{formatDate(rentalContract!.rent_end_date)}</p>
    </div>
  </div>
</div>


                  {/* Owner and Borrower Details on the right */}
                  <div className="space-y-4">
                    {/* Owner Details */}
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">
                        Owner Details
                      </h3>
                      <div className="space-y-10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">NAME</p>
                            <p className="font-medium">
                              {rentalContract!.ownerId.Name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">CONTACT</p>
                            <p className="font-medium">
                              {rentalContract!.ownerId.phoneNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">EMAIL</p>
                            <p className="font-medium">
                              {rentalContract!.ownerId.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Borrower Details */}
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">
                        Borrower Details
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">NAME</p>
                            <p className="font-medium">
                              {rentalContract!.borrowerId.Name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-10">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">EMAIL</p>
                            <p className="font-medium">
                              {rentalContract!.borrowerId.email}
                            </p>
                          </div>
                        </div>
                        {rentalContract!.penalty_amount > 0 && (
                          <div className="flex items-center gap-3 mt-10">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">PENALTY</p>
                              <p className="font-medium text-red-600">
                                Rs. {rentalContract!.penalty_amount}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Renewal Details Card (Only shown if renewal information exists) */}
            {rentalContract!.renewal_details && (
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Renewal Details</h2>
                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">EXTENSION DAYS</p>
                        <p className="font-medium">
                          {rentalContract!.renewal_details.days} Days
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          EXTENSION AMOUNT
                        </p>
                        <p className="font-medium">
                          Rs. {rentalContract!.renewal_details.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-4 pt-4">
              {rentalContract!.status === "On Rental" && (
                <button className="px-6 py-2 rounded-md bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Request Return
                </button>
              )}

              {rentalContract!.status === "On Rental" &&
                rentalContract!.renewal_status === "No Renewal" && (
                  <button className="px-6 py-2 rounded-md bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Request Renewal
                  </button>
                )}

              {rentalContract!.renewal_status === "Renewal Requested" && (
                <div className="px-4 py-2 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200">
                  <span className="font-medium">Renewal Requested</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BorrowedBookDetailsPage;
