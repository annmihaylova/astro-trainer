import type {
    BoundaryCrossingId,
    ReferencePointId,
} from './exercise'

export const REFERENCE_POINT_LABELS: Readonly<Record<ReferencePointId, string>> = {
    'vernal-equinox': '♈',
    'autumnal-equinox': '♎',
    'june-solstice': '♋',
    'december-solstice': '♑',
    'galactic-celestial-intersection': 'Γ',
    'ecliptic-galactic-intersection': 'ε',
}

export const REFERENCE_POINT_NAMES: Readonly<Record<ReferencePointId, string>> = {
    'vernal-equinox': 'Весеннее равноденствие',
    'autumnal-equinox': 'Осеннее равноденствие',
    'june-solstice': 'Летнее солнцестояние',
    'december-solstice': 'Зимнее солнцестояние',
    'galactic-celestial-intersection': 'Пересечение галактического и небесного экваторов',
    'ecliptic-galactic-intersection': 'Пересечение эклиптики и галактического экватора',
}

// Внутри ответа две точки каждой пары по-прежнему имеют разные id.
// Это удобно для хранения, но пользователь видит только E / Γ / ε,
// а при проверке порядок двух точек пары не должен иметь значения.
export const BOUNDARY_CROSSING_LABELS: Readonly<Record<BoundaryCrossingId, string>> = {
    'celestial-equator-1': 'E',
    'celestial-equator-2': 'E',
    'galactic-equator-1': 'Γ',
    'galactic-equator-2': 'Γ',
    'ecliptic-1': 'ε',
    'ecliptic-2': 'ε',
}

export type BoundaryCrossingGroupId = (
    | 'celestial-equator'
    | 'galactic-equator'
    | 'ecliptic'
)

export type BoundaryCrossingGroup = {
    id: BoundaryCrossingGroupId
    label: string
    targetIds: readonly [
        BoundaryCrossingId,
        BoundaryCrossingId,
    ]
}

export const BOUNDARY_CROSSING_GROUPS: readonly BoundaryCrossingGroup[] = [
    {
        id: 'celestial-equator',
        label: 'E',
        targetIds: [
            'celestial-equator-1',
            'celestial-equator-2',
        ],
    },
    {
        id: 'galactic-equator',
        label: 'Γ',
        targetIds: [
            'galactic-equator-1',
            'galactic-equator-2',
        ],
    },
    {
        id: 'ecliptic',
        label: 'ε',
        targetIds: [
            'ecliptic-1',
            'ecliptic-2',
        ],
    },
]
