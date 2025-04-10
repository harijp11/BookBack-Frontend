import React, { useState, useEffect } from "react";
import { Search, Edit, Loader2, Plus } from "lucide-react";
import { CategoryType } from "@/services/admin/adminService";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import AddorEditCategoryModal from "./AddorEditCategory";
import { useCategoryMutations } from "@/hooks/admin/categoryHooks/useCategoryMutation";
import { useCategoriesQuery } from "@/hooks/admin/categoryHooks/useCategoryFetch";
import { useDebounce } from "@/Components/common/useDebounceHook/useDebounce";
import { DataTable } from "@/Components/common/tablecomponent/tableComponent"; // Import our reusable DataTable component

const CategoryManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);

  // Use debounce hook for search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const ITEMS_PER_PAGE = 5;
  
  const { toggleStatusMutation } = useCategoryMutations();
  
  // Use the debounced search query with the categories query hook
  const {
    categories,
    totalPages,
    isLoading,
    refetch
  } = useCategoriesQuery({
    currentPage,
    searchQuery: debouncedSearchQuery,
    itemsPerPage: ITEMS_PER_PAGE
  });

  // Refetch when debounced search query changes
  useEffect(() => {
    refetch();
  }, [debouncedSearchQuery, refetch]);

  const handleToggleStatus = (categoryId: string) => {
    toggleStatusMutation.mutate(categoryId);
  };

  // Functions for modal handling
  const handleEditCategory = (category: CategoryType) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCategorySuccess = () => {
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
      accessor: (category: CategoryType) => 
        category.description || <span className="italic">No description</span>
    },
    { 
      header: "Published At", 
      accessor: (category: CategoryType) => 
        new Date(category.createdAt as string).toLocaleDateString()
    },
    { 
      header: "Status", 
      accessor: (category: CategoryType) => (
        <span 
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            category.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}
        >
          {category.isActive ? "Active" : "Inactive"}
        </span>
      ),
      className: "text-center"
    },
    { 
      header: "Actions", 
      accessor: (category: CategoryType) => (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEditCategory(category)}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button 
            variant={category.isActive ? "destructive" : "outline"} 
            size="sm" 
            onClick={() => handleToggleStatus(category._id)}
            disabled={toggleStatusMutation.isPending && toggleStatusMutation.variables === category._id}
          >
            {toggleStatusMutation.isPending && toggleStatusMutation.variables === category._id ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            {category.isActive ? "Deactivate" : "Activate"}
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
            <CardTitle className="text-2xl font-bold">Category Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex w-full sm:w-auto">
                <Input
                  type="search"
                  placeholder="Search categories..."
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
                onClick={handleAddCategory}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={categories}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No categories found."
            currentPage={currentPage}
            totalPages={totalPages}
            onPagePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onPageNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            onPageSelect={setCurrentPage}
          />
        </CardContent>
      </Card>
      
      {/* Add the modal component */}
      <AddorEditCategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleCategorySuccess}
        category={selectedCategory}
      />
    </div>
  );
};

export default CategoryManagement;