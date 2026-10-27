import { Routes } from '@angular/router';
import { Basket } from './Component/basket/basket';
import { Checkout } from './Component/checkout/checkout';


export const CartsRoutes: Routes = [
  { path: '',component:Basket },
   { path: 'Checkout',component:Checkout },
 
 

];