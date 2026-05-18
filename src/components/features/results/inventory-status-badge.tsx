'use client'

import Badge, { BadgeColor } from '@/components/ui/badge'

export interface InventoryStatusBadgeProps {
  status: string
  color: BadgeColor
}

export default function InventoryStatusBadge({ status, color }: InventoryStatusBadgeProps) {
  return <Badge color={color}>{status}</Badge>
}
