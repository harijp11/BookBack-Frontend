"use client"

import React, { useState, ReactNode } from "react"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"

// Base filter options interface
export interface FilterOptions {
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  priceRange: {
    min: string;
    max: string;
  };
}

// Props for the ReusableFilterTopbar component
export interface FilterTopbarProps {
  title?: string;
  onApplyFilters: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  initialFilters?: FilterOptions;
  hasActiveFilters: boolean;
  initiallyExpanded?: boolean;
  priceRangeIcon?: ReactNode;
  dateRangeIcon?: ReactNode;
}

export const ReusableFilterTopbar: React.FC<FilterTopbarProps> = ({
  title = "Filters",
  onApplyFilters,
  onClearFilters,
  initialFilters,
  hasActiveFilters,
  initiallyExpanded = true,
  priceRangeIcon,
  dateRangeIcon,
}) => {
  const [showFilters, setShowFilters] = useState(initiallyExpanded)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialFilters || {
    dateRange: {
      startDate: null,
      endDate: null,
    },
    priceRange: {
      min: "",
      max: "",
    },
  })

  const handleFilterChange = (category: 'dateRange' | 'priceRange', value: any) => {
    setFilterOptions(prev => {
      return {
        ...prev,
        [category]: {
          ...prev[category],
          ...value
        }
      }
    })
  }

  const handleApplyFilters = () => {
    onApplyFilters(filterOptions)
  }

  const handleClearFilters = () => {
    setFilterOptions({
      dateRange: {
        startDate: null,
        endDate: null,
      },
      priceRange: {
        min: "",
        max: "",
      },
    })
    onClearFilters()
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md border border-gray-200 mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-black">{title}</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <X size={16} />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={toggleFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            <Filter size={16} />
            <span>Filter</span>
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="p-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Range Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {priceRangeIcon}
                <label htmlFor="priceRange" className="text-sm font-medium text-gray-900">
                  Price Range
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  value={filterOptions.priceRange.min}
                  onChange={(e) => handleFilterChange("priceRange", { min: e.target.value })}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min="0"
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  value={filterOptions.priceRange.max}
                  onChange={(e) => handleFilterChange("priceRange", { max: e.target.value })}
                />
              </div>
            </div>
            
            {/* Date Range Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {dateRangeIcon}
                <label htmlFor="dateRange" className="text-sm font-medium text-gray-900">
                  Date Range
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  value={filterOptions.dateRange.startDate || ""}
                  onChange={(e) => handleFilterChange("dateRange", { startDate: e.target.value })}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  value={filterOptions.dateRange.endDate || ""}
                  onChange={(e) => handleFilterChange("dateRange", { endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}