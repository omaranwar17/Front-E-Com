export interface IProduct {
  id: number
  name: string
  description: string
  newPrice: number
  oldPrice:number
  categoryName: string
  photos: IPhoto[]
}

export interface IPhoto {
  productId: number
  imageName: string
}