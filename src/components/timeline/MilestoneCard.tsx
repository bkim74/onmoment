interface Props {
  day: number
  summary: string
}

const MILESTONE_TITLES: Record<number, string> = {
  7: '1주차 정체성 카드',
  14: '2주차 성장 카드',
  21: '3주차 연결 카드',
}

export default function MilestoneCard({ day, summary }: Props) {
  const title = MILESTONE_TITLES[day] ?? `${day}일 마일스톤`

  return (
    <div className="rounded-om-lg p-5 gradient-gold text-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">★</span>
        <h3 className="font-bold">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-white/90">{summary}</p>
    </div>
  )
}
