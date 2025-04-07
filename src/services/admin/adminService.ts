import { adminAxiosInstance } from "@/APIs/admin_axios";
import { FetchUsersParams, UsersResponse } from "@/hooks/admin/userManagingHooks.tsx/useAllUsers";
import { IAxiosResponse } from "@/types/Response";
import { IUser,IAdmin } from "@/types/User";

export interface UpdatePasswordData {
	oldPassword: string;
	newPassword: string;
}

export type AdminResponse = {
	success: boolean;
	message: string;
	user: IAdmin;
};

export type IUpdateAdminData = Pick<
	IAdmin,
	"role" | "email" 
>;



export interface CategoryType {
	_id: string;
	name: string;
	description?: string;
	isActive: boolean; 
	createdAt?: string;
	updatedAt?: string;
	__v?: number;
  }


  export interface DealType {
	_id: string;
	name: string;
	description?: string;
	isActive: boolean; 
	createdAt?: string;
	updatedAt?: string;
	__v?: number;
  }

export interface CategoryResponse {
	success: boolean;
	categories: CategoryType[];
	totalPages: number;
	currentPage: number;
	totalCategory: number;
  }

  export interface DealTypeResponse {
	success: boolean;
	dealTypes: DealType[];
	totalPages: number;
	currentPage: number;
	totalCategory: number;
  }

export const getAllUsers = async <T extends IUser>({
	userType,
	page = 1,
	limit = 5,
	search = "",
}: FetchUsersParams): Promise<UsersResponse<T>> => {
	const response = await adminAxiosInstance.get("/admin/users", {
		params: { userType, page, limit, search },
	});

	return {
		success:response.data.success,
		message:response.data.message,
		users: response.data.users,
		totalPages: response.data.totalPages,
		currentPage: response.data.currentPage,
	};
};

export const updateUserStatus = async (data: {
	userType: string;
	userId: string;
}): Promise<IAxiosResponse> => {
	const response = await adminAxiosInstance.patch(
		"/admin/user-status",
		{},
		{
			params: {
				userType: data.userType,
				userId: data.userId,
			},
		}
	);
	return response.data.categories
};



export const getAllCategories = async ({
	page = 1,
	limit = 10,
	search = "",
  }: {
	page: number;
	limit: number;
	search: string;
  }): Promise<CategoryResponse> => {
	const response = await adminAxiosInstance.get("/admin/categories", {
	  params: { page, limit, search },
	});
	return response.data;
  };



  export const addAndEditCategory = async (categoryData: {
	id?: string;
	name: string;
	description?: string;
  }): Promise<IAxiosResponse> => {
	if (categoryData.id) {
	  // Edit category (PUT)
	  const response = await adminAxiosInstance.put(
		`/admin/categories/${categoryData.id}`,
		{ name: categoryData.name, description: categoryData.description }
	  );
	  return response.data;
	} else {
	  // Add new category (POST)
	  const response = await adminAxiosInstance.post("/admin/categories", {
		name: categoryData.name,
		description: categoryData.description,
	  });
	  return response.data;
	}
  };
  
  export const toggleCategoryStatus = async (categoryId: string): Promise<IAxiosResponse> => {
	const response = await adminAxiosInstance.patch(`/admin/categories/${categoryId}`);
	return response.data;
  };



  //deal types apis

  export const getAllDealTypes = async ({
	page = 1,
	limit = 10,
	search = "",
  }: {
	page: number;
	limit: number;
	search: string;
  }): Promise<DealTypeResponse> => {
	const response = await adminAxiosInstance.get("/admin/deal-types", {
	  params: { page, limit, search },
	});
	return response.data;
  };



  export const addAndEditDealType = async (dealTypeData: {
	id?: string;
	name: string;
	description?: string;
  }): Promise<IAxiosResponse> => {
	if (dealTypeData.id) {
	  // Edit category (PUT)
	  const response = await adminAxiosInstance.put(
		`/admin/deal-types/${dealTypeData.id}`,
		{ name: dealTypeData.name, description: dealTypeData.description }
	  );
	  return response.data;
	} else {
	  // Add new category (POST)
	  const response = await adminAxiosInstance.post("/admin/deal-types", {
		name: dealTypeData.name,
		description: dealTypeData.description,
	  });
	  return response.data;
	}
  };
  
  export const toggleDealTypeStatus = async (dealTypeId: string): Promise<IAxiosResponse> => {
	const response = await adminAxiosInstance.patch(`/admin/deal-types/${dealTypeId}`);
	return response.data;
  };
  
  


 