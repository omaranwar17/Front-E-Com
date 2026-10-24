import { Routes } from '@angular/router';
import { Product } from './Component/product/product';
import { AddProduct } from './Component/add-product/add-product';

export const productRoutes: Routes = [
  {
    path: '',
    component: Product,
  },

  {
    path: 'addProduct',
    component: AddProduct,
  },
  {
    path: 'edit/:id', // مسار التعديل
    component: AddProduct, // نفس الكومبوننت
  }
];