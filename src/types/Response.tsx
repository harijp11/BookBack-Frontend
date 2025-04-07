import { UserRole } from "./UserRole";

export interface IAxiosResponse {
   success: boolean;
   message: string;
}

export interface IAuthResponse extends IAxiosResponse {
   user: {
      id: string;
      Name: string;
      email: string;
      role: UserRole;
      phoneNumber: string;
   }
}