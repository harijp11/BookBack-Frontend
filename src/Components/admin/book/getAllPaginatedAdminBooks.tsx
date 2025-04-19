import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/ui/toast';
import { DataTable } from '@/Components/common/tablecomponent/tableComponent';
import { BookOpen, Filter, Search } from 'lucide-react';
import FilterSidebar from '@/Components/common/FilterSidebar/filterSideBar';
import { IBook } from '@/services/book/bookService';

// Import custom hooks
import { usePaginatedBooks,BookSearchParams } from '@/hooks/admin/bookHooks/useBookFetch';
import { useAdminCategories } from '@/hooks/admin/categoryHooks/useFetchCategories';
import { useAdminDealTypes } from '@/hooks/admin/dealtypeHooks/useFetchCategories';
import { useBookStatusMutation } from '@/hooks/admin/bookHooks/useBookMutation';

const AdminPaginatedBooksComponent: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<Record<string, unknown>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Create the query params object
  const queryParams: BookSearchParams = {
    search: searchTerm,
    filter,
    page: currentPage,
    limit: 5 // You can make this configurable if needed
  };

  // Use custom hooks for API calls
  const categoriesQuery = useAdminCategories();
  const dealTypesQuery = useAdminDealTypes();
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = usePaginatedBooks(queryParams);

  // Use the book status mutation hook
  const statusMutation = useBookStatusMutation({
    onSuccess: refetch
  });

  useEffect(() => {
    if (data && searchTerm && data.books.length === 0) {
      toast.info(`No books found for "${searchTerm}"`);
    }
  }, [data, searchTerm, toast]);

  useEffect(() => {
    if (isError && error) {
      toast.error(`Failed to load books: ${(error as Error).message || 'Unknown error'}`);
    }
  }, [isError, error, toast]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilter({ ...filter, [key]: value });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleToggleActiveStatus = async (bookId: string) => {
    statusMutation.mutate(bookId);
  };

  const toggleFilterSidebar = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const clearFilter = () => {
    setFilter({});
  };

  const handlePagePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageNext = () => {
    if (data && currentPage < data.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const renderEmptyState = () => (
    <div className="flex flex-col justify-center items-center py-16 text-gray-500">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <BookOpen className="h-10 w-10 text-gray-400" />
      </div>
      <p className="text-xl font-medium mb-2">No books found</p>
      <p className="text-gray-500 text-center max-w-md">
        Try adjusting your search or filters to find books.
      </p>
    </div>
  );

  const columns = [
    {
      header: 'Image',
      accessor: (book: IBook) => (
        <button
          onClick={() => navigate(`/book/${book._id}`)}
          className="focus:outline-none"
        >
          {book.images && book.images.length > 0 ? (
            <img
              src={book.images[0]}
              alt={book.name}
              className="h-14 w-14 rounded-lg object-cover shadow-sm hover:opacity-80 transition-opacity"
            />
          ) : (
            <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </button>
      ),
      className: 'w-20',
    },
    {
      header: 'Name',
      accessor: (book: IBook) => (
        <button
          onClick={() => navigate(`/book/${book._id}`)}
          className="font-medium text-gray-900 hover:text-primary transition-colors focus:outline-none"
        >
          {book.name}
        </button>
      ),
    },
    {
      header: 'Category',
      accessor: (book: IBook) => (
        <div className="text-gray-900">
          {categoriesQuery.data?.find(cat => cat._id === book.categoryId._id)?.name || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Deal Type',
      accessor: (book: IBook) => (
        <div className="text-gray-900">
          {dealTypesQuery.data?.find(deal => deal._id === book.dealTypeId._id)?.name || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Rent',
      accessor: (book: IBook) => (
        <div className="font-medium text-gray-900">
          {formatCurrency(book.rentAmount)}
          <span className="text-xs text-gray-500">/day</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (book: IBook) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            book.status === 'Available'
              ? 'bg-green-100 text-green-800'
              : book.status === 'Borrowed'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
              book.status === 'Available'
                ? 'bg-green-500'
                : book.status === 'Borrowed'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
          ></span>
          {book.status}
        </span>
      ),
    },
    {
      header: 'Active',
      accessor: (book: IBook) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            book.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
              book.isActive ? 'bg-green-500' : 'bg-gray-500'
            }`}
          ></span>
          {book.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (book: IBook) => (
        <div className="flex space-x-1">
          {book.isActive ? (
            <button
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-600 hover:text-white hover:bg-red-600 transition-colors focus:outline-none"
              onClick={() => handleToggleActiveStatus(book._id)}
              disabled={statusMutation.isPending}
            >
              Deactivate
            </button>
          ) : (
            <button
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-600 hover:text-white hover:bg-green-600 transition-colors focus:outline-none"
              onClick={() => handleToggleActiveStatus(book._id)}
              disabled={statusMutation.isPending}
            >
              Activate
            </button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  const filterConfig = [
    {
      key: 'categoryId',
      label: 'Category',
      options:
        categoriesQuery.data?.map((category) => ({
          value: category._id,
          label: category.name,
        })) || [],
      isLoading: categoriesQuery.isLoading,
    },
    {
      key: 'dealTypeId',
      label: 'Deal Type',
      options:
        dealTypesQuery.data?.map((dealType) => ({
          value: dealType._id,
          label: dealType.name,
        })) || [],
      isLoading: dealTypesQuery.isLoading,
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Available', label: 'Available' },
        { value: 'Borrowed', label: 'Borrowed' },
        { value: 'Sold Out', label: 'Sold Out' },
      ],
      isLoading: false,
    },
    {
      key: 'isActive',
      label: 'Active',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
      isLoading: false,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Books</h1>
      </div>

      <div className="lg:hidden mb-4">
        <button
          onClick={toggleFilterSidebar}
          className="w-full flex items-center justify-center space-x-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200"
        >
          <Filter className="h-5 w-5 text-gray-500" />
          <span>{isFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterSidebar
            filters={filter}
            filterConfig={filterConfig}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilter}
            isOpen={isFilterOpen}
            onToggle={toggleFilterSidebar}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="mb-6">
            <form onSubmit={handleSearch}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search books by title, author, or category..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full px-4 pl-10 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <div className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {isError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700">
                  Error loading books: {(error as Error)?.message || 'Unknown error'}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <DataTable
              data={data?.books || []}
              columns={columns}
              isLoading={isLoading}
              emptyMessage="No books found."
              emptyStateRenderer={renderEmptyState}
              currentPage={currentPage}
              totalPages={data?.totalPages || 1}
              onPagePrev={handlePagePrev}
              onPageNext={handlePageNext}
              onPageSelect={handlePageSelect}
              showPagination={!!(data?.totalPages && data.totalPages > 1)}
            />

            {data?.books && data.books.length > 0 && (
              <div className="px-6 py-3 bg-white border-t border-gray-200 rounded-b-xl">
                <div className="text-sm text-gray-700 text-center">
                  Showing <span className="font-medium">{data.books.length}</span> of{' '}
                  <span className="font-medium">{data.totalBooks}</span> books
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaginatedBooksComponent;