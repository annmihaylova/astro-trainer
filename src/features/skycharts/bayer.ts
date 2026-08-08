export const BAYER_GREEK_LETTERS = [
    'α',
    'β',
    'γ',
    'δ',
    'ε',
    'ζ',
    'η',
    'θ',
    'ι',
    'κ',
    'λ',
    'μ',
    'ν',
    'ξ',
    'ο',
    'π',
    'ρ',
    'σ',
    'τ',
    'υ',
    'φ',
    'χ',
    'ψ',
    'ω',
] as const


export const IAU_CONSTELLATION_ABBREVIATIONS = [
    'And',
    'Ant',
    'Aps',
    'Aqr',
    'Aql',
    'Ara',
    'Ari',
    'Aur',
    'Boo',
    'Cae',
    'Cam',
    'Cnc',
    'CVn',
    'CMa',
    'CMi',
    'Cap',
    'Car',
    'Cas',
    'Cen',
    'Cep',
    'Cet',
    'Cha',
    'Cir',
    'Col',
    'Com',
    'CrA',
    'CrB',
    'Crv',
    'Crt',
    'Cru',
    'Cyg',
    'Del',
    'Dor',
    'Dra',
    'Equ',
    'Eri',
    'For',
    'Gem',
    'Gru',
    'Her',
    'Hor',
    'Hya',
    'Hyi',
    'Ind',
    'Lac',
    'Leo',
    'LMi',
    'Lep',
    'Lib',
    'Lup',
    'Lyn',
    'Lyr',
    'Men',
    'Mic',
    'Mon',
    'Mus',
    'Nor',
    'Oct',
    'Oph',
    'Ori',
    'Pav',
    'Peg',
    'Per',
    'Phe',
    'Pic',
    'Psc',
    'PsA',
    'Pup',
    'Pyx',
    'Ret',
    'Sge',
    'Sgr',
    'Sco',
    'Scl',
    'Sct',
    'Ser',
    'Sex',
    'Tau',
    'Tel',
    'Tri',
    'TrA',
    'Tuc',
    'UMa',
    'UMi',
    'Vel',
    'Vir',
    'Vol',
    'Vul',
] as const


const GREEK_PATTERN = /[αβγδεζηθικλμνξοπρστυφχψω]/u
const CONSTELLATION_PATTERN = /\b([A-Za-z]{3})\b/u
const INDEX_PATTERN = /[0-9⁰¹²³⁴⁵⁶⁷⁸⁹]/gu


export type SimpleBayerDesignation = {
    greekLetter: string
    constellation: string
}


export function parseSimpleBayerDesignation(
    value: string,
): SimpleBayerDesignation {
    const normalized = value
        .replace(INDEX_PATTERN, '')
        .replace(/\s+/gu, ' ')
        .trim()

    return {
        greekLetter: normalized.match(GREEK_PATTERN)?.[0] ?? '',
        constellation: normalized.match(CONSTELLATION_PATTERN)?.[1] ?? '',
    }
}


export function buildSimpleBayerDesignation(
    greekLetter: string,
    constellation: string,
) {
    return [greekLetter, constellation]
        .filter(Boolean)
        .join(' ')
}
