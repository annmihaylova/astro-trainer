import { stars as namedStarDeck } from '../../data/stars'
import type {
    CatalogStar,
    ProjectedStar,
} from './types'

const GREEK_TO_BSC: Readonly<Record<string, string>> = {
    α: 'ALP',
    β: 'BET',
    γ: 'GAM',
    δ: 'DEL',
    ε: 'EPS',
    ζ: 'ZET',
    η: 'ETA',
    θ: 'THE',
    ι: 'IOT',
    κ: 'KAP',
    λ: 'LAM',
    μ: 'MU',
    ν: 'NU',
    ξ: 'XI',
    ο: 'OMI',
    π: 'PI',
    ρ: 'RHO',
    σ: 'SIG',
    τ: 'TAU',
    υ: 'UPS',
    φ: 'PHI',
    χ: 'CHI',
    ψ: 'PSI',
    ω: 'OME',
}

const BSC_GREEK_CODES = new Set(Object.values(GREEK_TO_BSC))

const SUPERSCRIPT_DIGITS: Readonly<Record<string, string>> = {
    '⁰': '0',
    '¹': '1',
    '²': '2',
    '³': '3',
    '⁴': '4',
    '⁵': '5',
    '⁶': '6',
    '⁷': '7',
    '⁸': '8',
    '⁹': '9',
}

const EXTRA_STAR_MINIMUM_DISTANCE = 44
const EXTRA_STAR_LIMITING_MAGNITUDE = 5.0
const MINIMUM_SELECTABLE_COUNT = 24
const MAXIMUM_SELECTABLE_COUNT = 96

function replaceSuperscriptDigits(value: string) {
    return [...value].map((character) => (
        SUPERSCRIPT_DIGITS[character] ?? character
    )).join('')
}

function deckDesignationKeys(designation: string) {
    const keys: string[] = []

    for (const rawPart of designation.split(/\s*[-–—]\s*/u)) {
        const part = replaceSuperscriptDigits(rawPart.trim())
        const match = part.match(
            /^([αβγδεζηθικλμνξοπρστυφχψω])\s*([0-9]?)\s+([A-Za-z]{3})$/u,
        )

        if (!match) {
            continue
        }

        const [, greekLetter, component, constellation] = match
        const bscGreek = GREEK_TO_BSC[greekLetter]

        if (!bscGreek) {
            continue
        }

        keys.push([
            bscGreek,
            component,
            constellation.toUpperCase(),
        ].join(':'))
    }

    return keys
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
    const greek = rawGreek.toUpperCase()

    if (!BSC_GREEK_CODES.has(greek)) {
        return null
    }

    return [
        greek,
        component,
        rawConstellation.toUpperCase(),
    ].join(':')
}

function squaredDistance(
    firstStar: ProjectedStar,
    secondStar: ProjectedStar,
) {
    return (
        (firstStar.x - secondStar.x) ** 2
        + (firstStar.y - secondStar.y) ** 2
    )
}

function targetSelectableCount(visibleStarCount: number) {
    return Math.min(
        MAXIMUM_SELECTABLE_COUNT,
        Math.max(
            MINIMUM_SELECTABLE_COUNT,
            Math.round(Math.sqrt(visibleStarCount) * 1.25),
        ),
    )
}

export function buildDeckStarCatalogIdMap(
    catalog: readonly CatalogStar[],
) {
    const catalogIdByDesignationKey = new Map<string, string>()

    for (const catalogStar of catalog) {
        const key = catalogDesignationKey(catalogStar.name)

        if (key && !catalogIdByDesignationKey.has(key)) {
            catalogIdByDesignationKey.set(key, catalogStar.id)
        }
    }

    const catalogIdByDeckStarId = new Map<string, string>()

    for (const deckStar of namedStarDeck) {
        for (const key of deckDesignationKeys(deckStar.designation)) {
            const catalogStarId = catalogIdByDesignationKey.get(key)

            if (catalogStarId) {
                catalogIdByDeckStarId.set(deckStar.id, catalogStarId)
                break
            }
        }
    }

    return catalogIdByDeckStarId
}

export function buildNamedCatalogStarIds(
    catalog: readonly CatalogStar[],
) {
    return new Set(buildDeckStarCatalogIdMap(catalog).values())
}

export type SelectableStarOptions = {
    namedStarIds: ReadonlySet<string>
    requiredAsterismStarIds?: ReadonlySet<string>
}

export function chooseSelectableStars(
    visibleStars: readonly ProjectedStar[],
    options: SelectableStarOptions,
) {
    const requiredAsterismStarIds = (
        options.requiredAsterismStarIds ?? new Set<string>()
    )
    const selectedStars: ProjectedStar[] = []
    const selectedIds = new Set<string>()

    function addStar(star: ProjectedStar) {
        if (selectedIds.has(star.id)) {
            return
        }

        selectedIds.add(star.id)
        selectedStars.push(star)
    }

    visibleStars
        .filter((star) => requiredAsterismStarIds.has(star.id))
        .sort((first, second) => first.magnitude - second.magnitude)
        .forEach(addStar)

    visibleStars
        .filter((star) => options.namedStarIds.has(star.id))
        .sort((first, second) => first.magnitude - second.magnitude)
        .forEach(addStar)

    const targetCount = Math.max(
        selectedStars.length,
        targetSelectableCount(visibleStars.length),
    )
    const extraCandidates = visibleStars.filter((star) => (
        !selectedIds.has(star.id)
        && star.magnitude <= EXTRA_STAR_LIMITING_MAGNITUDE
    ))

    while (
        selectedStars.length < targetCount
        && extraCandidates.length > 0
    ) {
        let bestCandidateIndex = -1
        let bestMinimumDistanceSquared = -1
        let bestMagnitude = Number.POSITIVE_INFINITY

        for (
            let candidateIndex = 0;
            candidateIndex < extraCandidates.length;
            candidateIndex += 1
        ) {
            const candidate = extraCandidates[candidateIndex]
            let minimumDistanceSquared = Number.POSITIVE_INFINITY

            for (const selectedStar of selectedStars) {
                minimumDistanceSquared = Math.min(
                    minimumDistanceSquared,
                    squaredDistance(candidate, selectedStar),
                )
            }

            if (selectedStars.length === 0) {
                minimumDistanceSquared = Number.POSITIVE_INFINITY
            }

            if (
                minimumDistanceSquared > bestMinimumDistanceSquared
                || (
                    minimumDistanceSquared === bestMinimumDistanceSquared
                    && candidate.magnitude < bestMagnitude
                )
            ) {
                bestCandidateIndex = candidateIndex
                bestMinimumDistanceSquared = minimumDistanceSquared
                bestMagnitude = candidate.magnitude
            }
        }

        if (bestCandidateIndex < 0) {
            break
        }

        if (
            selectedStars.length > 0
            && bestMinimumDistanceSquared
                < EXTRA_STAR_MINIMUM_DISTANCE ** 2
        ) {
            break
        }

        const [bestCandidate] = extraCandidates.splice(
            bestCandidateIndex,
            1,
        )
        addStar(bestCandidate)
    }

    return selectedStars
}
