import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { IPagnation } from '../../../shared/Interfases/Pagnation';
import { IProduct } from '../../../shared/Interfases/IProduct';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface IProductQuery {
  search?: string;
  categoryId?: number | null;
  sort?: string;
  pageNumber: number;
  pageSize: number;
}

@Service()
export class ProductService {
  private _http = inject(HttpClient);
  
  private readonly baseUrl  = `${environment.apiUrl}/api/`;

  getProducts(query: IProductQuery): Observable<IPagnation<IProduct>> {
    let params = new HttpParams()
      .set('PageNumber', query.pageNumber)
      .set('PageSize', query.pageSize);

    const search = query.search?.trim();
    if (search) params = params.set('Search', search);
    if (query.categoryId) params = params.set('CategoryId', query.categoryId);
    if (query.sort) params = params.set('Sort', query.sort);

    return this._http.get<IPagnation<IProduct>>(this.baseUrl + 'Product', { params });
  }

  addProduct(formData: FormData) {
    return this._http.post<{ statusCode?: number; message?: string }>(
      this.baseUrl + 'Product',
      formData
    );
  }

  getProductById(id: number): Observable<IProduct> {
    return this._http.get<IProduct>(`${this.baseUrl}Product/${id}`);
  }

  updateProduct(id: number, formData: FormData) {
    return this._http.put<{ statusCode?: number; message?: string }>(
      `${this.baseUrl}Product/${id}`,
      formData
    );
  }

  deleteProduct(id: number) {
    return this._http.delete<{ statusCode?: number; message?: string }>(
      `${this.baseUrl}Product/${id}`
    );
  }

  getCategory() {
    return this._http.get(this.baseUrl + "Category");
  }

  // ✅ الدالة الجديدة لجلب المقاسات
  getSizes(): Observable<{ id: number; name: string }[]> {
    return this._http.get<{ id: number; name: string }[]>(this.baseUrl + 'Product/sizes');
  }
}