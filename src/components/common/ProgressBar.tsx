interface Props {
  percentage: number
  label?: string
}

export default function ProgressBar({ percentage, label }: Props) {
  const clamped = Math.max(0, Math.min(100, percentage))
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="h-2.5 bg-white/50 rounded-full overflow-hidden">
        <div
          className="h-full gradient-purple rounded-full transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
