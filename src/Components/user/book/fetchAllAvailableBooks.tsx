"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Category, 
  DealType, 
  IBook,
} from "@/services/book/bookService";
import { getAllCategories } from "@/services/category/categoryService";
import { getAllDealTypes } from "@/services/dealtype/dealTypeService";
import { LocationPicker } from "@/common/maping/LocationPickerComponent";
import { Pagination1 } from "@/Components/common/pagination/pagination1";
import { useToast } from "@/hooks/ui/toast";
import { useAvailableBooks } from "@/hooks/common/useBookQueries";

export interface GetBooksByLocationInput {
  latitude: number;
  longitude: number;
  maxDistance:number
  page?: number;
  limit?: number;
  search?: string; 
  filters?: Record<string, object>;
  sort?:Record<string, object>
}

interface FilterState {
  categoryId?: string;
  dealTypeId?: string;
}

interface SortState {
  field: string;
  order: 1 | -1;
}

const BooksFetchPageInner: React.FC = () => {
  // State for location
  const [location, setLocation] = useState<{
    name: string;
    point1: [number, number];
    point2: [number, number] | null;
  }>({
    name: "",
    point1: [51.505, -0.09], // Default to London
    point2: null,
  });

  // State for filters, sorting, and pagination
  const [filters, setFilters] = useState<FilterState>({});
  const [sort, setSort] = useState<SortState>({ field: "createdAt", order: 1 }); // Default sort by distance ascending
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5); // Match backend default
  const [search, setSearch] = useState<string>("");

  // State for categories and deal types
  const [categories, setCategories] = useState<Category[]>([]);
  const [dealTypes, setDealTypes] = useState<DealType[]>([]);

  // Use toast hook
  const { toast, error, success } = useToast();

  // Construct query params
  const queryParams: GetBooksByLocationInput = {
    latitude: location.point1[0],
    longitude: location.point1[1],
    maxDistance: 5000, // 5km radius, adjust as needed
    page,
    limit,
    search: search || undefined,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    sort: { [sort.field]: sort.order }, // Send sort as object, e.g., { name: 1 }
  };

  // Use the custom hook for fetching books
  const { 
    data: booksResponse, 
    isLoading: loading, 
    refetch: fetchBooks,
    isError
  } = useAvailableBooks(queryParams);

  useEffect(() => {
    if (isError) {
      error("Failed to fetch books");
    } else if (booksResponse) {
      if (booksResponse.books.length > 0) {
        success(`Found ${booksResponse.totalBooks} books nearby`);
      } else {
        toast("No books found for the selected criteria", "info");
      }
    }
  }, []);

  // Fetch categories and deal types on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesData, dealTypesData] = await Promise.all([
          getAllCategories(),
          getAllDealTypes(),
        ]);
        setCategories(categoriesData);
        setDealTypes(dealTypesData);
        success("Categories and deal types loaded successfully");
      } catch (err) {
        error("Failed to load categories and deal types");
      }
    };
    fetchMetadata();
  }, []);

  // Trigger fetch when dependencies change
  useEffect(() => {
    if (location.point1) {
      fetchBooks();
    } else {
      error("Please select a location");
    }
  }, []);

  // Handle location change from LocationPicker
  const handleLocationChange = (
    name: string,
    point1: [number, number],
    point2: [number, number] | null
  ) => {
    setLocation({ name, point1, point2 });
    setPage(1); // Reset to first page on location change
  };

  // Handle filter changes
  const handleFilterChange = (
    key: keyof FilterState,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPage(1); // Reset to first page on filter change
  };

  // Handle sort change
  const handleSortChange = (field: string, order: 1 | -1) => {
    setSort({ field, order });
    setPage(1); // Reset to first page on sort change
  };

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search change
  };

  // Handle pagination
  const handlePagePrev = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handlePageNext = () => {
    setPage((prev) => Math.min(prev + 1, booksResponse?.totalPages || 1));
  };

  const handlePageSelect = (newPage: number) => {
    setPage(newPage);
  };

  // CSS styles
  const styles = `
    .books-fetch-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .filters-container {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .filter-select, .search-input {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      min-width: 200px;
    }
    .books-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .book-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .book-card h3 {
      margin: 0 0 10px;
      font-size: 1.2rem;
    }
    .loading-message {
      text-align: center;
      margin-bottom: 20px;
    }
    .book-image {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .sort-container {
      display: flex;
      gap: 10px;
    }
  `;

  return (
    <motion.div
      className="books-fetch-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <style>{styles}</style>

      <h1 className="text-2xl font-bold mb-6">Find Books Nearby</h1>

      {/* Location Picker */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Select Location</h2>
        <LocationPicker
          onLocationChange={handleLocationChange}
          initialLocations={{
            point1: location.point1,
            point2: location.point2,
            locationName: location.name,
          }}
          liveLocationEnabled={true}
        />
      </div>

      {/* Filters and Search */}
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select
          value={filters.categoryId || ""}
          onChange={(e) =>
            handleFilterChange("categoryId", e.target.value || undefined)
          }
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filters.dealTypeId || ""}
          onChange={(e) =>
            handleFilterChange("dealTypeId", e.target.value || undefined)
          }
          className="filter-select"
        >
          <option value="">All Deal Types</option>
          {dealTypes.map((deal) => (
            <option key={deal._id} value={deal._id}>
              {deal.name}
            </option>
          ))}
        </select>
        <div className="sort-container">
          <select
            value={sort.field}
            onChange={(e) =>
              handleSortChange(e.target.value, sort.order)
            }
            className="filter-select"
          >
            <option value="distance">Distance</option>
            <option value="name">Name</option>
            <option value="originalAmount">Original Price</option>
            <option value="rentAmount">Rent Price</option>
            <option value="createdAt">Created At</option>
          </select>
          <select
            value={sort.order.toString()}
            onChange={(e) =>
              handleSortChange(sort.field, parseInt(e.target.value) as 1 | -1)
            }
            className="filter-select"
          >
            <option value="1">Ascending</option>
            <option value="-1">Descending</option>
          </select>
        </div>
      </div>

      {/* Loading Message */}
      {loading && (
        <motion.div
          className="loading-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Loading books...
        </motion.div>
      )}

      {/* Books List */}
      {booksResponse?.books?.length ? (
        <motion.div
          className="books-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {booksResponse.books.map((book: IBook) => (
            <motion.div
              key={book._id}
              className="book-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {book.images?.[0] && (
                <img
                  src={book.images[0]}
                  alt={book.name}
                  className="book-image"
                />
              )}
              <h3>{book.name}</h3>
              <p>Category: {book.categoryId.name}</p>
              <p>Deal Type: {book.dealTypeId.name}</p>
              <p>Location: {book.locationName}</p>
              <p>Original Price: ${book.originalAmount.toFixed(2)}</p>
              <p>Rent Price: ${book.rentAmount.toFixed(2)}</p>
              <p>Max Rental Period: {book.maxRentalPeriod} days</p>
              <p>Status: {book.status}</p>
              <p>Active: {book.isActive ? "Yes" : "No"}</p>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        !loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            No books found for the selected criteria.
          </motion.p>
        )
      )}

      {/* Pagination */}
      {booksResponse?.totalPages > 1 && (
        <Pagination1
          currentPage={booksResponse.currentPage}
          totalPages={booksResponse.totalPages}
          onPagePrev={handlePagePrev}
          onPageNext={handlePageNext}
          onPageSelect={handlePageSelect}
        />
      )}
    </motion.div>
  );
};

export default BooksFetchPageInner;