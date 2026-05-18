export function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`
}

export function formatDate(date: string | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('ja-JP')
}

export function formatStock(quantity: number): string {
  return `${quantity.toFixed(1)}m`
}
