import { Routes } from '@angular/router';
import { Product } from './Component/product/product';
import { AddProduct } from './Component/add-product/add-product';
import { ProductDetails } from './Component/product-details/product-details';

export const productRoutes: Routes = [
  {
    path: '',
    component: Product,
  },

  {
    path: 'addProduct',
    component: AddProduct,
  },
   { path: ':id', component: ProductDetails },
{ path: 'edit/:id', component: AddProduct },

];