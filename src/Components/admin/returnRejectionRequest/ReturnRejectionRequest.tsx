"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useReturnRejectionRequests } from "@/hooks/admin/returnRejectionRequestsHooks/useReturnRejectionQueries";
import ReturnRejectionCard from "./ReturnRejectionCard";
import { Pagination1 } from "@/Components/common/pagination/pagination1";
import { Loader2, AlertTriangle } from "lucide-react";

interface UserInfo {
  Name?: string; // Capitalized, optional to match API
  email: string;
}

interface TopComplaint {
  _id: string;
  count: number;
  user: UserInfo;
}

const ReturnRejectionRequestPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<{}>({});
  const [isFiltering, setIsFiltering] = useState(false);
  const limit = 1;

  const { data, isLoading, error, isFetching } = useReturnRejectionRequests({
    filter,
    page: currentPage,
    limit,
  });

  const handlePagePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageNext = () => {
    if (data && currentPage < data.totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  const handleUserFilter = (userId: string, type: "owner" | "borrower") => {
    setIsFiltering(true);
    setFilter(type === "owner" ? { ownerId: userId } : { borrowerId: userId });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilter = () => {
    setIsFiltering(true);
    setFilter({});
    setCurrentPage(1);
  };

  // Reset filtering state when fetch completes
  React.useEffect(() => {
    if (!isFetching) {
      setIsFiltering(false);
    }
  }, [isFetching]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (error || !data || !data.success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md border border-gray-200">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-black mb-2">Error</h2>
          <p className="text-gray-600">
            {data?.message || "Failed to load return rejection requests."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    topFiveMostComplaintedBy,
    topFiveMostComplaintedAgainst,
    returnRejectionRequest,
    totalPages,
    currentPage: serverPage,
    totalReturnRejectionRequest,
  } = data;

  return (
    <div className="min-h-screen bg-white text-black font-sans py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-4">
            Return Rejection Requests
          </h1>
          <p className="text-gray-600">
            Total Requests: {totalReturnRejectionRequest}
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Top Complained By (Owners) */}
          <motion.div
            className="flex-1 bg-white border border-gray-200 rounded-lg shadow-md p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-black mb-4">
              Top 5 Complained By (Owners)
            </h2>
            {topFiveMostComplaintedBy.length === 0 ? (
              <p className="text-gray-500">No data available.</p>
            ) : (
              <ul className="space-y-3">
                {topFiveMostComplaintedBy.map((complaint: TopComplaint) => (
                  <li
                    key={complaint._id}
                    className="p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleUserFilter(complaint._id, "owner")}
                  >
                    <p className="font-medium text-black">
                      {complaint.user.Name || complaint.user.email}
                    </p>
                    <p className="text-sm text-gray-600">{complaint.user.email}</p>
                    <p className="text-sm text-gray-500">
                      Complaints: {complaint.count}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Top Complained Against (Borrowers) */}
          <motion.div
            className="flex-1 bg-white border border-gray-200 rounded-lg shadow-md p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-black mb-4">
              Top 5 Complained Against (Borrowers)
            </h2>
            {topFiveMostComplaintedAgainst.length === 0 ? (
              <p className="text-gray-500">No data available.</p>
            ) : (
              <ul className="space-y-3">
                {topFiveMostComplaintedAgainst.map((complaint: TopComplaint) => (
                  <li
                    key={complaint._id}
                    className="p-3 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleUserFilter(complaint._id, "borrower")}
                  >
                    <p className="font-medium text-black">
                      {complaint.user.Name || complaint.user.email}
                    </p>
                    <p className="text-sm text-gray-600">{complaint.user.email}</p>
                    <p className="text-sm text-gray-500">
                      Complaints: {complaint.count}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>

        {/* Filter Clear Button */}
        {Object.keys(filter).length > 0 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={clearFilter}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Clear Filter
            </button>
          </motion.div>
        )}

        {/* Request Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {isFiltering || isFetching ? (
            <div className="col-span-full text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
              <p className="text-gray-600 mt-2">Loading requests...</p>
            </div>
          ) : returnRejectionRequest.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No return rejection requests found.
            </div>
          ) : (
            returnRejectionRequest.map((request) => (
              <ReturnRejectionCard key={request._id} request={request} />
            ))
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination1
            currentPage={serverPage}
            totalPages={totalPages}
            onPagePrev={handlePagePrev}
            onPageNext={handlePageNext}
            onPageSelect={handlePageSelect}
          />
        )}
      </div>
    </div>
  );
};

export default ReturnRejectionRequestPage;