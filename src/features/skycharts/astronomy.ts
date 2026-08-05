import type {
    CatalogStar,
    ProjectedStar,
    SkyChartParameters,
} from './types'

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}

function normalizeRadians(value: number) {
    const fullTurn = 2 * Math.PI
    return ((value % fullTurn) + fullTurn) % fullTurn
}

const STAR_REFERENCE_MAGNITUDE = 0
const STAR_REFERENCE_DIAMETER = 5
const STAR_SIZE_SCALE = 1.5

// В ноутбуке размер scatter задаётся в типографских пунктах,
// а здесь звёзды рисуются в координатах SVG. Этот коэффициент
// только переводит единицы отображения и не меняет зависимость
// диаметра от звёздной величины.
const MATPLOTLIB_POINT_TO_SVG_UNIT = 1.8

function starRadius(magnitude: number) {
    const diameter = STAR_REFERENCE_DIAMETER * 10 ** (
        -0.2 * (magnitude - STAR_REFERENCE_MAGNITUDE)
    )
    const renderedDiameter = (
        diameter
        * STAR_SIZE_SCALE
        * MATPLOTLIB_POINT_TO_SVG_UNIT
    )

    return renderedDiameter / 2
}

export function projectVisibleHemisphere(
    stars: readonly CatalogStar[],
    parameters: SkyChartParameters,
    viewportSize = 1000,
    chartPadding = 28,
): ProjectedStar[] {
    const latitudeRad = parameters.latitudeDeg * DEG_TO_RAD
    const siderealTimeRad = (
        (parameters.siderealTimeHours % 24 + 24) % 24
    ) * 15 * DEG_TO_RAD

    const sinLatitude = Math.sin(latitudeRad)
    const cosLatitude = Math.cos(latitudeRad)

    const chartCenter = viewportSize / 2
    const chartRadius = chartCenter - chartPadding
    const projectedStars: ProjectedStar[] = []

    for (const star of stars) {
        if (star.magnitude > parameters.limitingMagnitude) {
            continue
        }

        const rightAscensionRad = star.raDeg * DEG_TO_RAD
        const declinationRad = star.decDeg * DEG_TO_RAD
        const hourAngle = Math.atan2(
            Math.sin(siderealTimeRad - rightAscensionRad),
            Math.cos(siderealTimeRad - rightAscensionRad),
        )

        const sinDeclination = Math.sin(declinationRad)
        const cosDeclination = Math.cos(declinationRad)
        const sinHourAngle = Math.sin(hourAngle)
        const cosHourAngle = Math.cos(hourAngle)

        const east = -cosDeclination * sinHourAngle
        const north = (
            sinDeclination * cosLatitude
            - cosDeclination * cosHourAngle * sinLatitude
        )
        const up = (
            sinDeclination * sinLatitude
            + cosDeclination * cosHourAngle * cosLatitude
        )

        if (up < 0) {
            continue
        }

        const altitudeRad = Math.asin(clamp(up, -1, 1))
        const azimuthRad = normalizeRadians(Math.atan2(east, north))
        const zenithDistanceDeg = 90 - altitudeRad * RAD_TO_DEG
        const radialDistance = zenithDistanceDeg / 90 * chartRadius

        // Север сверху. Азимут растёт против часовой стрелки,
        // поэтому восток оказывается слева, как в исходном ноутбуке.
        const x = chartCenter - radialDistance * Math.sin(azimuthRad)
        const y = chartCenter - radialDistance * Math.cos(azimuthRad)

        projectedStars.push({
            ...star,
            altitudeDeg: altitudeRad * RAD_TO_DEG,
            azimuthDeg: azimuthRad * RAD_TO_DEG,
            x,
            y,
            radius: starRadius(star.magnitude),
        })
    }

    return projectedStars
}
