import React from "react";
import { motion } from "framer-motion";
import { renewal_details } from "@/services/rental/rentalService";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { useUpdateReturnRejectionMutation } from "@/hooks/admin/returnRejectionRequestsHooks/useReturnRejectionRequestMutation";
import { useQueryClient } from "@tanstack/react-query";
import { AdminReturnRejectionResponse } from "@/services/return_rejection_request/returnRejectionRequestService";

export interface UserInfo {
  _id: string;
  Name?: string;
  email: string;
  phoneNumber?: string;
}

export interface Book {
  _id: string;
  name: string;
  images: string[];
}

export interface RentalContract {
  _id: string;
  borrowerId: string;
  ownerId: string;
  bookId: Book;
  rent_amount: number;
  original_amount: number;
  rent_start_date: Date;
  rent_end_date: Date;
  period_of_contract: number;
  status:
    | "Returned"
    | "Return Requested"
    | "On Rental"
    | "Return Rejected"
    | "Contract Date Exceeded"
    | "Return Rejection Requested";
  renewal_status: "No Renewal" | "Renewal Requested" | "Renewal Rejected" | "Renewed";
  renewal_details: renewal_details[] | [];
  requested_at: Date;
  returned_at: Date | null;
  penalty_amount: number;
  created_at: Date;
  updated_at: Date;
}

interface ReturnRejectionItem {
  _id: string;
  rentId: RentalContract;
  borrowerId: UserInfo;
  ownerId: UserInfo;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface ReturnRejectionCardProps {
  request: ReturnRejectionItem;
}

const ReturnRejectionCard: React.FC<ReturnRejectionCardProps> = ({ request }) => {
  const queryClient = useQueryClient();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateReturnRejectionMutation();

  const updateCache = (newStatus: "accepted" | "rejected") => {
    // Get all queries matching ["returnRejectionRequests"]
    const queries = queryClient.getQueriesData<AdminReturnRejectionResponse>({
      queryKey: ["returnRejectionRequests"],
    });

    // Update each matching query
    queries.forEach(([queryKey, oldData]) => {
      if (!oldData || !oldData.returnRejectionRequest) return;

      const updatedData = {
        ...oldData,
        returnRejectionRequest: oldData.returnRejectionRequest.map((item) =>
          item._id === request._id ? { ...item, status: newStatus } : item
        ),
      };

      queryClient.setQueryData(queryKey, updatedData);
    });
  };

  const handleAccept = () => {
    updateStatus(
      {
        retRejId: request._id,
        status: { status: "accepted" },
      },
      {
        onSuccess: () => {
          updateCache("accepted");
        },
      }
    );
  };

  const handleReject = () => {
    updateStatus(
      {
        retRejId: request._id,
        status: { status: "rejected" },
      },
      {
        onSuccess: () => {
          updateCache("rejected");
        },
      }
    );
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200";
      case "accepted":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-6">
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Return Rejection Request
            </CardTitle>
            <Badge
              className={`${getStatusBadgeStyles(request.status)} px-3 py-1.5 text-xs font-semibold uppercase tracking-wider`}
            >
              {request.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Book preview with details */}
          <div className="flex gap-5 p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
            <div className="relative">
              <img
                src={
                  request.rentId.bookId.images[0] ||
                  "https://via.placeholder.com/150x200?text=No+Image"
                }
                alt={request.rentId.bookId.name || "Book"}
                className="w-24 h-32 object-cover rounded-md shadow-md border border-gray-200"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/150x200?text=No+Image";
                }}
              />
              <div className="absolute top-[-8px] right-[-8px] bg-white shadow-sm border border-gray-100 text-xs font-bold p-1 rounded-full">
                ₹{request.rentId.original_amount?.toFixed(0)}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold text-gray-800 text-lg">
                {request.rentId.bookId.name || "Unknown Book"}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Rental Amount:</span>
                  <p className="font-medium text-blue-700">₹{request.rentId.rent_amount?.toFixed(2) || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Original Price:</span>
                  <p className="font-medium text-gray-700">₹{request.rentId.original_amount?.toFixed(2) || "N/A"}</p>
                </div>
              </div>
              <p className="text-sm mt-2">
                <span className="text-gray-500 font-medium">Reason: </span>
                <span className="text-gray-700">{request.reason || "No reason provided"}</span>
              </p>
            </div>
          </div>

          {/* Owner and borrower details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 transition-transform hover:scale-[1.02] shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                Owner Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 items-center">
                  <span className="text-gray-500">Name:</span>
                  <span className="col-span-2 text-gray-800 font-medium">{request.ownerId.Name || request.ownerId.email}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="text-gray-500">Email:</span>
                  <span className="col-span-2 text-gray-800 font-medium truncate">{request.ownerId.email}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="text-gray-500">Phone:</span>
                  <span className="col-span-2 text-gray-800 font-medium">{request.ownerId.phoneNumber || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 transition-transform hover:scale-[1.02] shadow-sm">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Borrower Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 items-center">
                  <span className="text-gray-500">Name:</span>
                  <span className="col-span-2 text-gray-800 font-medium">{request.borrowerId.Name || request.borrowerId.email}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="text-gray-500">Email:</span>
                  <span className="col-span-2 text-gray-800 font-medium truncate">{request.borrowerId.email}</span>
                </div>
                <div className="grid grid-cols-3 items-center">
                  <span className="text-gray-500">Phone:</span>
                  <span className="col-span-2 text-gray-800 font-medium">{request.borrowerId.phoneNumber || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gradient-to-r from-white to-gray-50 border-t border-gray-100 p-6">
          <div className="flex justify-end gap-3 w-full">
            {request.status === "pending" ? (
              <>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="shadow-sm hover:shadow-md transition-all px-5"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Processing..." : "Reject"}
                </Button>
                <Button
                  onClick={handleAccept}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-sm hover:shadow-md transition-all px-5"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Processing..." : "Accept"}
                </Button>
              </>
            ) : (
              <p
                className={`text-sm font-medium ${
                  request.status === "accepted" ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                Return Rejection Request {request.status === "accepted" ? "Accepted" : "Rejected"}
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ReturnRejectionCard;