import type { CatalogStar } from './types'

// Фиксируем эталон на конкретном релизе Stellarium, чтобы рисунок
// созвездий не менялся сам по себе при обновлениях upstream.
const STELLARIUM_MODERN_URL = (
    'https://raw.githubusercontent.com/'
    + 'Stellarium/stellarium/'
    + 'v26.2/skycultures/modern/index.json'
)

const HIPPARCOS_STARS_URL = (
    'https://raw.githubusercontent.com/'
    + 'ofrohn/d3-celestial/'
    + '7e720a3de062059d4c5400a379146a601d9010e0/'
    + 'data/stars.8.json'
)

const MAXIMUM_MATCH_DISTANCE_DEG = 0.05
const DEG_TO_RAD = Math.PI / 180

export type StellariumReferenceStar = {
    hip: number
    raDeg: number
    decDeg: number
    magnitude: number
}

export type StellariumConstellation = {
    iau: string
    name: string
    lines: readonly (readonly number[])[]
}

export type StellariumWesternReference = {
    constellations: readonly StellariumConstellation[]
    starsByHip: ReadonlyMap<number, StellariumReferenceStar>
    requiredHipIds: ReadonlySet<number>
}

export type BoundStellariumConstellation = {
    iau: string
    name: string
    lines: readonly (readonly string[])[]
}

export type BoundStellariumReference = {
    catalog: readonly CatalogStar[]
    requiredStarIds: ReadonlySet<string>
    constellations: readonly BoundStellariumConstellation[]
    matchedStarCount: number
    syntheticStarCount: number
}

type UnitVector = {
    x: number
    y: number
    z: number
}

type CatalogVector = {
    index: number
    star: CatalogStar
    vector: UnitVector
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function finiteNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value)
        ? value
        : null
}

function positiveInteger(value: unknown) {
    const number = finiteNumber(value)

    if (!number || !Number.isInteger(number) || number <= 0) {
        return null
    }

    return number
}

function normalizedRaDeg(value: number) {
    return ((value % 360) + 360) % 360
}

function parseStellariumLines(value: unknown) {
    if (!Array.isArray(value)) {
        return []
    }

    const lines: number[][] = []

    for (const rawLine of value) {
        if (!Array.isArray(rawLine)) {
            continue
        }

        // В Modern (IAU) созвездиях Stellarium 26.2 линии IAU
        // задаются HIP-номерами. Строковые Gaia-id, встречающиеся в
        // дополнительных asterisms, здесь намеренно не используются.
        const hips = rawLine
            .map(positiveInteger)
            .filter((hip): hip is number => hip !== null)

        if (hips.length >= 2) {
            lines.push(hips)
        }
    }

    return lines
}

function parseIauCode(rawConstellation: Record<string, unknown>) {
    if (typeof rawConstellation.iau === 'string') {
        return rawConstellation.iau
    }

    if (typeof rawConstellation.id !== 'string') {
        return null
    }

    const match = rawConstellation.id.match(
        /^CON\s+\S+\s+([A-Za-z0-9]{3})$/u,
    )

    return match?.[1] ?? null
}

function parseConstellations(value: unknown) {
    if (!isRecord(value) || !Array.isArray(value.constellations)) {
        throw new Error('В данных Stellarium нет списка созвездий.')
    }

    const constellations: StellariumConstellation[] = []

    for (const rawConstellation of value.constellations) {
        if (!isRecord(rawConstellation)) {
            continue
        }

        const iau = parseIauCode(rawConstellation)
        const lines = parseStellariumLines(rawConstellation.lines)

        if (!iau || lines.length === 0) {
            continue
        }

        const commonName = isRecord(rawConstellation.common_name)
            ? rawConstellation.common_name
            : null
        const nativeName = commonName
            && typeof commonName.native === 'string'
            ? commonName.native
            : null
        const englishName = commonName
            && typeof commonName.english === 'string'
            ? commonName.english
            : null

        constellations.push({
            iau,
            name: nativeName ?? englishName ?? iau,
            lines,
        })
    }

    if (constellations.length === 0) {
        throw new Error('Не удалось разобрать линии созвездий Stellarium.')
    }

    return constellations
}

function parseHipparcosStars(
    value: unknown,
    requiredHipIds: ReadonlySet<number>,
) {
    if (!isRecord(value) || !Array.isArray(value.features)) {
        throw new Error('В каталоге Hipparcos нет списка звёзд.')
    }

    const starsByHip = new Map<number, StellariumReferenceStar>()

    for (const rawFeature of value.features) {
        if (!isRecord(rawFeature)) {
            continue
        }

        const hip = positiveInteger(rawFeature.id)

        if (hip === null || !requiredHipIds.has(hip)) {
            continue
        }

        const geometry = isRecord(rawFeature.geometry)
            ? rawFeature.geometry
            : null
        const coordinates = geometry && Array.isArray(geometry.coordinates)
            ? geometry.coordinates
            : null
        const longitude = coordinates
            ? finiteNumber(coordinates[0])
            : null
        const declination = coordinates
            ? finiteNumber(coordinates[1])
            : null
        const properties = isRecord(rawFeature.properties)
            ? rawFeature.properties
            : null
        const magnitude = properties
            ? finiteNumber(properties.mag)
            : null

        if (
            longitude === null
            || declination === null
            || magnitude === null
        ) {
            continue
        }

        starsByHip.set(hip, {
            hip,
            raDeg: normalizedRaDeg(longitude),
            decDeg: declination,
            magnitude,
        })
    }

    const missingHips = [...requiredHipIds].filter(
        (hip) => !starsByHip.has(hip),
    )

    if (missingHips.length > 0) {
        throw new Error(
            `Не найдены координаты ${missingHips.length} вершин `
            + 'созвездий Stellarium.',
        )
    }

    return starsByHip
}

async function fetchJson(url: string, signal: AbortSignal) {
    const response = await fetch(url, { signal })

    if (!response.ok) {
        throw new Error(
            `Не удалось загрузить астрономические данные: ${response.status}`,
        )
    }

    return response.json() as Promise<unknown>
}

export async function loadStellariumWesternReference(
    signal: AbortSignal,
): Promise<StellariumWesternReference> {
    const [rawStellarium, rawHipparcos] = await Promise.all([
        fetchJson(STELLARIUM_MODERN_URL, signal),
        fetchJson(HIPPARCOS_STARS_URL, signal),
    ])
    const constellations = parseConstellations(rawStellarium)
    const requiredHipIds = new Set<number>()

    for (const constellation of constellations) {
        for (const line of constellation.lines) {
            line.forEach((hip) => requiredHipIds.add(hip))
        }
    }

    const starsByHip = parseHipparcosStars(
        rawHipparcos,
        requiredHipIds,
    )

    return {
        constellations,
        starsByHip,
        requiredHipIds,
    }
}

function toUnitVector(raDeg: number, decDeg: number): UnitVector {
    const raRad = raDeg * DEG_TO_RAD
    const decRad = decDeg * DEG_TO_RAD
    const cosDec = Math.cos(decRad)

    return {
        x: cosDec * Math.cos(raRad),
        y: cosDec * Math.sin(raRad),
        z: Math.sin(decRad),
    }
}

function angularDistanceDeg(
    first: UnitVector,
    second: UnitVector,
) {
    const dotProduct = Math.min(
        1,
        Math.max(
            -1,
            first.x * second.x
            + first.y * second.y
            + first.z * second.z,
        ),
    )

    return Math.acos(dotProduct) / DEG_TO_RAD
}

function findNearestUnusedCatalogStar(
    referenceStar: StellariumReferenceStar,
    catalogVectors: readonly CatalogVector[],
    usedCatalogStarIds: ReadonlySet<string>,
) {
    const referenceVector = toUnitVector(
        referenceStar.raDeg,
        referenceStar.decDeg,
    )
    let nearest: CatalogVector | null = null
    let nearestDistanceDeg = Number.POSITIVE_INFINITY

    for (const candidate of catalogVectors) {
        if (usedCatalogStarIds.has(candidate.star.id)) {
            continue
        }

        const declinationDifference = Math.abs(
            candidate.star.decDeg - referenceStar.decDeg,
        )

        if (declinationDifference > MAXIMUM_MATCH_DISTANCE_DEG) {
            continue
        }

        const distanceDeg = angularDistanceDeg(
            referenceVector,
            candidate.vector,
        )

        if (distanceDeg < nearestDistanceDeg) {
            nearest = candidate
            nearestDistanceDeg = distanceDeg
        }
    }

    if (
        !nearest
        || nearestDistanceDeg > MAXIMUM_MATCH_DISTANCE_DEG
    ) {
        return null
    }

    return nearest
}

export function bindStellariumReferenceToCatalog(
    catalog: readonly CatalogStar[],
    reference: StellariumWesternReference,
): BoundStellariumReference {
    const augmentedCatalog = catalog.map((star) => ({ ...star }))
    const catalogVectors = catalog.map((star, index) => ({
        index,
        star,
        vector: toUnitVector(star.raDeg, star.decDeg),
    }))
    const usedCatalogStarIds = new Set<string>()
    const starIdByHip = new Map<number, string>()
    let matchedStarCount = 0
    let syntheticStarCount = 0

    for (const hip of reference.requiredHipIds) {
        const referenceStar = reference.starsByHip.get(hip)

        if (!referenceStar) {
            continue
        }

        const matched = findNearestUnusedCatalogStar(
            referenceStar,
            catalogVectors,
            usedCatalogStarIds,
        )

        if (matched) {
            const matchedStar = augmentedCatalog[matched.index]
            augmentedCatalog[matched.index] = {
                ...matchedStar,
                hip,
                isAsterismVertex: true,
            }
            usedCatalogStarIds.add(matchedStar.id)
            starIdByHip.set(hip, matchedStar.id)
            matchedStarCount += 1
            continue
        }

        const syntheticId = `hip-${hip}`
        augmentedCatalog.push({
            id: syntheticId,
            hr: null,
            hd: null,
            hip,
            name: null,
            raDeg: referenceStar.raDeg,
            decDeg: referenceStar.decDeg,
            magnitude: referenceStar.magnitude,
            isAsterismVertex: true,
        })
        starIdByHip.set(hip, syntheticId)
        syntheticStarCount += 1
    }

    const constellations = reference.constellations.map((constellation) => ({
        iau: constellation.iau,
        name: constellation.name,
        lines: constellation.lines.map((line) => (
            line
                .map((hip) => starIdByHip.get(hip))
                .filter((starId): starId is string => Boolean(starId))
        )).filter((line) => line.length >= 2),
    }))
    const requiredStarIds = new Set(starIdByHip.values())

    return {
        catalog: augmentedCatalog,
        requiredStarIds,
        constellations,
        matchedStarCount,
        syntheticStarCount,
    }
}
