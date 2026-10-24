import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';

@Service()
export class ProductService {
 private _http = inject(HttpClient);

  private baseUrl = 'https://localhost:7020/api/';
    getProducts()
    {
       return this._http.get(this.baseUrl+"Product");  
    }





        getCategory()
    {
       return this._http.get(this.baseUrl+"Category");  
    }
}
