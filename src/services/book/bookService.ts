import { UserAxiosInstance } from "@/APIs/user_axios";

export interface Book {
    name: string;
    categoryId: string;
    dealTypeId: string
    originalAmount: number;
    rentAmount: number;
    description: string;
    maxRentalPeriod: number; // in days
    images: string[];
    ownerId: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    locationName: string
  }

  
 export interface Category {
    _id: string;
    name: string;
  }
  
 export interface DealType {
    _id: string;
    name: string;
  }
  
  export interface IBook{
    _id: string;
    name: string
    categoryId: Category
    dealTypeId: DealType
    originalAmount: number;
    rentAmount: number;
    description: string;
    maxRentalPeriod: number; 
    images: string[];
    ownerId: string;
    status:string
    isActive:boolean
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    locationName: string
  }


  export interface CloudinarySignatureResponse {
    success: boolean;
    message: string;
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder?: string;
  }

export type BookResponse = {
  success: boolean;
  message:string
  book:Book;
};

export interface BookSearchParams {
  ownerId: string; // This is required according to your controller
  search?: string;
  filter?: object;
  page?: number;
  limit?: number;
}

export interface BookListResponse {
  success: boolean;
  message: string;
  books: IBook[];
  totalBooks: number;
  totalPages: number;
  currentPage: number;
}



export const getCloudinarySignature = async (): Promise<CloudinarySignatureResponse> => {
  try {
    // Make sure this URL matches exactly what's in your routes
    const response = await UserAxiosInstance.get<{
      success: boolean;
      data: CloudinarySignatureResponse;
    }>("/user/book-cloudinary-signature");
    
    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to get Cloudinary signature");
    }
    
    return response.data.data;
  } catch (error) {
    console.error("Error getting cloudinary signature:", error);
    throw error;
  }
};

export const createNewBook = async (bookData: Book)=>{
    const response = await UserAxiosInstance.post<Book>("/user/book",bookData);
    return response
  };

  export const getAllPaginatedBooks = async (params: BookSearchParams): Promise<BookListResponse> => {
    try {
      // Check for required parameter
      if (!params.ownerId) {
        throw new Error("Owner ID is required");
      }
  
      // Create query parameters
      const queryParams = {
        ownerId: params.ownerId,
        search: params.search || "",
        filter: params.filter || {},
        page: params.page || 1,
        limit: params.limit || 5
      };
  
      // Make the GET request with query parameters
      const response = await UserAxiosInstance.get<BookListResponse>("/user/book", {
        params: queryParams,
        paramsSerializer: params => {
          const urlParams = new URLSearchParams();
          
          Object.entries(params).forEach(([key, value]) => {
            if (key === 'filter' && typeof value === 'object') {
              urlParams.append(key, JSON.stringify(value));
            } else {
              urlParams.append(key, String(value));
            }
          });
          
          return urlParams.toString();
        }
      });
     console.log("books datasss",response.data)
      return response.data
    } catch (error) {
      console.error("Error fetching paginated books:", error);
      throw error;
    }
  };

  export const updateBookDetails = async (
    bookId: string,
    bookData: Book
  ): Promise<BookResponse> => {
    try {
      // Send the bookData directly without nesting it in a data property
      const response = await UserAxiosInstance.post<BookResponse>(
        "/user/updatebook",
        bookData,
        {
          params: { bookId },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Error updating book:", error);
      throw error;
    }
  };
