import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  FileText,
  Check,
  X,
  RefreshCw,
  RefreshCcw,
  RotateCcw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { useRentalContract } from "@/hooks/user/rentalContracts/useBorrowedBookDetailsQueries";
import { useRentalMutations } from "@/hooks/user/rentalContracts/useRentedContractsMutation";
import LoadingSpinner from "@/hooks/ui/loading/loading";
import OTPModal from "@/Components/modals/OtpModal";
import { useToast } from "@/hooks/ui/toast";
import { AxiosError } from "axios";

const RentedOutBookDetailsPage = () => {
  const { rentalId } = useParams<{ rentalId?: string }>();
  const { rentalContract, isLoading, error } = useRentalContract(rentalId);
  const toast = useToast();
  const {
    sendOtpMutation,
    verifyOtpMutation,
    updateStatusMutation,
    createReturnRejectionMutation,
    renewContractMutation,
  } = useRentalMutations();

  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isReturnActionModalOpen, setIsReturnActionModalOpen] = useState(false);
  const [isReturnRejectModalOpen, setIsReturnRejectModalOpen] = useState(false);
  const [isRenewalAcceptModalOpen, setIsRenewalAcceptModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const calculateRemainingDays = (endDate: Date) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd-MM-yyyy");
  };

  if (!rentalId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 font-sans flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-xl max-w-md w-full">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Invalid Contract ID</h2>
          <p className="text-gray-600 mb-6">No rental contract ID provided.</p>
          <Button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white transition-all duration-300 font-medium px-6 py-2"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner message="Loading rental details" />;

  if ((error && error !== "Unknown error") || !rentalContract) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 font-sans flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-xl max-w-md w-full">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Contract Not Found</h2>
          <p className="text-gray-600 mb-6">
            The rental contract you're looking for doesn't exist or has been
            removed.
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white transition-all duration-300 font-medium px-6 py-2"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const remainingDays = calculateRemainingDays(rentalContract.rent_end_date);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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

  const progressPercentage = Math.min((elapsedDays / totalDays) * 100, 100);

  const returnedProgressPercentage = 100; // Constant for returned status

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Rental":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Return Requested":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Returned":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Return Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "Contract Date Exceeded":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Return Rejection Requested":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const calculatePaidAmount = (): number => {
  if (rentalContract.status !== "Returned" && !isContractExceeded()) {
    return 0;
  }
  const rentAmount = rentalContract.rent_amount || 0;
  const penaltyAmount = rentalContract.penalty_amount || 0;
  return penaltyAmount > 0 ? (rentAmount + penaltyAmount) : rentAmount;
};

  const isContractExceeded = () => {
    const endDate = new Date(rentalContract.rent_end_date);
    const today = new Date();
    return today > endDate;
  };

  const getAmountPaidLabel = () => {
    if (rentalContract.status === "Returned" || isContractExceeded()) {
      return "AMOUNT PAID";
    }
    return "AMOUNT TO BE PAID";
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount}`;
  };

  const handleInitiateReturn = async () => {
    try {
      await sendOtpMutation.mutateAsync({
      email: rentalContract.borrowerId.email,
      bookId: rentalContract?.bookId?._id,
    });
      toast.success("An OTP has been sent to the borrower's email.");
      setIsReturnActionModalOpen(false);
      setIsOTPModalOpen(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            "Failed to send OTP. Please try again."
        );
      }
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    if (!rentalId) {
      toast.error("Rental ID is missing.");
      return;
    }
    try {
      const payload = {
        email: rentalContract.borrowerId.email,
        otp,
        bookId:rentalContract.bookId._id
      };
      await verifyOtpMutation.mutateAsync(payload);
      await updateStatusMutation.mutateAsync({ rentalId, status: "Returned" });
      toast.success(
        "Return request accepted and contract status updated to Returned."
      );
      setIsOTPModalOpen(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            "Failed to verify OTP. Please try again."
        );
      }
    }
  };

  const handleResendOTP = async () => {
    try {
      await sendOtpMutation.mutateAsync({
      email: rentalContract.borrowerId.email,
      bookId: rentalContract?.bookId?._id,
    });
      toast.success("A new OTP has been sent to the borrower's email.");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            "Failed to resend OTP. Please try again."
        );
      }
    }
  };

  const handleRejectReturn = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    if (!rentalId) {
      toast.error("Rental ID is missing.");
      return;
    }
    try {
      const rejectionPayload = {
        rentId: rentalContract._id,
        ownerId: rentalContract.ownerId._id,
        borrowerId: rentalContract.borrowerId._id,
        reason: rejectReason,
      };
      await createReturnRejectionMutation.mutateAsync(rejectionPayload);
      await updateStatusMutation.mutateAsync({
        rentalId,
        status: "Return Rejection Requested",
      });
      toast.success("Return rejection requested successfully.");
      setIsReturnRejectModalOpen(false);
      setRejectReason("");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            "Failed to submit return rejection request. Please try again."
        );
      }
    }
  };

  const handleRenewContract = async (response: "Accepted" | "Rejected") => {
    if (!rentalId) {
      toast.error("Rental ID is missing.");
      return;
    }
    try {
      const lastRenewal = Array.isArray(rentalContract.renewal_details)
        ? rentalContract.renewal_details[
            rentalContract.renewal_details.length - 1
          ]
        : null;
      if (!lastRenewal || lastRenewal.response !== "Pending") {
        toast.error("No pending renewal request found.");
        return;
      }
      const renewalDetails = {
        ...lastRenewal,
        response,
        responded_at: new Date(),
      };
      await renewContractMutation.mutateAsync({ rentalId, renewalDetails });
      toast.success(`Renewal request ${response.toLowerCase()} successfully.`);
      setIsRenewalAcceptModalOpen(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          error.response?.data?.message ||
            `Failed to ${response.toLowerCase()} renewal request. Please try again.`
        );
      }
    }
  };

  const getReturnStatusButton = () => {
    switch (rentalContract.status) {
      case "On Rental":
      case "Contract Date Exceeded":
        return (
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 w-full">
            <X className="h-5 w-5 text-gray-600" />
            <span className="text-gray-600 font-medium">
              No Return Request Available
            </span>
          </div>
        );
      case "Return Requested":
        return (
          <Button
            className="flex items-center gap-2 bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 hover:from-amber-300 hover:to-amber-400 px-4 py-3 rounded-lg border border-amber-200 w-full h-auto justify-start font-medium shadow-sm disabled:opacity-50"
            onClick={() => setIsReturnActionModalOpen(true)}
            disabled={sendOtpMutation.isPending}
          >
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span>Return Request Available</span>
          </Button>
        );
      case "Returned":
        return (
          <div className="flex items-center gap-2 bg-green-100 px-4 py-3 rounded-lg border border-green-200 w-full">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium">Book Returned</span>
          </div>
        );
      case "Return Rejected":
       return (
  <div className="flex items-center gap-2 bg-green-100 px-4 py-3 rounded-lg border border-green-200 w-full">
    <CheckCircle className="h-5 w-5 text-green-600" />
    <span className="text-green-700 font-medium">
      Return Request Rejectetion Approved.
    </span>
  </div>
);
      case "Return Rejection Requested":
        return (
          <div className="flex items-center gap-2 bg-amber-100 px-4 py-3 rounded-lg border border-amber-200 w-full">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-amber-700 font-medium">
              Requested for Return Rejection
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const getRenewalStatusButton = () => {
    switch (rentalContract.renewal_status) {
      case "No Renewal":
        return (
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-lg border border-gray-200 w-full">
            <X className="h-5 w-5 text-gray-600" />
            <span className="text-gray-600 font-medium">
              No Renewal Request Available
            </span>
          </div>
        );
      case "Renewal Requested":
        return (
          <Button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800 hover:from-blue-300 hover:to-blue-400 px-4 py-3 rounded-lg border border-blue-200 w-full h-auto justify-start font-medium shadow-sm disabled:opacity-50"
            onClick={() => setIsRenewalAcceptModalOpen(true)}
            disabled={renewContractMutation.isPending}
          >
            <RefreshCw className="h-5 w-5 text-blue-600" />
            <span>Renew Request Available</span>
          </Button>
        );
      case "Renewal Rejected":
        return (
          <div className="flex items-center gap-2 bg-red-100 px-4 py-3 rounded-lg border border-red-200 w-full">
            <X className="h-5 w-5 text-red-600" />
            <span className="text-red-700 font-medium">
              Renewal Request Rejected
            </span>
          </div>
        );
      case "Renewed":
        return (
          <div className="flex items-center gap-2 bg-green-100 px-4 py-3 rounded-lg border border-green-200 w-full">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-medium">Contract Renewed</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-800 font-sans">
      <header className="bg-white/80 backdrop-blur-md px-4 sm:px-6 py-4 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            to="/rented-books"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Rented Out Book Details
          </h1>
        </div>
      </header>

      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group">
              <img
                src={rentalContract.bookId.images[0] || "/placeholder.svg"}
                alt={rentalContract.bookId.name}
                className="w-36 h-48 md:w-44 md:h-60 object-cover rounded-md shadow-lg border border-gray-300 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-gray-300">
                Rs.{rentalContract.original_amount}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {rentalContract.bookId.name}
              </h2>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start items-center">
                <Badge
                  className={`${getStatusColor(
                    rentalContract.status
                  )} text-sm py-1.5 px-4 border`}
                >
                  {rentalContract.status}
                </Badge>

                {rentalContract.status === "Returned" ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <span>
                      Returned At{" "}
                      {rentalContract.returned_at
                        ? formatDate(rentalContract.returned_at)
                        : "N/A"}
                    </span>
                  </div>
                ) : rentalContract.status === "Return Requested" &&
                  isContractExceeded() ? (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Borrower requested for return, please respond to it.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    <Clock className="h-4 w-4" />
                    <span>{remainingDays} days remaining</span>
                  </div>
                 
                )}
              </div>

              {!rentalContract.renewal_status.includes("No") && (
                <div className="inline-block bg-gray-100/70 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm border border-gray-200">
                  <span className="text-gray-700 font-medium">
                    {rentalContract.renewal_status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 sm:p-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                <FileText className="h-5 w-5 text-gray-600" />
                Contract Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500">BOOK NAME</p>
                  <p className="font-medium truncate">
                    {rentalContract.bookId.name}
                  </p>
                </div>

                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500">CONTRACT PERIOD</p>
                  <p className="font-medium">
                    {rentalContract.period_of_contract} Days
                  </p>
                </div>

                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500">RENTAL AMOUNT</p>
                  <p className="font-medium">
                    Rs. {rentalContract.rent_amount.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-200/50 hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500">ORIGINAL PRICE</p>
                  <p className="font-medium">
                    Rs. {rentalContract.original_amount.toFixed(2)}
                  </p>
                </div>
              </div>

              <Separator className="my-8 bg-gray-200" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium mb-9 text-gray-600">
                    Contract Timeline
                  </h3>

                  <div className="relative h-1 bg-gray-200 rounded-full mb-8">
                    {rentalContract.status === "Returned" ? (
                      <>
                        <div
                          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"
                          style={{ width: `${returnedProgressPercentage}%` }}
                        ></div>
                        <div className="absolute -left-1.5 bottom-1 transform -translate-y-full mb-2">
                          <div className="bg-blue-500 w-3 h-3 rounded-full"></div>
                          <span className="text-xs text-gray-500 absolute -left-3 top-4">
                            Start
                          </span>
                        </div>
                        <div className="absolute -right-1.5 bottom-1 transform -translate-y-full mb-2">
                          <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                          <span className="text-xs text-gray-500 absolute -right-6 top-4">
                            Returned
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                        <div className="absolute -left-1.5 bottom-1 transform -translate-y-full mb-2">
                          <div className="bg-blue-500 w-3 h-3 rounded-full"></div>
                          <span className="text-xs text-gray-500 absolute -left-3 top-4">
                            Start
                          </span>
                        </div>
                        <div className="absolute -right-1.5 bottom-1 transform -translate-y-full mb-2">
                          <div className="bg-red-500 w-3 h-3 rounded-full"></div>
                          <span className="text-xs text-gray-500 absolute -right-3 top-4">
                            End
                          </span>
                        </div>
                        <div
                          className="absolute bottom-1 transform -translate-y-full mb-2"
                          style={{ left: `${progressPercentage}%` }}
                        >
                          {/* <div className="bg-green-500 w-3 h-3 rounded-full shadow-md transform -translate-x-1/2"></div>
                          <span className="text-xs text-gray-500 absolute transform -translate-x-1/2 top-4">Now</span> */}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">START DATE</p>
                        <p className="font-medium">
                          {formatDate(rentalContract.rent_start_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">END DATE</p>
                        <p className="font-medium">
                          {formatDate(rentalContract.rent_end_date)}
                        </p>
                      </div>
                    </div>

                    {rentalContract.status === "Return Requested" && rentalContract.return_requested_at && (
                      <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">
                            RETURN REQUESTED AT
                          </p>
                          <p className="font-medium">
                            {formatDate(rentalContract.return_requested_at)}
                          </p>
                        </div>
                      </div>
                    )}

                    {rentalContract.status === "Returned" ? (
                      <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">RETURNED AT</p>
                          <p className="font-medium">
                            {rentalContract.returned_at
                              ? formatDate(rentalContract.returned_at)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    ) : rentalContract.status === "Return Requested" &&
                      isContractExceeded() ? (
                      <div className="flex items-start gap-4 bg-amber-100 p-4 rounded-lg border border-amber-200 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">RETURN REQUEST STATUS</p>
                          <p className="text-sm text-amber-600">
                            borrower requested for return, please respond to it.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">REMAINING TIME</p>
                          <p className="font-medium flex items-center">
                            {remainingDays} days
                            {remainingDays < 5 && (
                              <span className="ml-2 text-xs text-red-600">
                                Return due soon!
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-5 text-gray-600">
                    Financial Details
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          {getAmountPaidLabel()}
                        </p>
                        <p className="font-medium">
                          {calculatePaidAmount() === 0
                            ? "Rs. 0"
                            : formatCurrency(calculatePaidAmount())}
                          {isContractExceeded() &&
                            rentalContract.status !== "Returned" && (
                              <span className="ml-2 text-xs text-green-600">
                                Payment received
                              </span>
                            )}
                        </p>
                      </div>
                    </div>

                    {rentalContract.penalty_amount > 0 && (
                      <div className="flex items-start gap-4 bg-red-50 p-4 rounded-lg border border-red-100 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">PENALTY</p>
                          <p className="font-medium text-red-600">
                            Rs. {rentalContract.penalty_amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {rentalContract.renewal_details &&
                      rentalContract.renewal_details.length > 0 && (
                        <div className="flex items-start gap-4 bg-green-50 p-4 rounded-lg border border-green-100 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <RefreshCcw className="h-5 w-5 text-white" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500">
                              RENEWAL DETAILS
                            </p>

                            <div>
                              <p className="text-xs text-gray-500">
                                Extended period
                              </p>
                              <p className="font-medium">
                                {
                                  rentalContract.renewal_details[
                                    rentalContract.renewal_details.length - 1
                                  ].days
                                }{" "}
                                days
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Amount</p>
                              <p className="font-medium">
                                Rs.{" "}
                                {
                                  rentalContract.renewal_details[
                                    rentalContract.renewal_details.length - 1
                                  ].amount.toFixed(2)
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Status</p>
                              <div className="flex items-center gap-2">
                                {rentalContract.renewal_details[
                                  rentalContract.renewal_details.length - 1
                                ].response === "Pending" && (
                                  <span title="Pending">
                                    <RotateCcw className="h-4 w-4 text-yellow-500 animate-spin-slow" />
                                  </span>
                                )}
                                {rentalContract.renewal_details[
                                  rentalContract.renewal_details.length - 1
                                ].response === "Accepted" && (
                                  <span title="Accepted">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  </span>
                                )}
                                {rentalContract.renewal_details[
                                  rentalContract.renewal_details.length - 1
                                ].response === "Rejected" && (
                                  <span title="Rejected">
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </span>
                                )}
                                <p className="font-medium">
                                  {
                                    rentalContract.renewal_details[
                                      rentalContract.renewal_details.length - 1
                                    ].response
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                    {(rentalContract.status === "Returned" ||
                      isContractExceeded()) &&
                      rentalContract.penalty_amount > 0 && (
                        <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              TOTAL AMOUNT
                            </p>
                            <p className="font-medium">
                              Rs.{" "}
                              {Number(rentalContract.rent_amount) +
                                Number(rentalContract.penalty_amount).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              (Rental: Rs. {rentalContract.rent_amount.toFixed(2)} +
                              Penalty: Rs. {rentalContract.penalty_amount.toFixed(2)})
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                <User className="h-5 w-5 text-gray-600" />
                Borrower Details
              </h2>

              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-5 ring-2 ring-gray-200 ring-offset-2 ring-offset-white shadow-md">
                  <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 text-xl">
                    {getInitials(rentalContract.borrowerId.Name || "")}
                  </AvatarFallback>
                </Avatar>

                <h3 className="text-xl font-medium mb-2">
                  {rentalContract.borrowerId.Name}
                </h3>

                <Separator className="my-6 w-full bg-gray-200" />

                <div className="w-full space-y-5">
                  <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CONTACT NUMBER</p>
                      <p className="font-medium">
                        {rentalContract.borrowerId.phoneNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200/50 transition-transform hover:translate-y-[-2px] hover:shadow-md">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">EMAIL ADDRESS</p>
                      <p className="font-medium break-all">
                        {rentalContract.borrowerId.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-600 px-1">
              Return Status
            </h3>
            {getReturnStatusButton()}

            <h3 className="text-sm font-medium text-gray-600 px-1 mt-4">
              Renewal Status
            </h3>
            {getRenewalStatusButton()}
          </div>
        </div>
      </main>

      <Dialog
        open={isReturnActionModalOpen}
        onOpenChange={setIsReturnActionModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Handle Return Request</DialogTitle>
            <DialogDescription>
              A return request is pending for book{" "}
              <span className="font-semibold">
                {rentalContract.bookId.name}
              </span>
              . Choose to accept or reject the request.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-0">
            <p className="text-sm text-gray-600 mb-4">
              Accepting will send an OTP to the borrower's email for
              verification. Rejecting will require a reason.
            </p>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsReturnActionModalOpen(false)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setIsReturnActionModalOpen(false);
                  setIsReturnRejectModalOpen(true);
                }}
              >
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleInitiateReturn}
                disabled={sendOtpMutation.isPending}
              >
                {sendOtpMutation.isPending ? "Sending OTP..." : "Accept"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isReturnRejectModalOpen}
        onOpenChange={setIsReturnRejectModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Return Request</DialogTitle>
            <DialogDescription>
              You are about to reject the return request for book{" "}
              <span className="font-semibold">
                {rentalContract.bookId.name}
              </span>
              . This action will submit a return rejection request.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-0">
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting the return request:
            </p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 min-h-[100px]"
              placeholder="Book is damaged / Book condition is not acceptable / Pages are missing / etc."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsReturnRejectModalOpen(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRejectReturn}
              disabled={
                updateStatusMutation.isPending ||
                createReturnRejectionMutation.isPending
              }
            >
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isRenewalAcceptModalOpen}
        onOpenChange={setIsRenewalAcceptModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Handle Renewal Request</DialogTitle>
            <DialogDescription>
              You are about to handle the renewal request for book{" "}
              <span className="font-semibold">
                {rentalContract.bookId.name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-0">
            <p className="text-sm text-gray-600 mb-4">Renewal details:</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                <span className="text-gray-700">Extended period:</span>
                <span className="font-medium">
                  {rentalContract.renewal_details &&
                  rentalContract.renewal_details.length > 0
                    ? rentalContract.renewal_details[
                        rentalContract.renewal_details.length - 1
                      ].days
                    : 0}{" "}
                  days
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
              <span className="text-gray-700">Renewal amount:</span>
                <span className="font-medium">
                  Rs.{" "}
                  {rentalContract.renewal_details &&
                  rentalContract.renewal_details.length > 0
                    ? rentalContract.renewal_details[
                        rentalContract.renewal_details.length - 1
                      ].amount.toFixed(2)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                <span className="text-gray-700">Requested at:</span>
                <span className="font-medium">
                  {rentalContract.renewal_details &&
                  rentalContract.renewal_details.length > 0
                    ? formatDate(
                        rentalContract.renewal_details[
                          rentalContract.renewal_details.length - 1
                        ].requested_at
                      )
                    : "Not specified"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setIsRenewalAcceptModalOpen(false)}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleRenewContract("Rejected")}
                disabled={renewContractMutation.isPending}
              >
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleRenewContract("Accepted")}
                disabled={renewContractMutation.isPending}
              >
                Accept
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        isSending={sendOtpMutation.isPending}
      />
    </div>
  );
};

export default RentedOutBookDetailsPage;