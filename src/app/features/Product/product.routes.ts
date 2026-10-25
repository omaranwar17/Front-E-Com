import { Routes } from '@angular/router';
import { Product } from './Component/product/product';
import { AddProduct } from './Component/add-product/add-product';
import { ProductDetails } from './Component/product-details/product-details';
import { AddCategory } from './Component/add-category/add-category';

export const productRoutes: Routes = [
  { path: '',component: Product},
  { path: 'addProduct',component: AddProduct},
    { path: 'addCategory', component: AddCategory }, 
    { path: 'editCategory/:id', component: AddCategory },
  { path: ':id', component: ProductDetails },
  { path: 'edit/:id', component: AddProduct },
 

];