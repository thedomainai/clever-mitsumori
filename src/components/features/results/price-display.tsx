'use client'

export interface PriceDisplayProps {
  price: number
  showCurrency?: boolean
}

export default function PriceDisplay({ price, showCurrency = true }: PriceDisplayProps) {
  const formattedPrice = new Intl.NumberFormat('ja-JP', {
    style: showCurrency ? 'currency' : 'decimal',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)

  return <span>{formattedPrice}</span>
}
