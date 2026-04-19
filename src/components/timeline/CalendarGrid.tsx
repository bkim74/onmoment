import { useNavigate } from 'react-router-dom'
import { useJourneyStore } from '../../stores/useJourneyStore'
import { getDailyMeta } from '../../services/storage'

const MILESTONE_DAYS = [7, 14, 21]
const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

export default function CalendarGrid() {
  const navigate = useNavigate()
  const currentDay = useJourneyStore((s) => s.currentDay)

  const cells = Array.from({ length: 42 }, (_, i) => i + 1)
  const filledCells = cells.slice(0, Math.max(currentDay + (7 - (currentDay % 7)), 35))

  const getStatus = (day: number) => {
    if (day > currentDay) return 'future'
    if (MILESTONE_DAYS.includes(day) && day < currentDay) return 'milestone'
    const meta = getDailyMeta(day)
    if (meta) return 'completed'
    if (day === currentDay) return 'today'
    return 'future'
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {filledCells.map((day) => {
          const status = getStatus(day)
          if (day > 40) return <div key={day} />

          const base = 'w-full aspect-square rounded-full flex items-center justify-center text-xs font-bold transition-all'
          const styles: Record<string, string> = {
            completed: `${base} gradient-purple text-white`,
            today: `${base} border-2 border-om-purple text-om-purple bg-purple-50`,
            milestone: `${base} gradient-gold text-white`,
            future: `${base} text-gray-300`,
          }

          const isClickable = status === 'completed' || status === 'milestone'

          return (
            <button
              key={day}
              onClick={() => isClickable && navigate(`/response/${day}`)}
              disabled={!isClickable}
              className={`${styles[status]} ${isClickable ? 'hover:scale-110 cursor-pointer' : ''}`}
            >
              {MILESTONE_DAYS.includes(day) && status !== 'future' ? '★' : day}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 justify-center">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full gradient-purple inline-block" /> 완료</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full border-2 border-om-purple inline-block" /> 오늘</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full gradient-gold inline-block" /> 마일스톤</span>
      </div>
    </div>
  )
}
