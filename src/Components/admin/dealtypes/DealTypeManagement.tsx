import React, { useState, useEffect } from "react";
import { Search, Edit, Loader2, Plus } from "lucide-react";
import { Pagination1 } from "@/Components/common/pagination/pagination1";
import { DealType } from "@/services/admin/adminService";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/Components/ui/table";
import AddorEditDealTypeModal from "./AddorEditDealType";
import { useDealTypeMutations } from "@/hooks/admin/dealtypeHooks/useCategoryMutation";
import { useDealTypesQuery } from "@/hooks/admin/dealtypeHooks/useDealTypeFetch";
import { useDebounce } from "@/Components/common/useDebounceHook/useDebounce";

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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : dealTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No deal types found.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Published At</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dealTypes.map((dealType: DealType) => (
                    <TableRow key={dealType._id} className="border-b hover:bg-muted/50">
                      <TableCell className="font-medium">{dealType.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {dealType.description || <span className="italic">No description</span>}
                      </TableCell>
                      <TableCell>{new Date(dealType.createdAt as string).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dealType.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {dealType.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination1
                currentPage={currentPage}
                totalPages={totalPages}
                onPagePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                onPageNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                onPageSelect={setCurrentPage}
              />
            </div>
          )}
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