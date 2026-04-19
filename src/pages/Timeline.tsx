import { useJourneyStore } from '../stores/useJourneyStore'
import { useAuthStore } from '../stores/useAuthStore'
import { getMilestones } from '../services/storage'
import CalendarGrid from '../components/timeline/CalendarGrid'
import MilestoneCard from '../components/timeline/MilestoneCard'

export default function Timeline() {
  const nickname = useAuthStore((s) => s.user?.nickname ?? '여행자')
  const currentDay = useJourneyStore((s) => s.currentDay)
  const milestones = getMilestones()

  return (
    <div className="flex flex-col min-h-dvh p-6">
      <div className="mb-6">
        <p className="text-sm text-gray-400">{nickname}의 여정</p>
        <h1 className="text-om-heading font-bold text-om-dark">
          Day {currentDay}, {40 - currentDay}일 남음
        </h1>
      </div>

      <CalendarGrid />

      {milestones.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-bold text-gray-500">마일스톤</h2>
          {milestones.map((m) => (
            <MilestoneCard key={m.day} day={m.day} summary={m.summary} />
          ))}
        </div>
      )}
    </div>
  )
}
