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
    barcode?: string | null;
  category: string
  size?: string | null;
}

export interface IBasketTotal {
  shipping: number;
  subtotal: number;
  total: number;
}
