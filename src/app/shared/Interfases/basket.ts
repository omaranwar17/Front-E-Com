export interface Carts {
  id: string
  basketItems: BasketItem[]
}

export interface BasketItem {
  id: number
  name: string
  image: string
  price: number
  qunatity: number
  category: string
}

export interface IBasketTotal {
  shipping: number;
  subtotal: number;
  total: number;
}
