export interface Product {
  id: string;
  name: string;
  category: 'Laptops' | 'Audio' | 'Smartphones' | 'Peripherals' | 'Wearables' | 'Displays';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  features: string[];
  stock: number;
  image: string;
  badge?: string;
  modelNumber: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  street: string;
  apt?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface PaymentInfo {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  saveCard?: boolean;
}

export interface OrderConfirmation {
  orderId: string;
  createdAt: string;
  customer: CustomerInfo;
  shipping: ShippingAddress;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
  paymentStatus: 'PAID' | 'FAILED';
  transactionId?: string;
  estimatedDelivery: string;
}
