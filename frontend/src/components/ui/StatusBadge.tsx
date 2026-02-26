interface StatusBadgeProps {
  status: string
  colorMap: Record<string, string>
  labelMap: Record<string, string>
}

export function StatusBadge({ status, colorMap, labelMap }: StatusBadgeProps) {
  const colors = colorMap[status] || 'bg-gray-100 text-gray-800'
  const label = labelMap[status] || status

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors}`}>
      {label}
    </span>
  )
}
