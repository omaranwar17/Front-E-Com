export type PaymentMethod = 'CashOnDelivery' | 'InstaPay' | 'VodafoneCash';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  notes: string | null;
}

export interface PaymentInfo {
  vodafoneCashNumber: string;
  instaPayAddress: string;
  accountHolderName: string;
}

export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentReference: string | null;
}

export interface OrderItem {
  productId: number;
  productName: string;
  pictureUrl: string | null;
  size: string | null;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  orderDate: string;
  status: string;
  paymentMethod: string;
   hasReceipt: boolean;
  paymentReference: string | null;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export type OrderStatus =
  | 'Pending'
  | 'AwaitingPaymentReview'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Rejected';

/** الصف في قايمة الأدمن (يطابق AdminOrderListItemDto في الـ backend) */
export interface AdminOrderListItem {
  id: number;
  orderDate: string;
  buyerEmail: string;
   hasReceipt: boolean;
  status: OrderStatus;
  paymentMethod: string;
  paymentReference: string | null;
  total: number;
}