import { useRecordingStore } from '../../stores/useRecordingStore'

export default function Timer() {
  const duration = useRecordingStore((s) => s.duration)
  const maxDuration = useRecordingStore((s) => s.maxDuration)

  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`

  const color =
    duration >= 80 ? 'text-red-400' : duration >= 60 ? 'text-amber-400' : 'text-white'

  const progress = (duration / maxDuration) * 100

  return (
    <div className="flex flex-col items-center">
      <span className={`text-5xl font-mono font-bold ${color}`}>{display}</span>
      <div className="w-48 h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-om-purple rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
