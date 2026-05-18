'use client'

export interface SimilarityScoreProps {
  score: number
}

export default function SimilarityScore({ score }: SimilarityScoreProps) {
  const percentage = Math.round(score * 100)

  const getColor = () => {
    if (percentage >= 90) return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
    if (percentage >= 70) return 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
    if (percentage >= 50) return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
    return 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10'
  }

  return (
    <div className={`px-2.5 py-1 rounded-md text-xs font-semibold ${getColor()}`}>
      {percentage}%
    </div>
  )
}
