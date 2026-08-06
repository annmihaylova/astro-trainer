import type {
    BoundStellariumConstellation,
} from './stellariumReference'
import type {
    ProjectedStar,
    SkyChartLine,
} from './types'

export type SkyChartEvaluation = {
    correctLineIds: ReadonlySet<string>
    extraLineIds: ReadonlySet<string>
    missingLines: readonly SkyChartLine[]
    referenceLineCount: number
    correctLineCount: number
    extraLineCount: number
    missingLineCount: number
    scorePercent: number
    isPerfect: boolean
}

export function buildSkyChartLineId(
    firstStarId: string,
    secondStarId: string,
) {
    return [firstStarId, secondStarId].sort().join('--')
}

export function buildVisibleReferenceLines(
    visibleStars: readonly ProjectedStar[],
    constellations: readonly BoundStellariumConstellation[],
) {
    const visibleStarIds = new Set(
        visibleStars.map((star) => star.id),
    )
    const referenceLines = new Map<string, SkyChartLine>()

    for (const constellation of constellations) {
        for (const polyline of constellation.lines) {
            for (
                let starIndex = 1;
                starIndex < polyline.length;
                starIndex += 1
            ) {
                const startStarId = polyline[starIndex - 1]
                const endStarId = polyline[starIndex]

                if (
                    !visibleStarIds.has(startStarId)
                    || !visibleStarIds.has(endStarId)
                ) {
                    continue
                }

                const id = buildSkyChartLineId(
                    startStarId,
                    endStarId,
                )

                if (!referenceLines.has(id)) {
                    referenceLines.set(id, {
                        id,
                        startStarId,
                        endStarId,
                    })
                }
            }
        }
    }

    return [...referenceLines.values()]
}

export function evaluateSkyChart(
    visibleStars: readonly ProjectedStar[],
    constellations: readonly BoundStellariumConstellation[],
    userLines: readonly SkyChartLine[],
): SkyChartEvaluation {
    const referenceLines = buildVisibleReferenceLines(
        visibleStars,
        constellations,
    )
    const referenceLinesById = new Map(
        referenceLines.map((line) => [line.id, line]),
    )
    const userLineIds = new Set(userLines.map((line) => line.id))
    const correctLineIds = new Set<string>()
    const extraLineIds = new Set<string>()

    for (const userLine of userLines) {
        if (referenceLinesById.has(userLine.id)) {
            correctLineIds.add(userLine.id)
        } else {
            extraLineIds.add(userLine.id)
        }
    }

    const missingLines = referenceLines.filter(
        (line) => !userLineIds.has(line.id),
    )
    const correctLineCount = correctLineIds.size
    const extraLineCount = extraLineIds.size
    const missingLineCount = missingLines.length
    const scoredLineCount = (
        correctLineCount
        + extraLineCount
        + missingLineCount
    )
    const scorePercent = scoredLineCount === 0
        ? 100
        : Math.round(correctLineCount / scoredLineCount * 100)
    const isPerfect = (
        extraLineCount === 0
        && missingLineCount === 0
    )

    return {
        correctLineIds,
        extraLineIds,
        missingLines,
        referenceLineCount: referenceLines.length,
        correctLineCount,
        extraLineCount,
        missingLineCount,
        scorePercent,
        isPerfect,
    }
}
