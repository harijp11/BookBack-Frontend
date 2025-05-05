import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BookLoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  backgroundContent?: ReactNode;
}

const BookLoadingSpinner: React.FC<BookLoadingSpinnerProps> = ({
  message = "Loading...",
  className,
  size = "md",
  backgroundContent,
}) => {
  const sizeClasses = {
    sm: { book: "w-16 h-20", container: "max-w-xs p-6" },
    md: { book: "w-20 h-28", container: "max-w-sm p-8" },
    lg: { book: "w-24 h-32", container: "max-w-md p-10" },
  };

  return (
    <div className="relative min-h-screen">
      {/* Background content without reduced opacity */}
      {backgroundContent && (
        <div className="absolute inset-0">
          {backgroundContent}
        </div>
      )}
      
      {/* Spinner overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
        <div className={cn(
          "bg-transparent rounded-lg text-center",
          sizeClasses[size].container,
          className
        )}>
          {/* Simple Book Animation */}
          <div className="relative mx-auto mb-6">
            <div className={cn(
              "relative mx-auto animate-[spin_3s_linear_infinite]",
              sizeClasses[size].book
            )}>
              {/* Book cover */}
              <div className="absolute inset-0 bg-black rounded shadow-md">
                {/* Book spine */}
                <div className="absolute top-0 bottom-0 left-0 w-[8%] h-full bg-gray-900 rounded-l"></div>
                
                {/* Book pages */}
                <div className="absolute inset-y-[5%] right-[5%] left-[15%] bg-white rounded-r"></div>
                
                {/* Simple book title lines */}
                <div className="absolute top-[25%] left-[25%] right-[15%] h-[5%] bg-gray-200 rounded-full"></div>
                <div className="absolute top-[40%] left-[25%] right-[25%] h-[5%] bg-gray-200 rounded-full"></div>
                <div className="absolute top-[55%] left-[25%] right-[35%] h-[5%] bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-white mb-2">{message}</h3>
          
          {/* Enhanced loading dots with increased bounce amplitude */}
          <div className="flex justify-center space-x-2 mt-2">
            <div className="h-2 w-2 rounded-full bg-white animate-[bounce_1s_infinite_alternate] translate-y-[-8px]"></div>
            <div className="h-2 w-2 rounded-full bg-gray-400 animate-[bounce_1s_infinite_alternate_0.2s] translate-y-[-8px]"></div>
            <div className="h-2 w-2 rounded-full bg-white animate-[bounce_1s_infinite_alternate_0.4s] translate-y-[-8px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookLoadingSpinner;
