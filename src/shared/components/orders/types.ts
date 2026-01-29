export interface OrderUI {
  id: string;
  transactionId?: string;
  restaurantName: string;
  restaurantId: number;
  restaurantLogo: string;
  status: 'preparing' | 'on_the_way' | 'delivered' | 'done' | 'cancelled' | string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  orderDate: string;
  isLocalOrder?: boolean;
}
