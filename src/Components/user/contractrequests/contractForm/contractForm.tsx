"use client";

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContractRequest, useRentalCalculation } from "@/hooks/user/contractRequest/contractForm/useContractFormQuery";
import OTPModal from "@/Components/modals/OtpModal"; // Adjust path to your OTPModal component
import ContractResultModal from "./contractSuccessModal"; // Import the new component
import { sendOtpEmail, verifyOtp, createContract, RentalInput, SaleInput, CreateContractPayload } from "@/services/contract/contractService"; // Adjust path to your API calls
import { useToast } from "@/hooks/ui/toast";
import { AxiosError } from "axios";
import { RequestType } from "leaflet-geosearch/dist/providers/provider.js";

const ContractForm: React.FC = () => {
  const { conReqId } = useParams<{ conReqId: string }>();
  const [selectedDays, setSelectedDays] = useState<number>(0);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string>("");
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [contractResult, setContractResult] = useState<any>(null);

  // Fetch contract request data
  const { data, isLoading, error } = useContractRequest(conReqId);
  const contractRequest = data?.request || null;
  const toast = useToast()
  const navigate = useNavigate()
  // Set initial selected days when data is loaded
  React.useEffect(() => {
    if (contractRequest?.bookId?.maxRentalPeriod && selectedDays === 0) {
      setSelectedDays(contractRequest.bookId.maxRentalPeriod);
    }
    if (contractRequest?.ownerId?.email) {
      setOwnerEmail(contractRequest.ownerId.email); // Assuming ownerId has an email field
    }
  }, [contractRequest, selectedDays]);

  // Rental calculations
  const { totalRentAmount, dayIncrementOptions } = useRentalCalculation(contractRequest, selectedDays);
  
  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black text-xl font-medium">Loading...</p>
      </div>
    );
  }

  // Handle error or no data
  if (error || !contractRequest) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-red-500 text-xl font-medium">
          {error instanceof Error ? error.message : "No contract data available"}
        </p>
      </div>
    );
  }

  const isSaleForm = contractRequest.request_type === "buy";

  // Handle days change for rental period
  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedDays = Number(e.target.value);
    setSelectedDays(newSelectedDays);
  };

  // Handle submit button click
  const handleSubmit = async () => {
    if (!ownerEmail) {
      toast.error("Owner email not found.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await sendOtpEmail(ownerEmail);
      if (response?.success) {
        toast.success(response.message); // e.g., "OTP sent successfully"
        setIsOtpModalOpen(true); // Open OTP modal
      }
    } catch (error) {
      if(error instanceof AxiosError)
      toast.error(error.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (otp: string) => {
    try {
      const response = await verifyOtp({ email: ownerEmail, otp });
      if (response?.success) {
        toast.success(response.message); // e.g., "OTP verified successfully"
        setIsOtpModalOpen(false); // Close OTP modal
        await submitContract(); // Proceed to create contract
      }
    } catch (error) {
      if(error instanceof AxiosError)
      toast.error(error.message || "Invalid OTP. Please try again.");
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const response = await sendOtpEmail(ownerEmail);
      if (response?.success) {
        toast.success(response.message);
      }
    } catch (error) {
      if(error instanceof AxiosError)
      toast.error(error.message || "Failed to resend OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Create and submit contract
  const submitContract = async () => {
    try {
      // Prepare contract payload based on request type
      let contractData: RentalInput | SaleInput;
      const requestType = isSaleForm ? "buy" : "borrow";

      if (isSaleForm) {
        contractData = {
          buyerId: contractRequest.requesterId._id, // Assuming requesterId has _id
          ownerId: contractRequest.ownerId._id, // Assuming ownerId has _id
          bookId: contractRequest.bookId._id, // Assuming bookId has _id
          price: contractRequest.bookId.originalAmount || 0,
        } as SaleInput;
      } else {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + selectedDays);

        contractData = {
          bookId: contractRequest.bookId._id,
          borrowerId: contractRequest.requesterId._id,
          ownerId: contractRequest.ownerId._id,
          rent_amount: totalRentAmount,
          original_amount: contractRequest.bookId.originalAmount || 0,
          rent_start_date: startDate,
          rent_end_date: endDate,
          period_of_contract: selectedDays,
        } as RentalInput;
      }

      const payload: CreateContractPayload = { data: contractData };
      const response = await createContract(payload, requestType, contractRequest._id);
      
      if(!response.success){
         toast.warning(response?.message)
         setTimeout(() => {
          navigate("/purse")
         }, 700); 
         return 
      }
      if (response?.success) {
        toast.success(response.message);
        // Set contract result data for the result modal
        setContractResult({
          contractType: isSaleForm ? "sale" : "rental",
          bookName: contractRequest.bookId.name || "Unknown Book",
          ownerName: contractRequest.ownerId.Name || "Unknown Owner",
          requesterName: contractRequest.requesterId.Name || "Unknown Requester",
          amount: isSaleForm ? (contractRequest.bookId.originalAmount || 0) : totalRentAmount,
          period: isSaleForm ? undefined : selectedDays,
          contractId: response.data?._id || response.data?.contractId || undefined
        });
        
        // Open the result modal
        setIsResultModalOpen(true);
      }
    } catch (error) {
      if(error instanceof AxiosError)
        toast.error(error.message || "Failed to create contract.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-black p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">{isSaleForm ? "Sale Form" : "Rental Form"}</h1>
          <nav className="text-gray-600 text-sm space-x-3">
            {/* Navigation links */}
          </nav>
        </div>

        {/* Top Section: Book Image and Pricing */}
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 bg-gray-50 p-4 rounded-lg shadow-md border border-black">
          <div className="w-32 h-48 bg-white rounded-lg overflow-hidden shadow-md">
            <img
              src={contractRequest.bookId.images?.[0] || "https://via.placeholder.com/128x192"}
              alt={contractRequest.bookId.name || "Book Image"}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-black">
              <p className="text-gray-500 text-xs">Original Price</p>
              <p className="text-black text-lg font-semibold">Rs.{contractRequest.bookId.originalAmount || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-black">
              <p className="text-blue-600 text-xs">{isSaleForm ? "Deal Amount" : "Rent Amount"}</p>
              <p className="text-black text-lg font-semibold">
                Rs.{isSaleForm ? (contractRequest.bookId.originalAmount || 0) : totalRentAmount.toFixed(2)}
              </p>
            </div>
            {!isSaleForm && (
              <div className="bg-white p-3 rounded-lg shadow-md hover:shadow-xl transition-shadow border border-black">
                <p className="text-gray-500 text-xs">Period</p>
                <select
                  value={selectedDays}
                  onChange={handleDaysChange}
                  className="w-full bg-white text-black text-lg font-semibold p-1 rounded-lg border border-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dayIncrementOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.value} days)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Contract Details Section */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-black">
          <h2 className="text-xl font-bold text-black mb-4 border-b border-black pb-2">
            {isSaleForm ? "Sale Contract" : "Rental Contract"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Owner Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-black">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <span className="text-sm">👤</span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Owner Name</p>
                  <p className="text-black text-lg font-medium">{contractRequest.ownerId.Name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-black">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <span className="text-sm">📖</span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Book Name</p>
                  <p className="text-black text-lg font-medium">{contractRequest.bookId.name || "N/A"}</p>
                </div>
              </div>
              {isSaleForm ? (
                <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-black">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <span className="text-sm">💰</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Original Amount</p>
                    <p className="text-black text-lg font-medium">{contractRequest.bookId.originalAmount || 0} Rupee</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-black">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <span className="text-sm">⏳</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Period of Contract</p>
                    <p className="text-black text-lg font-medium">{selectedDays} Days</p>
                  </div>
                </div>
              )}
            </div>

            {/* Requester/Buyer/Borrower Details */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-black">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                  <span className="text-sm">👤</span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">{isSaleForm ? "Buyer Name" : "Borrower Name"}</p>
                  <p className="text-black text-lg font-medium">{contractRequest.requesterId.Name || "N/A"}</p>
                </div>
              </div>
              {!isSaleForm && (
                <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors border border-black">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <span className="text-sm">💰</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Rental Amount</p>
                    <p className="text-black text-lg font-medium">{totalRentAmount.toFixed(2)} Rupee</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSendingOtp}
              className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                isSendingOtp ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSendingOtp ? "Sending OTP..." : "Submit"}
            </button>
          </div>
        </div>

        {/* OTP Modal */}
        <OTPModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          isSending={isSendingOtp}
        />

        {/* Result Modal */}
        <ContractResultModal 
          isOpen={isResultModalOpen} 
          onClose={() => {
            setIsResultModalOpen(false);
            // Optionally navigate to contracts list or dashboard
            
            navigate('/contract-requests');
          }}
          contractDetails={contractResult}
        />
      </div>
    </div>
  );
};

export default ContractForm;