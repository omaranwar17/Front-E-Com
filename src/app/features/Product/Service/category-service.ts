import { inject, Service } from '@angular/core';
import { CategoryDto, EditCategoryDto, ResponseApi } from '../../../shared/Interfases/category-dto';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Service()
export class CategoryService {
private http = inject(HttpClient);

     private readonly baseUrl  = `${environment.apiUrl}/api/`;
  
   

  addCategory(category: CategoryDto): Observable<ResponseApi> {
    return this.http.post<ResponseApi>(`${this.baseUrl}Category`, category);
  }


  updateCategory(dto: EditCategoryDto): Observable<ResponseApi> {
  return this.http.put<ResponseApi>(`${this.baseUrl}Category/${dto.id}`, dto);
}

getCategoryById(id: number): Observable<EditCategoryDto> {
  return this.http.get<EditCategoryDto>(`${this.baseUrl}Category/${id}`);
}

deleteCategory(id: number): Observable<ResponseApi> {
  return this.http.delete<ResponseApi>(`${this.baseUrl}Category/${id}`);
}
}


