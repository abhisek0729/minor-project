import { ApiResponse } from "@/app/types/api";

export type UserRole =   "tourist" | "hotelOwner" | "restaurantOwner" | "guide";

export interface ServiceResponse<T = null> {
  status: number;
  body: ApiResponse<T>;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

