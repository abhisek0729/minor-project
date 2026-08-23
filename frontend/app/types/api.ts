export interface ApiResponse<T = null>{
    success : boolean;
    message : string;
    errors?: Record<string, string[] | undefined>;
    data?: T;
}