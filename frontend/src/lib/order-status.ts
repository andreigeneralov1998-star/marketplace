export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'OUT_OF_STOCK';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Новый',
  PAID: 'Оплачен',
  PROCESSING: 'Принял',
  SHIPPED: 'Отправил',
  DELIVERED: 'Доставлен',
  CANCELLED: 'Отменён',
  OUT_OF_STOCK: 'Отсутствует',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#f59e0b',
  PAID: '#3b82f6',
  PROCESSING: '#8b5cf6',
  SHIPPED: '#06b6d4',
  DELIVERED: '#16a34a',
  CANCELLED: '#dc2626',
  OUT_OF_STOCK: '#ea580c',
};

export function getOrderStatusLabel(status: OrderStatus | string) {
  return ORDER_STATUS_LABELS[status as OrderStatus] || status;
}