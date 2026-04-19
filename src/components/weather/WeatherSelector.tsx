import { useRecordingStore } from '../../stores/useRecordingStore'
import type { WeatherState } from '../../services/storage'

const weathers: { id: WeatherState; icon: string; label: string }[] = [
  { id: 'sunny', icon: '☀️', label: '맑음' },
  { id: 'partlyCloudy', icon: '⛅', label: '반흐림' },
  { id: 'cloudy', icon: '☁️', label: '흐림' },
  { id: 'rainy', icon: '🌧️', label: '비' },
  { id: 'stormy', icon: '⛈️', label: '폭풍' },
]

export default function WeatherSelector() {
  const weather = useRecordingStore((s) => s.weather)
  const setWeather = useRecordingStore((s) => s.setWeather)

  return (
    <div className="flex justify-center gap-3 py-4">
      {weathers.map((w) => (
        <button
          key={w.id}
          onClick={() => setWeather(w.id)}
          className={`flex flex-col items-center justify-center min-w-touch min-h-touch rounded-om transition-all ${
            weather === w.id
              ? 'bg-om-purple/15 border-2 border-om-purple scale-110'
              : 'bg-transparent border-2 border-transparent hover:bg-purple-50'
          }`}
        >
          <span className="text-2xl">{w.icon}</span>
          <span
            className={`text-xs mt-1 ${
              weather === w.id ? 'font-bold text-om-purple' : 'text-gray-400'
            }`}
          >
            {w.label}
          </span>
        </button>
      ))}
    </div>
  )
}
