import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';
import { AddProduct } from './features/Product/Component/add-product/add-product';
import { Home } from './features/home/home';


export const routes: Routes = [
 {
    path: 'products',
    loadChildren: () => import('./features/Product/product.routes').then(m => m.productRoutes)
  },

  {
    path: '',
    redirectTo: 'Home',
    pathMatch: 'full'
  },
   {
    path: 'Home',
 component:Home
  },
  {
    path: '**',
    component: NotFound
  }
];