import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Filter,
  RefreshCw,
  BookOpen,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { DataTable } from "@/Components/common/tablecomponent/tableComponent";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Separator } from "@/Components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Skeleton } from "@/Components/ui/skeleton";
import { useContractRequestMutations } from "@/hooks/user/contractRequest/useRequesterContractRequestMutation";
import { useContractRequests } from "@/hooks/user/contractRequest/useRequesterContractRequestQueries";
import { ContractRequest } from "@/services/contractrequest/contractRequestService";

const ContractRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cancelMutation } = useContractRequestMutations();

  // Parse query parameters
  const currentPageParam = searchParams.get("page") || "1";
  const statusParam = searchParams.get("status") || "";
  const typeParam = searchParams.get("type") || "";

  // State
  const [currentPage, setCurrentPage] = useState<number>(Number.parseInt(currentPageParam));
  const [requestType, setRequestType] = useState<string>(typeParam);
  const [requestStatus, setRequestStatus] = useState<string>(statusParam);
  const [activeTab, setActiveTab] = useState<string>(statusParam ? statusParam : "all");

  // Build filter object
  const getFilterObject = () => {
    const filter: Record<string, string> = {};
    if (requestType && requestType !== "all") filter.request_type = requestType;
    if (requestStatus && requestStatus !== "all") filter.status = requestStatus;
    return filter;
  };

  // React Query for fetching data using our custom hook
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useContractRequests(currentPage, 5, getFilterObject());

  // Update URL with filters
  const updateUrlParams = (): void => {
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    if (requestType && requestType !== "all") params.set("type", requestType);
    if (requestStatus && requestStatus !== "all") params.set("status", requestStatus);
    navigate(`/contract-requests?${params.toString()}`, { replace: true });
  };

  // Handle filter changes
  const handleTypeChange = (value: string): void => {
    setRequestType(value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string): void => {
    setActiveTab(value);

    // Set status filter based on tab
    if (value === "pending") {
      setRequestStatus("pending");
    } else if (value === "accepted") {
      setRequestStatus("accepted");
    } else if (value === "rejected") {
      setRequestStatus("rejected");
    } else if (value === "cancelled") {
      setRequestStatus("cancelled");
    } else {
      setRequestStatus("");
    }

    setCurrentPage(1);
  };

  // Handle pagination
  const handlePagePrev = (): void => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageNext = (): void => {
    if (currentPage < (data?.totalPages || 1)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePageSelect = (page: number): void => {
    setCurrentPage(page);
  };

  // Handle request actions using mutations
  const handleCancelRequest = async (requestId: string): Promise<void> => {
    cancelMutation.mutate(requestId);
  };

  const handleFixDeal = async (requestId: string): Promise<void> => {
    navigate(`/fix-deal/${requestId}`)
  };

  // Effect to update URL when filters or page changes
  useEffect(() => {
    updateUrlParams();
  }, [currentPage, requestType, requestStatus]);

  // Table columns
  const columns = [
    {
      header: "Book",
      accessor: (row: ContractRequest) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.bookId.name}</span>
          <span className="text-xs text-muted-foreground">Owner: {row.ownerId.Name}</span>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row: ContractRequest) => (
        <Badge variant={row.request_type === "borrow" ? "secondary" : "default"} className="capitalize">
          {row.request_type === "borrow" ? (
            <BookOpen className="mr-1 h-3 w-3" />
          ) : (
            <ShoppingCart className="mr-1 h-3 w-3" />
          )}
          {row.request_type}
        </Badge>
      ),
      className: "text-center",
    },
    {
      header: "Status",
      accessor: (row: ContractRequest) => {
        let icon = <Clock className="mr-1 h-3 w-3" />;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";

        if (row.status === "accepted") {
          icon = <CheckCircle className="mr-1 h-3 w-3" />;
          variant = "default";
        } else if (row.status === "rejected") {
          icon = <XCircle className="mr-1 h-3 w-3" />;
          variant = "destructive";
        } else if (row.status === "cancelled") {
          icon = <Ban className="mr-1 h-3 w-3" />;
          variant = "outline";
        }

        return (
          <Badge variant={variant} className="capitalize">
            {icon}
            {row.status}
          </Badge>
        );
      },
      className: "text-center",
    },
    {
      header: "Date",
      accessor: (row: ContractRequest) => {
        const date = new Date(row.createdAt);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString()}</div>
            <div className="text-xs text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        );
      },
    },
    {
      header: "Action",
      accessor: (row: ContractRequest) => {
        if (row.status === "pending" || row.status === "accepted") {
          return (
            <div className="flex gap-2 justify-end">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleCancelRequest(row._id)}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending && cancelMutation.variables === row._id ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : null}
                Cancel
              </Button>
              {row.status === "accepted" && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                  onClick={() => handleFixDeal(row._id)}
                >
                  Fix Deal
                </Button>
              )}
            </div>
          );
        } else {
          return null;
        }
      },
      className: "text-right",
    },
  ];

  // Empty state renderer
  const emptyStateRenderer = (): React.ReactNode => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6 rounded-full mb-4">
        <BookOpen className="h-12 w-12 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium mb-2">No contract requests found</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        You haven't made any contract requests yet or no requests match your current filters.
      </p>
      <Button
        onClick={() => {
          setRequestType("");
          setRequestStatus("");
          setActiveTab("all");
          setCurrentPage(1);
        }}
        variant="outline"
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Reset Filters
      </Button>
    </div>
  );

  // Loading state component
  const renderLoadingState = (): React.ReactNode => (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 rounded-xl p-6 mb-6 shadow-sm">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>
                <Skeleton className="h-6 w-40" />
              </CardTitle>
              <Skeleton className="h-4 w-56 mt-2" />
            </div>

            <div className="flex gap-2">
              <Skeleton className="h-10 w-[140px]" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Skeleton className="h-10 w-full mb-6" />

          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Error state component
  const renderErrorState = (): React.ReactNode => (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 rounded-xl p-6 mb-6 shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
          My Contract Requests
        </h1>
        <p className="text-muted-foreground mt-2">Manage and track all your book contract requests in one place</p>
      </div>

      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Error Loading Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Failed to load contract requests. Please try again."}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => refetch()}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
          >
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  // Render loading state for initial load
  if (isLoading && !data) {
    return renderLoadingState();
  }

  // Render error state if there's an error
  if (isError) {
    return renderErrorState();
  }

  const requests = data?.requests || [];
  const totalPages = data?.totalPages || 1;
  const totalRequests = data?.totalRequests || 0;

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 rounded-xl p-6 mb-6 shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
          My Contract Requests
        </h1>
        <p className="text-muted-foreground mt-2">Manage and track all your book contract requests in one place</p>
      </div>

      <Card className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Contract Requests</CardTitle>
              <CardDescription>You have made {totalRequests} contract requests in total</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={requestType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="All Types" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="borrow">Borrow</SelectItem>
                  <SelectItem value="buy">Buy</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => refetch()} 
                className="h-10 w-10" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="px-6">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <Separator className="mb-4" />

          <TabsContent value={activeTab} className="mt-0">
            <CardContent className="p-0">
              {isLoading && data ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <DataTable
                  data={requests}
                  columns={columns}
                  isLoading={false}
                  emptyStateRenderer={emptyStateRenderer}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPagePrev={handlePagePrev}
                  onPageNext={handlePageNext}
                  onPageSelect={handlePageSelect}
                  showPagination={true}
                />
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Showing page {currentPage} of {totalPages} • {totalRequests} total requests
        </p>
      </div>
    </div>
  );
};

export default ContractRequestsPage;