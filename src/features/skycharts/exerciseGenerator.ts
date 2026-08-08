import { messierObjects } from '../../data/messierObjects'
import {
    stars as starDeck,
} from '../../data/stars'
import type { Star } from '../../data/stars'
import {
    projectEquatorialPosition,
} from './astronomy'
import {
    DEFAULT_BOUNDARY_CROSSING_IDS,
    DEFAULT_REFERENCE_POINT_IDS,
} from './exercise'
import type {
    SkyChartExercise,
    SkyChartGenerationMode,
} from './exercise'
import {
    buildDeckStarCatalogIdMap,
} from './selectableStars'
import type {
    CatalogStar,
    ProjectedStar,
    SkyChartParameters,
} from './types'

const DEFAULT_STAR_LIST_SIZE = 20
const DEFAULT_MESSIER_LIST_SIZE = 20
const TARGET_VISIBLE_FRACTION = 0.5
const TARGET_MAIN_STAR_FRACTION = 0.7

export type BuildSkyChartExerciseOptions = {
    parameters: SkyChartParameters
    catalog: readonly CatalogStar[]
    projectedStars: readonly ProjectedStar[]
    generationMode: SkyChartGenerationMode
    seed?: number
    starListSize?: number
    messierListSize?: number
}

type RandomSource = () => number

function normalizedSeed(seed: number) {
    return Math.abs(Math.trunc(seed)) >>> 0
}

function mulberry32(seed: number): RandomSource {
    let state = normalizedSeed(seed)

    return () => {
        state += 0x6D2B79F5
        let value = state
        value = Math.imul(value ^ value >>> 15, value | 1)
        value ^= value + Math.imul(value ^ value >>> 7, value | 61)
        return ((value ^ value >>> 14) >>> 0) / 4294967296
    }
}

function shuffle<T>(
    values: readonly T[],
    random: RandomSource,
) {
    const shuffled = [...values]

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1))
        const temporary = shuffled[index]
        shuffled[index] = shuffled[swapIndex]
        shuffled[swapIndex] = temporary
    }

    return shuffled
}

function takeUnique<T>(
    values: readonly T[],
    count: number,
    key: (value: T) => string | number,
) {
    const selected: T[] = []
    const selectedKeys = new Set<string | number>()

    for (const value of values) {
        if (selected.length >= count) {
            break
        }

        const valueKey = key(value)

        if (!selectedKeys.has(valueKey)) {
            selectedKeys.add(valueKey)
            selected.push(value)
        }
    }

    return selected
}

function pickBalancedStars(
    candidates: readonly Star[],
    count: number,
    random: RandomSource,
) {
    if (count <= 0 || candidates.length === 0) {
        return []
    }

    const mainStars = shuffle(
        candidates.filter((star) => star.group === 'main'),
        random,
    )
    const otherStars = shuffle(
        candidates.filter((star) => star.group === 'other'),
        random,
    )
    const desiredMainCount = Math.round(
        count * TARGET_MAIN_STAR_FRACTION,
    )
    const selected: Star[] = []

    selected.push(...mainStars.slice(0, desiredMainCount))
    selected.push(...otherStars.slice(0, count - selected.length))

    if (selected.length < count) {
        const selectedIds = new Set(selected.map((star) => star.id))
        const leftovers = shuffle(
            candidates.filter((star) => !selectedIds.has(star.id)),
            random,
        )
        selected.push(...leftovers.slice(0, count - selected.length))
    }

    return selected.slice(0, count)
}

function chooseStarTaskIds(
    catalog: readonly CatalogStar[],
    projectedStars: readonly ProjectedStar[],
    listSize: number,
    random: RandomSource,
) {
    const catalogIdByDeckStarId = buildDeckStarCatalogIdMap(catalog)
    const visibleCatalogStarIds = new Set(
        projectedStars.map((star) => star.id),
    )
    const mappedStars = starDeck.filter(
        (star) => catalogIdByDeckStarId.has(star.id),
    )
    const visibleStars = mappedStars.filter((star) => {
        const catalogId = catalogIdByDeckStarId.get(star.id)
        return Boolean(catalogId && visibleCatalogStarIds.has(catalogId))
    })
    const hiddenStars = mappedStars.filter((star) => {
        const catalogId = catalogIdByDeckStarId.get(star.id)
        return Boolean(catalogId && !visibleCatalogStarIds.has(catalogId))
    })

    const targetSize = Math.min(listSize, mappedStars.length)
    const desiredVisibleCount = Math.min(
        Math.round(targetSize * TARGET_VISIBLE_FRACTION),
        visibleStars.length,
    )
    const pickedVisible = pickBalancedStars(
        visibleStars,
        desiredVisibleCount,
        random,
    )
    const hiddenCount = Math.min(
        targetSize - pickedVisible.length,
        hiddenStars.length,
    )
    const pickedHidden = pickBalancedStars(
        hiddenStars,
        hiddenCount,
        random,
    )

    const selected = [...pickedVisible, ...pickedHidden]
    const selectedIds = new Set(selected.map((star) => star.id))

    if (selected.length < targetSize) {
        const leftovers = shuffle(
            mappedStars.filter((star) => !selectedIds.has(star.id)),
            random,
        )
        selected.push(...leftovers.slice(0, targetSize - selected.length))
    }

    // Небольшая страховка: если на карте есть звёзды дополнительной
    // колоды, стараемся не получить список только из main.
    if (
        selected.length >= 4
        && selected.every((star) => star.group === 'main')
    ) {
        const replacement = shuffle(
            mappedStars.filter((star) => (
                star.group === 'other'
                && !selectedIds.has(star.id)
            )),
            random,
        )[0]

        if (replacement) {
            selected[selected.length - 1] = replacement
        }
    }

    return shuffle(
        takeUnique(selected, targetSize, (star) => star.id),
        random,
    ).map((star) => star.id)
}

function parseRightAscensionDeg(value: string) {
    const match = value.match(
        /(\d+(?:\.\d+)?)\s*h\s*(\d+(?:\.\d+)?)\s*m\s*(\d+(?:\.\d+)?)\s*s/i,
    )

    if (!match) {
        return null
    }

    const [, hours, minutes, seconds] = match
    return 15 * (
        Number(hours)
        + Number(minutes) / 60
        + Number(seconds) / 3600
    )
}

function parseDeclinationDeg(value: string) {
    const match = value.trim().match(
        /^([+-])\s*(\d+(?:\.\d+)?)\s*[°º]\s*(\d+(?:\.\d+)?)\s*[′']\s*(\d+(?:\.\d+)?)\s*[″"]?$/u,
    )

    if (!match) {
        return null
    }

    const [, sign, degrees, minutes, seconds] = match
    const absolute = (
        Number(degrees)
        + Number(minutes) / 60
        + Number(seconds) / 3600
    )

    return sign === '-' ? -absolute : absolute
}

function chooseMessierTaskNumbers(
    parameters: SkyChartParameters,
    listSize: number,
    random: RandomSource,
) {
    const visibleNumbers: number[] = []
    const hiddenNumbers: number[] = []

    for (const object of messierObjects) {
        const raDeg = parseRightAscensionDeg(object.rightAscension)
        const decDeg = parseDeclinationDeg(object.declination)

        if (raDeg === null || decDeg === null) {
            continue
        }

        const projected = projectEquatorialPosition(
            raDeg,
            decDeg,
            parameters,
        )

        if (projected) {
            visibleNumbers.push(object.number)
        } else {
            hiddenNumbers.push(object.number)
        }
    }

    const targetSize = Math.min(
        listSize,
        visibleNumbers.length + hiddenNumbers.length,
    )
    const desiredVisibleCount = Math.min(
        Math.round(targetSize * TARGET_VISIBLE_FRACTION),
        visibleNumbers.length,
    )
    const pickedVisible = shuffle(visibleNumbers, random)
        .slice(0, desiredVisibleCount)
    const hiddenCount = Math.min(
        targetSize - pickedVisible.length,
        hiddenNumbers.length,
    )
    const pickedHidden = shuffle(hiddenNumbers, random)
        .slice(0, hiddenCount)
    const selected = [...pickedVisible, ...pickedHidden]
    const selectedNumbers = new Set(selected)

    if (selected.length < targetSize) {
        const leftovers = shuffle(
            [...visibleNumbers, ...hiddenNumbers].filter(
                (number) => !selectedNumbers.has(number),
            ),
            random,
        )
        selected.push(...leftovers.slice(0, targetSize - selected.length))
    }

    return shuffle(selected, random)
}

function buildExerciseId(
    seed: number,
    parameters: SkyChartParameters,
) {
    const parameterKey = parameters.mode === 'visible-hemisphere'
        ? [
            'h',
            parameters.latitudeDeg.toFixed(2),
            parameters.siderealTimeHours.toFixed(3),
            parameters.limitingMagnitude.toFixed(2),
        ].join('-')
        : [
            'f',
            parameters.centerRaHours.toFixed(3),
            parameters.centerDecDeg.toFixed(2),
            parameters.angularDiameterDeg.toFixed(2),
            parameters.rotationDeg.toFixed(2),
            parameters.limitingMagnitude.toFixed(2),
        ].join('-')

    return `skychart-${normalizedSeed(seed)}-${parameterKey}`
}

export function buildSkyChartExercise({
    parameters,
    catalog,
    projectedStars,
    generationMode,
    seed = Math.floor(Math.random() * 0xFFFFFFFF),
    starListSize = DEFAULT_STAR_LIST_SIZE,
    messierListSize = DEFAULT_MESSIER_LIST_SIZE,
}: BuildSkyChartExerciseOptions): SkyChartExercise {
    const normalizedExerciseSeed = normalizedSeed(seed)
    const random = mulberry32(normalizedExerciseSeed)
    const chartId = 'chart-1'
    const starIds = chooseStarTaskIds(
        catalog,
        projectedStars,
        starListSize,
        random,
    )
    const messierNumbers = chooseMessierTaskNumbers(
        parameters,
        messierListSize,
        random,
    )

    const tasks: SkyChartExercise['tasks'][number][] = [
        {
            id: 'task-reference-points',
            kind: 'reference-points',
            chartId,
            pointIds: DEFAULT_REFERENCE_POINT_IDS,
        },
        {
            id: 'task-boundary-crossings',
            kind: 'boundary-crossings',
            chartId,
            crossingIds: DEFAULT_BOUNDARY_CROSSING_IDS,
        },
        {
            id: 'task-stars',
            kind: 'stars',
            chartId,
            starIds,
        },
        {
            id: 'task-messier',
            kind: 'messier',
            chartId,
            messierNumbers,
        },
        {
            id: 'task-asterisms',
            kind: 'asterisms',
            chartId,
        },
    ]

    if (parameters.mode === 'visible-hemisphere') {
        tasks.push({
            id: 'task-orientation',
            kind: 'orientation',
            chartId,
            askLatitude: true,
            askSiderealTime: true,
        })
    }

    return {
        id: buildExerciseId(normalizedExerciseSeed, parameters),
        seed: normalizedExerciseSeed,
        generationMode,
        charts: [
            {
                id: chartId,
                title: 'Карта 1',
                parameters,
            },
        ],
        tasks,
    }
}
