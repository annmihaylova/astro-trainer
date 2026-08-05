export type CatalogStar = {
    id: string
    hr: number
    hd: number | null
    name: string | null
    raDeg: number
    decDeg: number
    magnitude: number
}

export type SkyChartParameters = {
    latitudeDeg: number
    siderealTimeHours: number
    limitingMagnitude: number
}

export type ProjectedStar = CatalogStar & {
    altitudeDeg: number
    azimuthDeg: number
    x: number
    y: number
    radius: number
}
