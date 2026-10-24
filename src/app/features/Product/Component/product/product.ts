import { TranslatePipe } from '@ngx-translate/core';
import { IProduct } from '../../../../shared/Interfases/IProduct';
import { IPagnation } from '../../../../shared/Interfases/Pagnation';
import { Categorys } from '../categorys/categorys';
import { ProductList } from '../product-list/product-list';
import { ProductService } from './../../Service/product-service';
import { Component, inject, OnInit } from '@angular/core';
import { LanguageService } from '../../../../core/services/language-service';

@Component({
  imports: [ProductList , Categorys , TranslatePipe],
  selector: 'app-product',
  styleUrl: './product.scss',
  templateUrl: './product.html',
})
export class Product implements OnInit {


   langService = inject(LanguageService);

  constructor(private _ProductService: ProductService) {}


  allProducts: IProduct[] = [];      
  filteredProducts: IProduct[] = [];

  ngOnInit(): void {
    this.getProd();
  }

  // 1. جلب البيانات من الـ API
  getProd() {
    this._ProductService.getProducts().subscribe({
      next: (res: any) => {
        this.allProducts = res.data || res; // حسب شكل الـ Response
        this.filteredProducts = this.allProducts; // في الأول بنعرض كل حاجة
      },
      error: (err: any) => console.error('Error fetching products', err)
    });
  }

  // 2. البحث (Search)
  handleSearch(searchText: string) {
    const text = searchText?.trim().toLowerCase() || '';
    
    // لو مفيش كلام في البحث، نرجع كل حاجة.. لو في كلام بنفلتر
    if (text === '') {
      this.filteredProducts = this.allProducts;
    } else {
      this.filteredProducts = this.allProducts.filter(p => 
        p.name.toLowerCase().includes(text) || 
        p.description?.toLowerCase().includes(text)
      );
    }
  }

  // الفلترة بالفئة
  handleCategory(categoryName: string) {
    // لو الاسم فاضي (يعني داس على "الكل") بنعرض كل حاجة
    if (!categoryName) {
      this.filteredProducts = this.allProducts;
    } else {
      // لو اختار فئة معينة بنفلتر بيها
      this.filteredProducts = this.allProducts.filter(p => 
        p.categoryName === categoryName
      );
    }
  }

  // 4. الترتيب (Sort)
  handleSort(sortValue: string) {
    const sorted = [...this.filteredProducts]; // بنعمل كوبي عشان منبوظش الأصل

    if (sortValue === 'price') {
      sorted.sort((a, b) => a.newPrice - b.newPrice);
    } else if (sortValue === 'price_desc') {
      sorted.sort((a, b) => b.newPrice - a.newPrice);
    } else if (sortValue === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    this.filteredProducts = sorted;
  }




}
