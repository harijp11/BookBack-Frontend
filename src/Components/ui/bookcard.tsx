"use client"

import { Card } from "@/Components/ui/card"
import { Badge } from "@/Components/ui/badge"
import { MapPin, Navigation, } from 'lucide-react'



export interface BookCardProps {
  id: string | number
  title: string
  imageUrl: string
  category: string
  originalPrice: number
  rentalPrice: number | null
  location: string
  distance: number
}

export function BookCard({ title, imageUrl, category, originalPrice, rentalPrice, location, distance }: BookCardProps) {
  

  const truncateText = (text:string, maxLength = 20) => {
if (text.length <= maxLength) return text;
return `${text.substring(0, maxLength)}...`;
};

  return (
    <Card className="p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex">
        {/* Left side with image */}
        <div className="w-32 h-44 mr-4 flex-shrink-0">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
          />
        </div>

        {/* Right side with content */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-normal text-blue-950 mb-1">{title}</h3>
            <Badge className="bg-purple-100 text-purple-700 font-medium border-0 ml-2">
              {category}
            </Badge>
          </div>
          
          <div className="flex items-center mt-2 mb-2">
            <span className="text-gray-500  mr-2">Sale Price {originalPrice.toFixed(2)}</span>
            {rentalPrice ? (
              <span className="text-purple-600 font-medium">Rental Price {rentalPrice.toFixed(2)}</span>
            ) : (
              <span className="text-orange-500 font-medium">Rent not available</span>
            )}
          </div>
          
          <div className="flex-grow"></div>
          
          <div className="flex items-center mt-1 mb-1">
            <MapPin className="h-4 w-4 text-purple-500 mr-1" />
            <span className="text-gray-600 text-sm truncate" title={location}>{truncateText(location,20)}</span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <Navigation className="h-4 w-4 text-purple-500 mr-1" />
            <span className="text-sm">
              {typeof distance === "number" 
                ? `${(distance/1000).toFixed(2)} km away` 
                : `${(distance/1000).toFixed(2)} away`}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}