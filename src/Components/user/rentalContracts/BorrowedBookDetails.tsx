import type React from "react";
import {
  Calendar,
  Clock,
  User,
  Phone,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  Mail,
  X,
  RotateCcw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import LoadingSpinner from "@/hooks/ui/loading/loading";
import { Card, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { useRentalContract } from "@/hooks/user/rentalContracts/useBorrowedBookDetailsQueries";
import { useState } from "react";
import { useRentalMutations } from "@/hooks/user/rentalContracts/useRentedContractsMutation";
import { useToast } from "@/hooks/ui/toast";
import { AxiosError } from "axios";



const BorrowedBookDetailsPage: React.FC = () => {
  const { rentalId } = useParams<{ rentalId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalDays, setRenewalDays] = useState<number>(7);

  const { rentalContract, isLoading, error, refetch } = useRentalContract(rentalId);
  const { updateStatusMutation, requestRenewalMutation } = useRentalMutations();
  const toast = useToast();

  const openConfirmModal = () => setShowConfirmModal(true);
  const closeConfirmModal = () => setShowConfirmModal(false);
  const openRenewalModal = () => setShowRenewalModal(true);
  const closeRenewalModal = () => setShowRenewalModal(false);

  const getRenewalStatusIcon = (status: string) => {
    switch (status) {
      case "No Renewal":
        return <Clock className="text-gray-400" />;
      case "Renewal Requested":
        return <RotateCcw className="text-yellow-500 animate-spin-slow" />;
      case "Renewed":
        return <CheckCircle className="text-green-500" />;
      case "Renewal Rejected":
        return <XCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  const handleReturnRequest = async () => {
    if (!rentalId) return;

    setIsSubmitting(true);
    closeConfirmModal();

    try {
      await updateStatusMutation.mutateAsync({
        rentalId,
        status: "Return Requested",
      });

      toast.success("Return request submitted successfully!");
      refetch();
    } catch (error) {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
      console.error("Error submitting return request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRenewalAmount = (): number => {
    if (!rentalContract) return 0;
    const dailyRate = rentalContract.rent_amount / rentalContract.period_of_contract;
    return Math.round(dailyRate * renewalDays);
  };

  const handleRenewalRequest = async () => {
    if (!rentalId) return;

    setIsSubmitting(true);
    closeRenewalModal();

    try {
      await requestRenewalMutation.mutateAsync({
        rentalId,
        days: renewalDays,
        amount: calculateRenewalAmount(),
      });

      toast.success("Renewal request submitted successfully!");
      refetch();
    } catch (error) {
      if (error instanceof AxiosError)
        toast.error(error.response?.data.message);
      console.error("Error submitting renewal request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateRemainingDays = (endDate: Date): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateExceededDays = (endDate: Date): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = today.getTime() - end.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return "N/A";
    return format(new Date(date), "dd-MM-yyyy");
  };

  if (isLoading) return <LoadingSpinner message="Loading book rental details" />;

  if (!rentalContract && error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-black font-sans flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Contract Not Found</h2>
          <p className="text-gray-600">
            The rental contract you're looking for doesn't exist or has been removed.
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

  if (!rentalContract) return null;

  const totalDays = Math.max(
    1,
    Math.ceil(
      (new Date(rentalContract.rent_end_date).getTime() -
        new Date(rentalContract.rent_start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const elapsedDays = Math.min(
    totalDays,
    Math.ceil(
      (Date.now() - new Date(rentalContract.rent_start_date).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const remainingDays = calculateRemainingDays(rentalContract.rent_end_date);

  const exceededDays = calculateExceededDays(rentalContract.rent_end_date);

  const returnedProgressPercentage = 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-black font-sans">
      <div className="bg-white px-10 py-6">
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

      <main className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pt-8">
        <Card className="border border-gray-300 shadow-xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Contract Details</h2>

            <div className="flex flex-col md:flex-row items-start mb-6">
              <div className="relative w-full md:w-48 h-64 flex-shrink-0 overflow-hidden">
                <img
                  src={rentalContract.bookId.images[0] || "/placeholder.svg"}
                  alt={rentalContract.bookId.name}
                  className="w-full h-full object-cover rounded-md"
                  style={{ width: "192px", height: "256px", objectFit: "cover" }}
                />
                <div className="absolute top-0 right-0 m-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                  <p className="text-sm font-medium">Rs.{rentalContract.original_amount}</p>
                </div>
              </div>
              <div className="p-6 w-full md:w-2/3">
                <h2 className="text-2xl font-bold mb-2">{rentalContract.bookId.name}</h2>
                <div className="flex items-center gap-2 mb-4 text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Owned by {rentalContract.ownerId.Name}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">PERIOD</p>
                      <p className="font-medium">{rentalContract.period_of_contract} Days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">RENTAL AMOUNT</p>
                      <p className="font-medium">Rs. {rentalContract.rent_amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-5 inline-block px-4 py-1 rounded-full text-sm font-medium ${
                    rentalContract.status === "On Rental"
                      ? "bg-blue-100 text-blue-800"
                      : rentalContract.status === "Return Requested"
                      ? "bg-yellow-100 text-yellow-800"
                      : rentalContract.status === "Returned"
                      ? "bg-green-100 text-green-800"
                      : rentalContract.status === "Return Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {rentalContract.status}
                </div>
              </div>
            </div>

            <Card className="border border-gray-300 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Contract Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-14">
                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-800 text-lg">Timeline</h3>
                    <div className="relative pl-10 pr-4 space-y-14">
                      <div className="relative" style={{ height: "300px" }}>
                        <div
                          className="absolute left-4 top-5 bottom-5 w-[3px] bg-gray-300 z-0"
                          style={{ height: "calc(100% - 10px)" }}
                        />
                        <div
                          className="absolute left-4 top-5 w-[3px] bg-blue-500 z-10 rounded"
                          style={{
                            height: `${
                              rentalContract.status === "Returned"
                                ? returnedProgressPercentage
                                : Math.min((elapsedDays / totalDays) * 100, 100)
                            }%`,
                            maxHeight: "calc(100% - 10px)",
                          }}
                        />
                        <div className="absolute -top-3 left-10 right-0 z-20">
                          <div className="relative">
                            <div className="absolute left-[-36px] top-1 bg-blue-500 w-7 h-7 rounded-full flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 mb-1">START DATE</p>
                            <p className="font-medium text-base">
                              {formatDate(rentalContract.rent_start_date)}
                            </p>
                          </div>
                        </div>
                        {rentalContract.status === "Return Requested" && rentalContract.return_requested_at && (
                          <div className="absolute top-[30%] transform translate-y-[-50%] left-10 right-0 z-20">
                            <div className="relative">
                              <div className="absolute left-[-36px] top-1 bg-yellow-500 w-7 h-7 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-white" aria-label="Return Request Warning" />
                              </div>
                              <p className="text-xs text-gray-500 mb-1">RETURN REQUESTED AT</p>
                              <p className="font-medium text-base">
                                {formatDate(rentalContract.return_requested_at)}
                              </p>
                            </div>
                          </div>
                        )}
                        {rentalContract.status === "Returned" ? (
                          <div className="absolute top-[55%] transform translate-y-[-50%] left-10 right-0 z-20">
                            <div className="relative">
                              <div className="absolute left-[-36px] top-1 bg-green-500 w-7 h-7 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-xs text-gray-500 mb-1">RETURNED AT</p>
                              <p className="font-medium text-base">
                                {rentalContract.returned_at
                                  ? formatDate(rentalContract.returned_at)
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        ) : (rentalContract.status === "Contract Date Exceeded" || remainingDays <= 0) && !(rentalContract.status === "Return Requested") ? (
                          <div className="absolute top-[55%] transform translate-y-[-50%] left-10 right-0 z-20">
                            <div className="relative">
                              <div className="absolute left-[-36px] top-1 bg-red-500 w-7 h-7 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-xs text-gray-500 mb-1">CONTRACT EXCEEDED</p>
                              <div className="flex items-center">
                                <p className="font-medium text-base">
                                  {exceededDays} days contract exceeded, return soon!
                                  {rentalContract.penalty_amount > 0 && (
                                    <span className="ml-2 text-xs text-red-600 font-medium">
                                      (Penalty: Rs. {rentalContract.penalty_amount})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : rentalContract.status === "Return Requested" && remainingDays <= 0 ? (
                          <div className="absolute top-[55%] transform translate-y-[-50%] left-10 right-0 z-20">
                            <div className="relative">
                              <div className="absolute left-[-36px] top-1 bg-red-500 w-7 h-7 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-white" />
                              </div>
                              <p className="text-xs text-gray-500 mb-1">CONTRACT EXCEEDED</p>
                              <div className="flex items-center">
                                <p className="font-medium text-base">
                                  contract date exceeded contact owner for return
                                  {rentalContract.penalty_amount > 0 && (
                                    <span className="ml-2 text-xs text-red-600 font-medium">
                                      (Penalty: Rs. {rentalContract.penalty_amount})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute top-[55%] transform translate-y-[-50%] left-10 right-0 z-20">
                            <div className="relative">
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
                          </div>
                        )}
                        <div className="absolute -bottom-13 left-10 right-0 z-20">
                          <div className="relative">
                            <div className="absolute left-[-36px] bg-red-500 w-7 h-7 rounded-full flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <p className="text-xs text-gray-500 mb-1">END DATE</p>
                            <p className="font-medium text-base">
                              {formatDate(rentalContract.rent_end_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">Owner Details</h3>
                      <div className="space-y-10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">NAME</p>
                            <p className="font-medium">{rentalContract.ownerId.Name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">CONTACT</p>
                            <p className="font-medium">{rentalContract.ownerId.phoneNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">EMAIL</p>
                            <p className="font-medium">{rentalContract.ownerId.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">Borrower Details</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">NAME</p>
                            <p className="font-medium">{rentalContract.borrowerId.Name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-10">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">EMAIL</p>
                            <p className="font-medium">{rentalContract.borrowerId.email}</p>
                          </div>
                        </div>
                        {rentalContract.penalty_amount > 0 && (
                          <div className="flex items-center gap-3 mt-10">
                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">PENALTY</p>
                              <p className="font-medium text-red-600">
                                Rs. {rentalContract.penalty_amount}
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

            {Array.isArray(rentalContract.renewal_details) && rentalContract.renewal_details.length > 0 && (
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Renewal Details</h2>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">EXTENSION DAYS</p>
                        <p className="font-medium">{rentalContract.renewal_details[rentalContract.renewal_details.length-1].days} Days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">EXTENSION AMOUNT</p>
                        <p className="font-medium">Rs. {rentalContract.renewal_details[rentalContract.renewal_details.length-1].amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getRenewalStatusIcon(rentalContract.renewal_status)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">REQUEST STATUS</p>
                        <p className="font-medium">{rentalContract.renewal_details[rentalContract.renewal_details.length-1].response}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-wrap justify-end gap-4 pt-4">
              {(rentalContract.status === "On Rental" || rentalContract.status === "Contract Date Exceeded") && (
                <button
                  onClick={openConfirmModal}
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-md bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Request Return"}
                </button>
              )}

              {rentalContract.status === "Return Requested" && (
                <button
                  disabled={true}
                  className="px-6 py-2 rounded-md bg-yellow-500 text-white font-medium opacity-70 cursor-not-allowed shadow-lg"
                >
                  Requested for Return
                </button>
              )}

              {rentalContract.status === "Returned" && (
                <button
                  disabled={true}
                  className="px-6 py-2 rounded-md bg-green-500 text-white font-medium opacity-70 cursor-not-allowed shadow-lg"
                >
                  Book Returned
                </button>
              )}

              {rentalContract.status === "Return Rejection Requested" && (
                <button
                  disabled={true}
                  className="px-6 py-2 rounded-md bg-orange-500 text-white font-medium opacity-70 cursor-not-allowed shadow-lg"
                >
                  You Request Rejected Wait for the Reason
                </button>
              )}

              {rentalContract.status === "Return Rejected" && (
                <button
                  onClick={openConfirmModal}
                  className="px-6 py-2 rounded-md bg-red-100 border border-red-300 text-red-800 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Your Return Request Rejected
                </button>
              )}

              {(rentalContract.status === "On Rental" || rentalContract.status === "Contract Date Exceeded") &&
                (rentalContract.renewal_status === "No Renewal" || rentalContract.renewal_status === "Renewed") && (
                  <button
                    onClick={openRenewalModal}
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-md bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    Request Renewal
                  </button>
                )}

              {rentalContract.renewal_status === "Renewal Requested" && (
                <button
                  disabled={true}
                  className="px-6 py-2 rounded-md bg-yellow-500 text-white font-medium opacity-70 cursor-not-allowed shadow-lg"
                >
                  Requested for Renewal
                </button>
              )}

              {rentalContract.renewal_status === "Renewal Rejected" && (
                <button
                  disabled={true}
                  className="px-6 py-2 rounded-md bg-red-500 text-white font-medium opacity-70 cursor-not-allowed shadow-lg"
                >
                  Renewal Request Rejected
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Confirm Return Request</h3>
              <button
                onClick={closeConfirmModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to request a return for "{rentalContract.bookId.name}"? The owner will be notified of your request.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmModal}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnRequest}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
              >
                {isSubmitting ? "Processing..." : "Confirm Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRenewalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Request Contract Renewal</h3>
              <button
                onClick={closeRenewalModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Select the number of days to extend the rental for "{rentalContract.bookId.name}".
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extension Days</label>
                <select
                  value={renewalDays}
                  onChange={(e) => setRenewalDays(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value={1}>1 Day</option>
                  <option value={5}>5 Days</option>
                  <option value={10}>10 Days</option>
                  <option value={20}>20 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Amount</label>
                <p className="p-2 bg-gray-100 rounded-md">Rs. {calculateRenewalAmount()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeRenewalModal}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenewalRequest}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition-colors"
              >
                {isSubmitting ? "Processing..." : "Submit Renewal Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowedBookDetailsPage;