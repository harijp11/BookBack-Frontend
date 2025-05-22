"use client"

import type React from "react"
import { useState } from "react"
import { type ContractRequest } from "@/services/contractrequest/contractRequestService"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card"
import { Button } from "@/Components/ui/button"
import { Badge } from "@/Components/ui/badge"
import { Check, X, BookOpen, User, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { useOwnerContractRequests, useUpdateContractRequestStatus } from "@/hooks/user/contractRequest/useOwnerUpdateContractRequestStatus"

export default function OwnerContractRequestHandling() {
// Pagination state
const PAGE_SIZE = 3
const [currentPage, setCurrentPage] = useState(1)

// In a real app, you would get this from auth context or similar
const user = useSelector((state: RootState) => state.user.User)

// Use our custom hooks for data fetching and mutations
const {
data: requests = [],
isLoading,
error
} = useOwnerContractRequests()

const updateRequestStatusMutation = useUpdateContractRequestStatus()

// Calculate total pages
const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE))

const handleUpdateStatus = async (conReqId: string, status: string) => {
updateRequestStatusMutation.mutate({ conReqId, status })
}

const getStatusBadge = (status: string) => {
switch (status) {
case "pending":
return <Badge className="bg-gradient-to-r from-amber-200 to-amber-300 text-amber-900 border-0">Pending</Badge>
case "accepted":
return (
<Badge className="bg-gradient-to-r from-emerald-200 to-emerald-300 text-emerald-900 border-0">Accepted</Badge>
)
case "rejected":
return <Badge className="bg-gradient-to-r from-rose-200 to-rose-300 text-rose-900 border-0">Rejected</Badge>
case "cancelled":
return <Badge className="bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 border-0">Cancelled</Badge>
default:
return <Badge>{status}</Badge>
}
}

const formatDate = (date: Date) => {
return new Date(date).toLocaleDateString("en-US", {
year: "numeric",
month: "short",
day: "numeric",
})
}

// Handle page navigation
const goToNextPage = () => {
if (currentPage < totalPages) {
setCurrentPage(currentPage + 1)
}
}

const goToPrevPage = () => {
if (currentPage > 1) {
setCurrentPage(currentPage - 1)
}
}

// Get current page data
const getCurrentPageData = () => {
const startIndex = (currentPage - 1) * PAGE_SIZE
const endIndex = startIndex + PAGE_SIZE
return requests.slice(startIndex, endIndex)
}

// If user is not loaded yet, show loading state
if (!user?._id) {
return (
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
<div className="container mx-auto py-10 px-4 sm:px-6">
<div className="flex justify-center items-center h-64">
<div className="h-16 w-16 relative">
<div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-gray-800 dark:border-white animate-spin"></div>
<div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-gray-300 dark:border-gray-700 animate-spin animation-delay-150"></div>
</div>
</div>
</div>
</div>
)
}

const currentPageData = getCurrentPageData()

return (
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
<div className="container mx-auto py-10 px-4 sm:px-6">
<div className="mb-8">
<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
<div>
<h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
Book Requests
</h1>
<p className="text-gray-500 dark:text-gray-400 mt-1">Manage your incoming book requests</p>
</div>
</div>
</div>

{isLoading ? (
<div className="flex justify-center items-center h-64">
<div className="h-16 w-16 relative">
<div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-gray-800 dark:border-white animate-spin"></div>
<div className="absolute inset-2 rounded-full border-r-2 border-l-2 border-gray-300 dark:border-gray-700 animate-spin animation-delay-150"></div>
</div>
</div>
) : error ? (
<div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
<div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
<X className="h-10 w-10 text-red-500 dark:text-red-400" />
</div>
<h3 className="text-xl font-medium mb-2">Error loading requests</h3>
<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
There was a problem loading your book requests. Please try again later.
</p>
</div>
) : (requests && requests.length === 0) ? (
<div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
<div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
<BookOpen className="h-10 w-10 text-gray-500 dark:text-gray-400" />
</div>
<h3 className="text-xl font-medium mb-2">No requests found</h3>
<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
You don't have any pending book requests at the moment. Check back later or refresh to update.
</p>
</div>
) : (
<>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
{currentPageData.map((request) => (
<RequestCard
key={request._id}
request={request}
onUpdateStatus={handleUpdateStatus}
formatDate={formatDate}
getStatusBadge={getStatusBadge}
// isUpdating={updateRequestStatusMutation.isPending}
/>
))}
</div>

{/* Pagination Controls */}
<div className="flex justify-between items-center mt-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
<div className="text-sm text-gray-500 dark:text-gray-400">
Showing {Math.min(requests.length, (currentPage - 1) * PAGE_SIZE + 1)}-
{Math.min(requests.length, currentPage * PAGE_SIZE)} of {requests.length} requests
</div>
<div className="flex gap-2">
<Button
variant="outline"
size="sm"
onClick={goToPrevPage}
disabled={currentPage === 1}
className="flex items-center gap-1"
>
<ChevronLeft className="h-4 w-4" />
Previous
</Button>
<div className="flex items-center gap-1">
{Array.from({ length: totalPages }, (_, index) => (
<Button
key={index + 1}
variant={currentPage === index + 1 ? "default" : "outline"}
size="sm"
onClick={() => setCurrentPage(index + 1)}
className="w-8 h-8"
>
{index + 1}
</Button>
))}
</div>
<Button
variant="outline"
size="sm"
onClick={goToNextPage}
disabled={currentPage === totalPages}
className="flex items-center gap-1"
>
Next
<ChevronRight className="h-4 w-4" />
</Button>
</div>
</div>
</>
)}
</div>
</div>
)
}


interface RequestCardProps {
  request: ContractRequest
  onUpdateStatus: (bookId: string, status: string) => Promise<void>
  formatDate: (date: Date) => string
  getStatusBadge: (status: string) => React.ReactNode
}

function RequestCard({ request, onUpdateStatus, formatDate, getStatusBadge }: RequestCardProps) {
  const isPending = request.status === "pending"

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="h-2 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-600 dark:to-gray-400"></div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold">{request.bookId?.name || 'Unnamed Book'}</CardTitle>
          {getStatusBadge(request.status)}
        </div>
        <CardDescription className="flex items-center gap-1.5 mt-1">
          <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
          Request type: {request.request_type === "borrow" ? "Borrow" : "Buy"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
              <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requester</p>
              <p className="font-medium">{request.requesterId?.Name || 'Unknown User'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
              <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Book</p>
              <p className="font-medium">{request.bookId?.name || 'Unnamed Book'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Requested on</p>
              <p className="font-medium">{formatDate(request.createdAt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 dark:border-gray-700">
        {isPending ? (
          <div className="flex gap-3 w-full">
            <Button
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
              onClick={() => onUpdateStatus(request._id, "accepted")}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              onClick={() => onUpdateStatus(request._id, "rejected")}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="w-full py-2 px-4 rounded-md bg-gray-50 dark:bg-gray-900/50 text-center text-sm text-gray-500 dark:text-gray-400">
            This request has been {request.status}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}