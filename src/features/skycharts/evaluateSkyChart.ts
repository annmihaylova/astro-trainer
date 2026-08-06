import type {
    BoundStellariumConstellation,
} from './stellariumReference'
import type {
    ProjectedStar,
    SkyChartLine,
} from './types'

export type EvaluatedConstellation = {
    iau: string
    name: string
    visibleStarIds: readonly string[]
    referenceLines: readonly SkyChartLine[]
    correctLineIds: ReadonlySet<string>
    missingLineIds: ReadonlySet<string>
    isCorrect: boolean
    matchedByAlternative: boolean
}

export type SkyChartEvaluation = {
    constellations: readonly EvaluatedConstellation[]
    correctConstellationIds: ReadonlySet<string>
    incorrectConstellationIds: ReadonlySet<string>
    correctLineIds: ReadonlySet<string>
    extraLineIds: ReadonlySet<string>
    missingLines: readonly SkyChartLine[]
    checkedConstellationCount: number
    correctConstellationCount: number
    incorrectConstellationCount: number
    extraLineCount: number
    missingLineCount: number
    scorePercent: number
    isPerfect: boolean
}

const BIG_DIPPER_HIP_IDS = {
    dubhe: 54061,
    merak: 53910,
    phecda: 58001,
    megrez: 59774,
    alioth: 62956,
    mizar: 65378,
    alkaid: 67301,
} as const

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}

export function buildSkyChartLineId(
    firstStarId: string,
    secondStarId: string,
) {
    return [firstStarId, secondStarId].sort().join('--')
}

function buildLine(firstStarId: string, secondStarId: string): SkyChartLine {
    return {
        id: buildSkyChartLineId(firstStarId, secondStarId),
        startStarId: firstStarId,
        endStarId: secondStarId,
    }
}

function buildVisibleConstellationLines(
    constellation: BoundStellariumConstellation,
    visibleStarIds: ReadonlySet<string>,
) {
    const referenceLines = new Map<string, SkyChartLine>()

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

            const line = buildLine(startStarId, endStarId)

            if (!referenceLines.has(line.id)) {
                referenceLines.set(line.id, line)
            }
        }
    }

    return [...referenceLines.values()]
}

function buildVisibleConstellationStarIds(
    constellation: BoundStellariumConstellation,
    visibleStarIds: ReadonlySet<string>,
) {
    const constellationStarIds = new Set<string>()

    for (const polyline of constellation.lines) {
        for (const starId of polyline) {
            if (visibleStarIds.has(starId)) {
                constellationStarIds.add(starId)
            }
        }
    }

    return [...constellationStarIds]
}

function buildBigDipperAlternativeLines(
    visibleStars: readonly ProjectedStar[],
) {
    const starIdByHip = new Map<number, string>()

    for (const star of visibleStars) {
        if (typeof star.hip === 'number') {
            starIdByHip.set(star.hip, star.id)
        }
    }

    const dubhe = starIdByHip.get(BIG_DIPPER_HIP_IDS.dubhe)
    const merak = starIdByHip.get(BIG_DIPPER_HIP_IDS.merak)
    const phecda = starIdByHip.get(BIG_DIPPER_HIP_IDS.phecda)
    const megrez = starIdByHip.get(BIG_DIPPER_HIP_IDS.megrez)
    const alioth = starIdByHip.get(BIG_DIPPER_HIP_IDS.alioth)
    const mizar = starIdByHip.get(BIG_DIPPER_HIP_IDS.mizar)
    const alkaid = starIdByHip.get(BIG_DIPPER_HIP_IDS.alkaid)

    if (
        !dubhe
        || !merak
        || !phecda
        || !megrez
        || !alioth
        || !mizar
        || !alkaid
    ) {
        return null
    }

    return [
        buildLine(dubhe, merak),
        buildLine(merak, phecda),
        buildLine(phecda, megrez),
        buildLine(megrez, dubhe),
        buildLine(megrez, alioth),
        buildLine(alioth, mizar),
        buildLine(mizar, alkaid),
    ]
}

function missingLinesFrom(
    referenceLines: readonly SkyChartLine[],
    userLineIds: ReadonlySet<string>,
) {
    return referenceLines.filter((line) => !userLineIds.has(line.id))
}

function completionRatio(
    referenceLines: readonly SkyChartLine[],
    missingLines: readonly SkyChartLine[],
) {
    if (referenceLines.length === 0) {
        return 0
    }

    return (
        referenceLines.length - missingLines.length
    ) / referenceLines.length
}

function chooseReferenceVariant(
    fullReferenceLines: readonly SkyChartLine[],
    fullMissingLines: readonly SkyChartLine[],
    alternativeLines: readonly SkyChartLine[] | null,
    alternativeMissingLines: readonly SkyChartLine[],
) {
    if (!alternativeLines) {
        return {
            referenceLines: fullReferenceLines,
            missingLines: fullMissingLines,
            matchedByAlternative: false,
        }
    }

    const fullComplete = fullMissingLines.length === 0
    const alternativeComplete = alternativeMissingLines.length === 0

    if (alternativeComplete && !fullComplete) {
        return {
            referenceLines: alternativeLines,
            missingLines: alternativeMissingLines,
            matchedByAlternative: true,
        }
    }

    if (fullComplete) {
        return {
            referenceLines: fullReferenceLines,
            missingLines: fullMissingLines,
            matchedByAlternative: false,
        }
    }

    const fullCompletion = completionRatio(
        fullReferenceLines,
        fullMissingLines,
    )
    const alternativeCompletion = completionRatio(
        alternativeLines,
        alternativeMissingLines,
    )

    if (alternativeCompletion >= fullCompletion) {
        return {
            referenceLines: alternativeLines,
            missingLines: alternativeMissingLines,
            matchedByAlternative: false,
        }
    }

    return {
        referenceLines: fullReferenceLines,
        missingLines: fullMissingLines,
        matchedByAlternative: false,
    }
}

export function evaluateSkyChart(
    visibleStars: readonly ProjectedStar[],
    constellations: readonly BoundStellariumConstellation[],
    userLines: readonly SkyChartLine[],
): SkyChartEvaluation {
    const visibleStarIds = new Set(visibleStars.map((star) => star.id))
    const userLineIds = new Set(userLines.map((line) => line.id))
    const correctConstellationIds = new Set<string>()
    const incorrectConstellationIds = new Set<string>()
    const validReferenceLineIds = new Set<string>()
    const evaluatedConstellations: EvaluatedConstellation[] = []
    const missingLinesById = new Map<string, SkyChartLine>()
    const bigDipperAlternativeLines = buildBigDipperAlternativeLines(
        visibleStars,
    )

    for (const constellation of constellations) {
        const fullReferenceLines = buildVisibleConstellationLines(
            constellation,
            visibleStarIds,
        )

        if (fullReferenceLines.length === 0) {
            continue
        }

        fullReferenceLines.forEach((line) => {
            validReferenceLineIds.add(line.id)
        })

        const isUrsaMajor = constellation.iau.toUpperCase() === 'UMA'
        const alternativeLines = isUrsaMajor
            ? bigDipperAlternativeLines
            : null

        alternativeLines?.forEach((line) => {
            validReferenceLineIds.add(line.id)
        })

        const fullMissingLines = missingLinesFrom(
            fullReferenceLines,
            userLineIds,
        )
        const alternativeMissingLines = alternativeLines
            ? missingLinesFrom(alternativeLines, userLineIds)
            : []
        const fullComplete = fullMissingLines.length === 0
        const alternativeComplete = (
            alternativeLines !== null
            && alternativeMissingLines.length === 0
        )
        const isCorrect = fullComplete || alternativeComplete
        const selectedVariant = chooseReferenceVariant(
            fullReferenceLines,
            fullMissingLines,
            alternativeLines,
            alternativeMissingLines,
        )
        const matchedLineIds = new Set(
            selectedVariant.referenceLines
                .filter((line) => userLineIds.has(line.id))
                .map((line) => line.id),
        )
        const selectedMissingLineIds = new Set(
            selectedVariant.missingLines.map((line) => line.id),
        )

        if (isCorrect) {
            correctConstellationIds.add(constellation.iau)
        } else {
            incorrectConstellationIds.add(constellation.iau)
            selectedVariant.missingLines.forEach((line) => {
                missingLinesById.set(line.id, line)
            })
        }

        evaluatedConstellations.push({
            iau: constellation.iau,
            name: constellation.name,
            visibleStarIds: buildVisibleConstellationStarIds(
                constellation,
                visibleStarIds,
            ),
            referenceLines: selectedVariant.referenceLines,
            correctLineIds: matchedLineIds,
            missingLineIds: selectedMissingLineIds,
            isCorrect,
            matchedByAlternative: (
                alternativeComplete
                && !fullComplete
            ) || selectedVariant.matchedByAlternative,
        })
    }

    const correctLineIds = new Set<string>()
    const extraLineIds = new Set<string>()

    for (const line of userLines) {
        if (validReferenceLineIds.has(line.id)) {
            correctLineIds.add(line.id)
        } else {
            extraLineIds.add(line.id)
        }
    }

    const missingLines = [...missingLinesById.values()]
    const checkedConstellationCount = evaluatedConstellations.length
    const correctConstellationCount = correctConstellationIds.size
    const incorrectConstellationCount = incorrectConstellationIds.size
    const scorePercent = checkedConstellationCount === 0
        ? 100
        : Math.round(clamp(
            correctConstellationCount / checkedConstellationCount,
            0,
            1,
        ) * 100)
    const isPerfect = (
        incorrectConstellationCount === 0
        && extraLineIds.size === 0
    )

    return {
        constellations: evaluatedConstellations,
        correctConstellationIds,
        incorrectConstellationIds,
        correctLineIds,
        extraLineIds,
        missingLines,
        checkedConstellationCount,
        correctConstellationCount,
        incorrectConstellationCount,
        extraLineCount: extraLineIds.size,
        missingLineCount: missingLines.length,
        scorePercent,
        isPerfect,
    }
}
