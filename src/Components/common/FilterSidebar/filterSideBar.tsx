
import React from 'react';
import { Filter, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  options: FilterOption[];
  isLoading?: boolean;
}

interface FilterSidebarProps {
  filters: Record<string, any>;
  filterConfig: FilterField[];
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  filterConfig,
  onFilterChange,
  onClearFilters,
  isOpen = true,
  onToggle
}) => {
  return (
    <div className={`lg:block ${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary" />
            Filters
          </h2>
          {onToggle && (
            <button 
              onClick={onToggle} 
              className="lg:hidden p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>

        <div className="space-y-5">
          {filterConfig.map((field) => (
            <div key={field.key} className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <select
                  value={filters[field.key] ?? 'All'}
                  onChange={(e) =>
                    onFilterChange(
                      field.key,
                      e.target.value === 'All' ? undefined : e.target.value
                    )
                  }
                  disabled={field.isLoading}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none cursor-pointer transition-colors hover:border-primary dark:hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="All">All {field.label}s</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearFilters}
          className="mt-6 w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors font-medium"
        >
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;