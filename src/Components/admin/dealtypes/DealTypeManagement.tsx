import React, { useState, useEffect } from "react";
import { Search, Edit, Loader2, Plus } from "lucide-react";
import { DealType } from "@/services/admin/adminService";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import AddorEditDealTypeModal from "./AddorEditDealType";
import { useDealTypeMutations } from "@/hooks/admin/dealtypeHooks/useDealTypeMutation";
import { useDealTypesQuery } from "@/hooks/admin/dealtypeHooks/useDealTypeFetch";
import { useDebounce } from "@/Components/common/useDebounceHook/useDebounce";
import { DataTable } from "@/Components/common/tablecomponent/tableComponent"; // Import our new component

const DealTypeManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDealType, setSelectedDealType] = useState<DealType | null>(null);

  // Use debounce hook for search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const ITEMS_PER_PAGE = 5;
  
  const { toggleStatusMutation } = useDealTypeMutations();
  
  // Use the debounced search query with the deal types query hook
  const {
    dealTypes,
    totalPages,
    isLoading,
    refetch
  } = useDealTypesQuery({
    currentPage,
    searchQuery: debouncedSearchQuery,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // Refetch when debounced search query changes
  useEffect(() => {
    refetch();
  }, [debouncedSearchQuery, refetch]);

  const handleToggleStatus = (dealTypeId: string) => {
    toggleStatusMutation.mutate(dealTypeId);
  };

  // Functions for modal handling
  const handleEditDealType = (dealType: DealType) => {
    setSelectedDealType(dealType);
    setIsModalOpen(true);
  };

  const handleAddDealType = () => {
    setSelectedDealType(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDealType(null);
  };

  const handleDealTypeSuccess = () => {
    refetch();
  };

  // Define columns for the DataTable
  const columns = [
    { 
      header: "Name", 
      accessor: "name" as const
    },
    { 
      header: "Description", 
      accessor: (dealType: DealType) => 
        dealType.description || <span className="italic">No description</span>
    },
    { 
      header: "Published At", 
      accessor: (dealType: DealType) => 
        new Date(dealType.createdAt as string).toLocaleDateString()
    },
    { 
      header: "Status", 
      accessor: (dealType: DealType) => (
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            dealType.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}
        >
          {dealType.isActive ? "Active" : "Inactive"}
        </span>
      ),
      className: "text-center"
    },
    { 
      header: "Actions", 
      accessor: (dealType: DealType) => (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditDealType(dealType)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button 
            variant={dealType.isActive ? "destructive" : "outline"} 
            size="sm" 
            onClick={() => handleToggleStatus(dealType._id)}
            disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables === dealType._id}
          >
            {toggleStatusMutation.isPending && toggleStatusMutation.variables === dealType._id ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            {dealType.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
      className: "text-center"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold">Deal Type Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex w-full sm:w-auto">
                <Input
                  type="search"
                  placeholder="Search deal types..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-r-none w-full"
                />
                <Button 
                  onClick={() => refetch()} 
                  className="rounded-l-none"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              <Button 
                variant="default" 
                size="default" 
                className="w-full sm:w-auto" 
                onClick={handleAddDealType}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Deal Type
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={dealTypes}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No deal types found."
            currentPage={currentPage}
            totalPages={totalPages}
            onPagePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onPageNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            onPageSelect={setCurrentPage}
          />
        </CardContent>
      </Card>
      
      {/* Add the modal component */}
      <AddorEditDealTypeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleDealTypeSuccess}
        dealType={selectedDealType}
      />
    </div>
  );
};

export default DealTypeManagement;