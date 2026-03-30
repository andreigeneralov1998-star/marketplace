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

// для старого кода, где используется backgroundColor: ORDER_STATUS_COLORS[status]
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#F59E0B',
  PAID: '#0EA5E9',
  PROCESSING: '#8B5CF6',
  SHIPPED: '#06B6D4',
  DELIVERED: '#10B981',
  CANCELLED: '#EF4444',
  OUT_OF_STOCK: '#F97316',
};

// для нового кода, где используются tailwind-классы
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  PAID: 'bg-sky-50 text-sky-700 border border-sky-200',
  PROCESSING: 'bg-violet-50 text-violet-700 border border-violet-200',
  SHIPPED: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
  OUT_OF_STOCK: 'bg-orange-50 text-orange-700 border border-orange-200',
};

export function getOrderStatusLabel(status: OrderStatus | string) {
  return ORDER_STATUS_LABELS[status as OrderStatus] || status;
}

export function getOrderStatusClassName(status: OrderStatus | string) {
  return (
    ORDER_STATUS_STYLES[status as OrderStatus] ||
    'bg-slate-50 text-slate-700 border border-slate-200'
  );
}

export function getOrderStatusColor(status: OrderStatus | string) {
  return ORDER_STATUS_COLORS[status as OrderStatus] || '#6B7280';
}