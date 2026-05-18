import type { Result, UnifiedProduct, Alternative } from '../types'

function calculateSimilarityScore(target: UnifiedProduct, candidate: UnifiedProduct): number {
  let score = 0

  if (target.meshSize !== undefined && candidate.meshSize !== undefined) {
    const meshDiff = Math.abs(target.meshSize - candidate.meshSize)
    const meshSimilarity = Math.max(0, 1 - meshDiff / Math.max(target.meshSize, candidate.meshSize))
    score += meshSimilarity * 0.4
  }

  const widthDiff = Math.abs(target.width - candidate.width)
  const widthSimilarity = Math.max(0, 1 - widthDiff / Math.max(target.width, candidate.width))
  score += widthSimilarity * 0.3

  const stockScore = Math.min(candidate.stockQuantity / 100, 1)
  score += stockScore * 0.2

  const priceDiff = Math.abs(target.purchasePrice - candidate.purchasePrice)
  const priceSimilarity = Math.max(0, 1 - priceDiff / Math.max(target.purchasePrice, candidate.purchasePrice))
  score += priceSimilarity * 0.1

  return score
}

function generateReason(target: UnifiedProduct, alternative: UnifiedProduct): string {
  const reasons: string[] = []

  if (target.meshSize !== undefined && alternative.meshSize !== undefined) {
    const meshDiff = Math.abs(target.meshSize - alternative.meshSize)
    if (meshDiff <= target.meshSize * 0.1) {
      reasons.push(`目開きが近く（${alternative.meshSize}μ）`)
    }
  }

  if (alternative.stockQuantity > 0) {
    reasons.push(`在庫があります（${alternative.stockQuantity.toFixed(1)}m）`)
  }

  const widthDiff = Math.abs(target.width - alternative.width)
  if (widthDiff <= target.width * 0.1) {
    reasons.push(`幅が近い（${alternative.width}mm）`)
  }

  if (reasons.length === 0) {
    reasons.push('類似の仕様です')
  }

  return reasons.join('、')
}

export function findAlternatives(
  targetProduct: UnifiedProduct,
  allProducts: UnifiedProduct[],
  maxResults: number = 5
): Result<{ alternatives: Alternative[] }> {
  try {
    const candidates = allProducts.filter(
      (product) =>
        product.productType === targetProduct.productType &&
        product.stockQuantity > 0 &&
        product.id !== targetProduct.id
    )

    const scoredCandidates = candidates
      .map((candidate) => {
        const similarityScore = calculateSimilarityScore(targetProduct, candidate)

        const meshDiff =
          targetProduct.meshSize !== undefined && candidate.meshSize !== undefined
            ? targetProduct.meshSize - candidate.meshSize
            : null

        const meshDiffPercentage =
          targetProduct.meshSize !== undefined && candidate.meshSize !== undefined && targetProduct.meshSize > 0
            ? (meshDiff! / targetProduct.meshSize) * 100
            : null

        const widthDiff = targetProduct.width - candidate.width
        const widthDiffPercentage = (widthDiff / targetProduct.width) * 100

        const priceDiff = targetProduct.purchasePrice - candidate.purchasePrice
        const priceDiffPercentage = (priceDiff / targetProduct.purchasePrice) * 100

        const alternative: Alternative = {
          product: candidate,
          similarityScore,
          differences: {
            meshSize: {
              target: targetProduct.meshSize ?? null,
              alternative: candidate.meshSize ?? null,
              diff: meshDiff,
              diffPercentage: meshDiffPercentage,
            },
            width: {
              target: targetProduct.width,
              alternative: candidate.width,
              diff: widthDiff,
              diffPercentage: widthDiffPercentage,
            },
            price: {
              target: targetProduct.purchasePrice,
              alternative: candidate.purchasePrice,
              diff: priceDiff,
              diffPercentage: priceDiffPercentage,
            },
          },
          reason: generateReason(targetProduct, candidate),
        }

        return alternative
      })
      .filter((alt) => alt.similarityScore >= 0.3)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, maxResults)

    return {
      success: true,
      data: { alternatives: scoredCandidates },
    }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ALTERNATIVE_SEARCH_ERROR',
        message: '代替品検索に失敗しました',
        details: error,
      },
    }
  }
}
