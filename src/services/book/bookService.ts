import { adminAxiosInstance } from "@/APIs/admin_axios";
import { UserAxiosInstance } from "@/APIs/user_axios";
import { GetBooksByLocationInput } from "@/Components/user/book/fetchAllAvailableBooks";
import { AxiosError } from "axios";

export interface Book {
     _id:string
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

  export interface ownerId {
    _id: string;
    Name: string;
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
    ownerId: ownerId;
    status:string
    isActive:boolean
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    locationName: string
    createdAt:Date,
    updatedAt:Date
    distance:number
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
  book:IBook;
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

export interface BookStatusUpdateResponse{
  success:boolean;
  message:string;
}

//user

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

export const createNewBook = async (bookData: Omit<Book,"_id">)=>{
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
    bookData: Omit<Book,"_id">
  ): Promise<BookResponse> => {
    try {
      // Send the bookData directly without nesting it in a data property
      const response = await UserAxiosInstance.put<BookResponse>(
        "/user/book",
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

  export const updateBookStatus = async (
    bookId: string,
  ): Promise<BookStatusUpdateResponse | void> => {
    try {
      const response = await UserAxiosInstance.patch(`/user/book/`,
      {data:"hhi"},
      {
        params:{bookId}
      }
      );
      return response.data;
    } catch (error) {
      if(error instanceof AxiosError){
      console.error("Error updating book status:", error);
      }
    }
  };


  //admin 

  export const getAllPaginatedAdminBooks = async (params: Omit<BookSearchParams,"ownerId">): Promise<BookListResponse> => {
    try {
      const queryParams = {
        search: params.search || "",
        filter: params.filter || {},
        page: params.page || 1,
        limit: params.limit || 5
      };
      const response = await adminAxiosInstance.get<BookListResponse>("/admin/book", {
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

  export const updateAdminBookStatus = async (
    bookId: string,
  ): Promise<BookStatusUpdateResponse> => {
    try {
      const response = await adminAxiosInstance.patch(`/admin/book/`,
      {data:"hhi"},
      {
        params:{bookId}
      }
      );
      return response.data;
    } catch (error) {
      if(error instanceof AxiosError){
      console.error("Error updating book status:", error);
      }
      throw error
    }
  };


  export const fetchAvailableBooks = async (parms:GetBooksByLocationInput
  ): Promise<BookListResponse | void> => {
    try {
      const response = await UserAxiosInstance.get('/user/books-available', {
        params: parms
      });
      // console.log("books datasss ",response.data)
      return response.data;
    } catch (error) {
      console.error('Error fetching available books:', error);
    }
  };

  export const getUserBookDetails = async (
    { _id }: { _id: string }
  ): Promise<BookResponse> => {
    try {
      const response = await UserAxiosInstance.get(`/user/book-Details/${_id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available books:', error);
       throw new Error("Failed to fetch book details");
    }
  };

  export const getRelatedBooks = async (
    { catId }: { catId: string }
  ): Promise<IBook | void> => {
    try {
      const response = await UserAxiosInstance.get(`/user/related-books/${catId}`);
      return response.data.books;
    } catch (error) {
      console.error('Error fetching available books:', error);
    }
  };