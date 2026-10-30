export interface IProduct {
  id: number
  name: string
  description: string
  newPrice: number
  oldPrice:number
  barcode?: string | null;
  categoryName: string
   sizes: string | null;
  photos: IPhoto[]
}

export interface IPhoto {
  productId: number
  imageName: string
}