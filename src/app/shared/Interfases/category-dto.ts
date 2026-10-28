export interface CategoryDto {
  name: string;
  description: string;
  hasSizes: boolean; // ضيفنا دي عشان الـ Backend بيستقبلها في AddCategory
}

export interface EditCategoryDto {
  id: number;
  name: string;
  description: string;
  hasSizes: boolean; // ضيفنا دي عشان الـ Backend بيرجعها في GetById وبيستقبلها في Update
}

export interface ResponseApi {
  statusCode: number;
  message?: string;
  data?: any;
}