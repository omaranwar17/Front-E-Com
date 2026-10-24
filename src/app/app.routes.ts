import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';

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
  
  
  // مسار لو الصفحة مش موجودة (404)
  {
    path: '**',
    component:NotFound
  }
];
