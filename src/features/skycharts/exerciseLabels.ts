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

export const BOUNDARY_CROSSING_LABELS: Readonly<Record<BoundaryCrossingId, string>> = {
    'celestial-equator-1': 'E1',
    'celestial-equator-2': 'E2',
    'galactic-equator-1': 'Γ1',
    'galactic-equator-2': 'Γ2',
    'ecliptic-1': 'ε1',
    'ecliptic-2': 'ε2',
}
