import { Routes } from '@angular/router';
import { Basket } from './Component/basket/basket';
import { Checkout } from './Component/checkout/checkout';
import { MyOrders } from './Component/my-orders/my-orders';


export const CartsRoutes: Routes = [
  { path: '',component:Basket },
   { path: 'Checkout',component:Checkout },
   { path: 'MyOrders',component:MyOrders },

 
 

];