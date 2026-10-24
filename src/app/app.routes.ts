import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';
import { AddProduct } from './features/Product/Component/add-product/add-product';


export const routes: Routes = [
 {
    path: 'products',
    loadChildren: () => import('./features/Product/product.routes').then(m => m.productRoutes)
  },

  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: NotFound
  }
];