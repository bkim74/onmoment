import type { GuruType } from '../../services/storage'
import GuruAvatar from './GuruAvatar'

interface Props {
  guruId: GuruType
  response: string
  isCrisis: boolean
}

export default function GuruResponseCard({ guruId, response, isCrisis }: Props) {
  return (
    <div className="space-y-4">
      <GuruAvatar guruId={guruId} />

      <div
        className={`rounded-om-lg p-5 ${
          isCrisis
            ? 'bg-red-50 border-2 border-red-200'
            : 'glass'
        }`}
      >
        <p className={`text-om-body leading-relaxed whitespace-pre-line ${isCrisis ? 'text-red-800' : 'text-gray-700'}`}>
          "{response}"
        </p>
      </div>

      {isCrisis && (
        <div className="flex gap-3 justify-center">
          <a
            href="tel:1393"
            className="px-5 py-3 rounded-om bg-red-500 text-white font-bold text-sm"
          >
            📞 1393 자살예방상담
          </a>
          <a
            href="tel:119"
            className="px-5 py-3 rounded-om bg-gray-700 text-white font-bold text-sm"
          >
            📞 119 긴급구급
          </a>
        </div>
      )}
    </div>
  )
}
