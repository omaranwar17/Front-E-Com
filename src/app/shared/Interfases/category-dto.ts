export interface CategoryDto {
  name: string;
  description: string;
}

export interface ResponseApi {
  statusCode: number;
  message?: string;
  data?: any;
}


export interface EditCategoryDto {
  id: number;
  name: string;
  description: string;
}
