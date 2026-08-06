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
    checkedConstellationCount: number
    correctConstellationCount: number
    incorrectConstellationCount: number
    extraLineCount: number
    scorePercent: number
    isPerfect: boolean
}

const BIG_DIPPER_KEYS = [
    'ALP:UMA',
    'BET:UMA',
    'GAM:UMA',
    'DEL:UMA',
    'EPS:UMA',
    'ZET:UMA',
    'ETA:UMA',
] as const

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}

export function buildSkyChartLineId(
    firstStarId: string,
    secondStarId: string,
) {
    return [firstStarId, secondStarId].sort().join('--')
}

function catalogDesignationKey(name: string | null) {
    if (!name) {
        return null
    }

    const match = name.trim().match(
        /^(?:[0-9]{1,3})?\s*([A-Za-z]{2,3})\s*([0-9]?)\s*([A-Za-z]{3})$/,
    )

    if (!match) {
        return null
    }

    const [, rawGreek, component, rawConstellation] = match

    return [
        rawGreek.toUpperCase(),
        component,
        rawConstellation.toUpperCase(),
    ].join(':')
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

            const id = buildSkyChartLineId(startStarId, endStarId)

            if (!referenceLines.has(id)) {
                referenceLines.set(id, {
                    id,
                    startStarId,
                    endStarId,
                })
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

function buildBigDipperAlternativeLineIds(
    visibleStars: readonly ProjectedStar[],
) {
    const starIdByKey = new Map<string, string>()

    for (const star of visibleStars) {
        const key = catalogDesignationKey(star.name)

        if (key) {
            starIdByKey.set(key, star.id)
        }
    }

    const requiredIds = BIG_DIPPER_KEYS.map(
        (key) => starIdByKey.get(key) ?? null,
    )

    if (requiredIds.some((starId) => starId === null)) {
        return null
    }

    const [
        dubhe,
        merak,
        phecda,
        megrez,
        alioth,
        mizar,
        alkaid,
    ] = requiredIds as string[]

    return new Set([
        buildSkyChartLineId(dubhe, merak),
        buildSkyChartLineId(merak, phecda),
        buildSkyChartLineId(phecda, megrez),
        buildSkyChartLineId(megrez, dubhe),
        buildSkyChartLineId(megrez, alioth),
        buildSkyChartLineId(alioth, mizar),
        buildSkyChartLineId(mizar, alkaid),
    ])
}

function hasAllLineIds(
    userLineIds: ReadonlySet<string>,
    requiredLineIds: ReadonlySet<string>,
) {
    for (const lineId of requiredLineIds) {
        if (!userLineIds.has(lineId)) {
            return false
        }
    }

    return true
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
    const correctLineIds = new Set<string>()
    const allVisibleReferenceLineIds = new Set<string>()
    const evaluatedConstellations: EvaluatedConstellation[] = []
    const bigDipperAlternativeLineIds = buildBigDipperAlternativeLineIds(
        visibleStars,
    )

    for (const constellation of constellations) {
        const referenceLines = buildVisibleConstellationLines(
            constellation,
            visibleStarIds,
        )

        if (referenceLines.length === 0) {
            continue
        }

        const visibleConstellationStarIds = buildVisibleConstellationStarIds(
            constellation,
            visibleStarIds,
        )
        referenceLines.forEach((line) => allVisibleReferenceLineIds.add(line.id))
        const matchedReferenceLineIds = new Set<string>()
        const missingLineIds = new Set<string>()

        for (const line of referenceLines) {
            if (userLineIds.has(line.id)) {
                matchedReferenceLineIds.add(line.id)
            } else {
                missingLineIds.add(line.id)
            }
        }

        let matchedByAlternative = false
        let isCorrect = missingLineIds.size === 0

        if (
            !isCorrect
            && constellation.iau === 'UMA'
            && bigDipperAlternativeLineIds
        ) {
            matchedByAlternative = hasAllLineIds(
                userLineIds,
                bigDipperAlternativeLineIds,
            )
            isCorrect = matchedByAlternative

            if (matchedByAlternative) {
                bigDipperAlternativeLineIds.forEach((lineId) => {
                    matchedReferenceLineIds.add(lineId)
                    missingLineIds.delete(lineId)
                })
            }
        }

        if (isCorrect) {
            correctConstellationIds.add(constellation.iau)
            matchedReferenceLineIds.forEach((lineId) => {
                if (userLineIds.has(lineId)) {
                    correctLineIds.add(lineId)
                }
            })
        } else {
            incorrectConstellationIds.add(constellation.iau)
        }

        evaluatedConstellations.push({
            iau: constellation.iau,
            name: constellation.name,
            visibleStarIds: visibleConstellationStarIds,
            referenceLines,
            correctLineIds: matchedReferenceLineIds,
            missingLineIds,
            isCorrect,
            matchedByAlternative,
        })
    }

    if (bigDipperAlternativeLineIds) {
        bigDipperAlternativeLineIds.forEach((lineId) => {
            allVisibleReferenceLineIds.add(lineId)
        })
    }

    const extraLineIds = new Set<string>()

    for (const line of userLines) {
        if (!allVisibleReferenceLineIds.has(line.id)) {
            extraLineIds.add(line.id)
        }
    }

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
        checkedConstellationCount,
        correctConstellationCount,
        incorrectConstellationCount,
        extraLineCount: extraLineIds.size,
        scorePercent,
        isPerfect,
    }
}
