import React from "react";

interface ContractResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractDetails: {
    contractType: "rental" | "sale";
    bookName: string;
    ownerName: string;
    requesterName: string;
    amount: number;
    period?: number;
    contractId?: string;
    requestType:string
  } | null;
}

const ContractResultModal: React.FC<ContractResultModalProps> = ({
  isOpen,
  onClose,
  contractDetails,
}) => {
  if (!isOpen || !contractDetails) return null;

  const isSale = contractDetails.contractType === "sale";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-500 p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-700">
            {isSale ? "Sale" : "Rental"} Contract Created
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Success Icon */}
        <div className="flex justify-center my-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Contract Details */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Contract Type:</span>
            <span className="font-medium text-black">
              {isSale ? "Sale Contract" : "Rental Contract"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Book Name:</span>
            <span className="font-medium text-black">{contractDetails.bookName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Owner:</span>
            <span className="font-medium text-black">{contractDetails.ownerName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">
              {isSale ? "Buyer:" : "Borrower:"}
            </span>
            <span className="font-medium text-black">{contractDetails.requesterName}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">
              {isSale ? "Sale Amount:" : "Rental Amount:"}
            </span>
            <span className="font-medium text-black">
              ₹{contractDetails.amount.toFixed(2)}
            </span>
          </div>
          
          {!isSale && contractDetails.period && (
            <div className="flex justify-between">
              <span className="text-gray-600">Rental Period:</span>
              <span className="font-medium text-black">
                {contractDetails.period} days
              </span>
            </div>
          )}
          
          {contractDetails.contractId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Contract ID:</span>
              <span className="font-medium text-black truncate max-w-[200px]">
                {contractDetails.contractId}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            View Contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractResultModal;