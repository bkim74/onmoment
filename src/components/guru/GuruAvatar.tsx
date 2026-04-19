import type { GuruType } from '../../services/storage'

const GURU_CONFIG: Record<GuruType, { icon: string; name: string; color: string }> = {
  comfort: { icon: '🤗', name: '위로의 구루', color: 'bg-purple-100 border-purple-300' },
  growth: { icon: '🌱', name: '성장의 구루', color: 'bg-green-100 border-green-300' },
  connection: { icon: '💝', name: '연결의 구루', color: 'bg-pink-100 border-pink-300' },
  healing: { icon: '🌊', name: '치유의 구루', color: 'bg-blue-100 border-blue-300' },
}

export default function GuruAvatar({ guruId }: { guruId: GuruType }) {
  const config = GURU_CONFIG[guruId]
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-om border ${config.color}`}>
      <span className="text-3xl">{config.icon}</span>
      <span className="text-sm font-bold text-gray-700">{config.name}</span>
    </div>
  )
}
