import { Routes } from '@angular/router';
import { NotFound } from './shared/components/not-found/not-found';
import { AddProduct } from './features/Product/Component/add-product/add-product';
import { Home } from './features/home/home';
import { authGuard } from './shared/guard/auth-guard';
import { Register } from './features/Auth/Component/register/register';
import { Login } from './features/Auth/Component/login/login';
import { guestGuardGuard } from './shared/guard/guest-guard-guard';
import { ConfirmEmail } from './features/Auth/Component/confirm-email/confirm-email';
import { ForgotPassword } from './features/Auth/Component/forgot-password/forgot-password';
import { ResetPassword } from './features/Auth/Component/reset-password/reset-password';


export const routes: Routes = [

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
    path: 'products',
    loadChildren: () => import('./features/Product/product.routes').then(m => m.productRoutes)
  },
   {
    path: 'Carts',
    loadChildren: () => import('./features/Carts/Carts.routes').then(m => m.CartsRoutes),
     canActivate: [authGuard]
  },

  {
    path: 'Register',
    component: Register,
    canActivate: [guestGuardGuard]
  },
  {
    path: 'Login',
    component: Login,
    canActivate: [guestGuardGuard]
  },
  {
   path: 'Account/active',
  component: ConfirmEmail
},
{
  path: 'ForgotPassword',
  component: ForgotPassword,
 canActivate: [guestGuardGuard]
},
{
  path: 'Account/Reset-Password',
  component: ResetPassword
},

{
    path: 'Admin/Orders',
    loadComponent: () =>
      import('./features/Carts/Component/admin-orders/admin-orders').then((m) => m.AdminOrders),
    canActivate: [authGuard, authGuard],
  },

  {
    path: 'orders/:id',
    loadComponent: () =>
      import('./features/Carts/Component/order-details-component/order-details-component').then((m) => m.OrderDetailsComponent),
    canActivate: [authGuard, authGuard],
  },

 
  
  {
    path: '**',
    component: NotFound
  }
];