export const STATUS_FILTERS = [
  { key: 'preparing', label: 'Preparing' },
  { key: 'on-the-way', label: 'On the Way' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'done', label: 'Done' },
  { key: 'canceled', label: 'Canceled' },
] as const;

export type OrderStatus = typeof STATUS_FILTERS[number]['key'];
