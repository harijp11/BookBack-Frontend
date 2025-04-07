import { UserRole } from "./UserRole";

export interface User {
  Name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: UserRole;
}

export interface IAdmin {
  email: string;
  password: string;
  role: "admin";
}

export interface IUser {
  _id:string
  Name: string;
  email: string;
  phoneNumber: string;
  password: string;
  isActive:boolean
  role: "user";
}

export interface ICategory {
  _id:string 
  name:string
  description:string
  isActive: true
  createdAt:Date,
  updatedAt:Date,
  __v: 0
}


export type UserDTO = IAdmin | IUser 