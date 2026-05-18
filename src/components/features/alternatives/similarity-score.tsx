'use client'

export interface SimilarityScoreProps {
  score: number
}

export default function SimilarityScore({ score }: SimilarityScoreProps) {
  const percentage = Math.round(score * 100)

  const getColor = () => {
    if (percentage >= 90) return 'bg-green-100 text-green-800'
    if (percentage >= 70) return 'bg-blue-100 text-blue-800'
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getColor()}`}>
      類似度: {percentage}%
    </div>
  )
}
