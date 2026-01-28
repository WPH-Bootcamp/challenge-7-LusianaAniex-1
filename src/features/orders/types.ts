/**
 * Orders Feature - Type Definitions
 * Contains all types related to orders
 */

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  phoneNumber: string;
  address: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
}
