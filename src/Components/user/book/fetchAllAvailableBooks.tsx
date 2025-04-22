"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { IBook } from "@/services/book/bookService"
import { LocationPicker } from "@/common/maping/LocationPickerComponent"
import { Pagination1 } from "@/Components/common/pagination/pagination1"
import { useToast } from "@/hooks/ui/toast"
import { useAvailableBooks } from "@/hooks/common/useBookQueries"
import { useBookQueries } from "@/hooks/common/useBookMutation"
import { Search, MapPin, Filter, Loader2, X, ChevronDown } from "lucide-react"
import { data, useNavigate } from "react-router-dom"
import { useDebounce } from "@/Components/common/useDebounceHook/useDebounce" // Import useDebounce hook

export interface GetBooksByLocationInput {
  latitude: number
  longitude: number
  maxDistance: number
  page?: number
  limit?: number
  search?: string
  filters?: Record<string, object>
  sort?: Record<string, object>
}

interface FilterState {
  categoryId?: string
  dealTypeId?: string
}

interface SortState {
  field: string
  order: 1 | -1
}

const BooksFetchPageInner: React.FC = () => {
  // State for location
  const [location, setLocation] = useState<{
    name: string
    point1: [number, number]
  }>({
    name: "",
    point1: [9.941777, 76.320992], // Default to London
  })
 
  // State for filters, sorting, and pagination
  const [filters, setFilters] = useState<FilterState>({})
  const [sort, setSort] = useState<SortState>({ field: "createdAt", order: 1 })
  const [page, setPage] = useState<number>(1)
  const [searchInput, setSearchInput] = useState<string>("") // Raw search input
  const debouncedSearch = useDebounce<string>(searchInput, 500) // Debounce search input
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false)
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false)
  const limit:number = 5
  // Use toast hook
  const { error } = useToast()

  // Use the book queries hook to access the categories and deal types queries
  const { categoriesQuery, dealTypesQuery } = useBookQueries()
  const navigate = useNavigate()
  // Construct query params
  const queryParams: GetBooksByLocationInput = {
    latitude: location.point1[0],
    longitude: location.point1[1],
    maxDistance: 5000, // 5km radius, adjust as needed
    page,
    limit,
    search: debouncedSearch || undefined, // Use debounced search value
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    sort: { [sort.field]: sort.order },
  }

  // Use the custom hook for fetching books
  const { data: booksResponse, isLoading: loading, refetch: fetchBooks } = useAvailableBooks(queryParams)

  // Trigger fetch when dependencies change
  useEffect(() => {
    if (location.point1) {
      fetchBooks()
    } else {
      error("Please select a location")
    }
    console.log("datasssss",data)
  }, [])

  // Effect to refetch when debounced search changes
  useEffect(() => {
    if (location.point1) {
      fetchBooks()
    }
  }, [debouncedSearch, page, filters, sort, location.point1])

  // Handle location change from LocationPicker
  const handleLocationChange = (name: string, point1: [number, number]) => {
    setLocation({ name, point1 })
    setShowLocationPicker(false)
    setPage(1)
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }))
    setPage(1)
  }

  // Handle sort change
  const handleSortChange = (field: string, order: 1 | -1) => {
    setSort({ field, order })
    setPage(1)
  }

  // Handle search change - updated to use debounce pattern
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value) // Update raw input immediately for UI feedback
    // No need to call setPage(1) here as it will be handled when debouncedSearch changes
  }

  // Handle pagination
  const handlePagePrev = () => {
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handlePageNext = () => {
    setPage((prev) => Math.min(prev + 1, booksResponse?.totalPages || 1))
  }

  const handlePageSelect = (newPage: number) => {
    setPage(newPage)
  }

  // Helper function to format distance in kilometers
  const formatDistance = (distanceInMeters: number | undefined): string => {
    if (distanceInMeters === undefined) return "Unknown";
    // Convert meters to kilometers and format with 1 decimal place
    const distanceInKm = (distanceInMeters / 1000).toFixed(1);
    return `${distanceInKm} km`;
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 text-black min-h-screen">
      {/* Location Picker Modal */}
      <AnimatePresence>
        {showLocationPicker && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select Location</h3>
                <button onClick={() => setShowLocationPicker(false)} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <LocationPicker
                onLocationChange={handleLocationChange}
                initialLocations={{
                  point1: location.point1,
                  locationName: location.name,
                }}
                liveLocationEnabled={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          className="text-3xl font-bold mb-8 border-b pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Find Books Nearby
        </motion.h1>

        {/* Top Search and Location Bar */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
            {searchInput !== debouncedSearch && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </span>
            )}
          </div>

          <button
            onClick={() => setShowLocationPicker(true)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <MapPin className="h-5 w-5 text-gray-500" />
            <span className="flex-grow text-left truncate max-w-[200px]">
              {location.name ? location.name : "Select Location"}
            </span>
          </button>

          <div className="relative">
            <div className="flex items-center">
              <select
                value={`${sort.field}|${sort.order}`}
                onChange={(e) => {
                  const [field, orderStr] = e.target.value.split("|")
                  handleSortChange(field, Number(orderStr) as 1 | -1)
                }}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              >
                <option value="name|1">Name (A-Z)</option>
                <option value="name|-1">Name (Z-A)</option>
                <option value="originalAmount|1">Price (Low-High)</option>
                <option value="originalAmount|-1">Price (High-Low)</option>
                <option value="createdAt|-1">Newest First</option>
                <option value="createdAt|1">Oldest First</option>
                <option value="distance|1">Distance (Nearest)</option>
                <option value="distance|-1">Distance (Farthest)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {(showMobileFilters || !showMobileFilters) && (
              <motion.aside
                className={`md:block ${showMobileFilters ? "block" : "hidden"} md:w-64 shrink-0`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
              >
                <div className="sticky top-8 bg-gradient-to-b from-gray-50 to-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="md:hidden p-2 rounded-full hover:bg-gray-200"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3">Categories</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="category-all"
                            name="category"
                            checked={!filters.categoryId}
                            onChange={() => handleFilterChange("categoryId", undefined)}
                            className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor="category-all" className="ml-2 text-sm text-gray-700">
                            All Categories
                          </label>
                        </div>

                        {categoriesQuery.isLoading ? (
                          <div className="py-2 px-3 bg-gray-100 rounded animate-pulse">Loading categories...</div>
                        ) : (
                          categoriesQuery.data?.map((cat) => (
                            <div key={cat._id} className="flex items-center">
                              <input
                                type="radio"
                                id={`category-${cat._id}`}
                                name="category"
                                checked={filters.categoryId === cat._id}
                                onChange={() => handleFilterChange("categoryId", cat._id)}
                                className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                              />
                              <label htmlFor={`category-${cat._id}`} className="ml-2 text-sm text-gray-700">
                                {cat.name}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold uppercase text-gray-500 mb-3">Deal Types</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="deal-all"
                            name="deal"
                            checked={!filters.dealTypeId}
                            onChange={() => handleFilterChange("dealTypeId", undefined)}
                            className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                          />
                          <label htmlFor="deal-all" className="ml-2 text-sm text-gray-700">
                            All Deal Types
                          </label>
                        </div>

                        {dealTypesQuery.isLoading ? (
                          <div className="py-2 px-3 bg-gray-100 rounded animate-pulse">Loading deal types...</div>
                        ) : (
                          dealTypesQuery.data?.map((deal) => (
                            <div key={deal._id} className="flex items-center">
                              <input
                                type="radio"
                                id={`deal-${deal._id}`}
                                name="deal"
                                checked={filters.dealTypeId === deal._id}
                                onChange={() => handleFilterChange("dealTypeId", deal._id)}
                                className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                              />
                              <label htmlFor={`deal-${deal._id}`} className="ml-2 text-sm text-gray-700">
                                {deal.name}
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-grow">
            {/* Loading Message */}
            {(loading || categoriesQuery.isLoading || dealTypesQuery.isLoading) && (
              <motion.div
                className="flex justify-center items-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                <span className="text-lg font-medium">Loading books and metadata...</span>
              </motion.div>
            )}

            {/* Books List */}
            {!loading && booksResponse?.books?.length ? (
              <motion.div
                className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {booksResponse.books.map((book: IBook) => (
                 <motion.div
                 key={book._id}
                 className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col"
                 variants={itemVariants}
                 whileHover={{ y: -5, transition: { duration: 0.2 } }}
               >
                 <div className="aspect-[4/3] overflow-hidden relative"
                 onClick={()=>navigate(`/book/${book._id}`)}>
                   <img
                     src={book.images?.[0] || "/placeholder.svg"}
                     alt={book.name}
                     className="w-full h-full object-cover transition-transform hover:scale-105"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                 </div>
                 <div className="p-4 flex-grow flex flex-col">
                   <h3 className="text-lg font-bold mb-2 line-clamp-1">{book.name}</h3>
                   
                   {/* Category and Distance Badge */}
                   <div className="mb-2 flex flex-wrap gap-2">
                     <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                       {book.categoryId.name}
                     </span>
                     {book.distance !== undefined && (
                       <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                         {formatDistance(book.distance)}
                       </span>
                     )}
                   </div>
                   
                   <div className="mt-auto space-y-1">
                     {/* Original Amount */}
                     <div className="flex items-baseline">
                       <span className="text-sm text-gray-500">Original: </span>
                       <span className="font-medium ml-1">${book.originalAmount.toFixed(2)}</span>
                     </div>
                     
                     {/* Rent Amount */}
                     {book.rentAmount > 0 && (
                       <div className="flex items-baseline">
                         <span className="font-bold text-lg">${book.rentAmount.toFixed(2)}</span>
                         <span className="text-sm text-gray-500 ml-1">/ rental</span>
                       </div>
                     )}
                   </div>
               
                   <div className="mt-2 flex items-center text-sm text-gray-600">
                     <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                     <span className="truncate">{book.locationName}</span>
                   </div>
                 </div>
               </motion.div>
                ))}
              </motion.div>
            ) : (
              !loading &&
              !categoriesQuery.isLoading &&
              !dealTypesQuery.isLoading && (
                <motion.div
                  className="text-center py-16 bg-gradient-to-b from-white to-gray-50 rounded-lg border border-gray-100"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xl font-medium text-gray-600">No books found for the selected criteria.</p>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                </motion.div>
              )
            )}

            {/* Pagination */}
            {booksResponse?.totalPages > 1 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Pagination1
                  currentPage={booksResponse.currentPage}
                  totalPages={booksResponse.totalPages}
                  onPagePrev={handlePagePrev}
                  onPageNext={handlePageNext}
                  onPageSelect={handlePageSelect}
                />
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default BooksFetchPageInner