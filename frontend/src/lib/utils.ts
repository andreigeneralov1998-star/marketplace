export function formatPrice(value: string | number) {
  return new Intl.NumberFormat('ru-RU').format(Number(value));
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}