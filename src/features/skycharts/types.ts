export type CatalogStar = {
    id: string
    hr: number | null
    hd: number | null
    hip?: number | null
    name: string | null
    raDeg: number
    decDeg: number
    magnitude: number
    isAsterismVertex?: boolean
}

export type SkyChartMode = (
    | 'visible-hemisphere'
    | 'equatorial-field'
)

export type VisibleHemisphereParameters = {
    mode: 'visible-hemisphere'
    latitudeDeg: number
    siderealTimeHours: number
    limitingMagnitude: number
}

export type EquatorialFieldParameters = {
    mode: 'equatorial-field'
    centerRaHours: number
    centerDecDeg: number
    angularDiameterDeg: number
    rotationDeg: number
    limitingMagnitude: number
}

export type SkyChartParameters = (
    | VisibleHemisphereParameters
    | EquatorialFieldParameters
)

export type ProjectedStar = CatalogStar & {
    x: number
    y: number
    radius: number
    angularDistanceDeg: number
    altitudeDeg: number | null
    azimuthDeg: number | null
}

export type SkyChartLine = {
    id: string
    startStarId: string
    endStarId: string
}
