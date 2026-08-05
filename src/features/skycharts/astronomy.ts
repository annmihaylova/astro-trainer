import type {
    CatalogStar,
    EquatorialFieldParameters,
    ProjectedStar,
    SkyChartParameters,
    VisibleHemisphereParameters,
} from './types'

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI

const STAR_REFERENCE_MAGNITUDE = 0
const STAR_REFERENCE_DIAMETER = 5
const STAR_SIZE_SCALE = 1.5
const STAR_GLOBAL_SIZE_MULTIPLIER = 1.25

// Та же зависимость, что в исходном Python-ноутбуке:
// d = d0 * 10 ** (-0.2 * (Vmag - m0))
// marker_sizes = (d * size_scale) ** 2
//
// В SVG задаём радиус напрямую. Поэтому линейный диаметр маркера
// равен d * size_scale, а радиус — половине этого значения.
// Никаких минимальных размеров и линейного пересчёта по величине нет:
// слабые звёзды действительно должны становиться почти точками.
function starRadius(magnitude: number) {
    const diameter = STAR_REFERENCE_DIAMETER * 10 ** (
        -0.2 * (magnitude - STAR_REFERENCE_MAGNITUDE)
    )

    return (
        diameter
        * STAR_SIZE_SCALE
        * STAR_GLOBAL_SIZE_MULTIPLIER
        / 2
    )
}

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}

function normalizeRadians(value: number) {
    const fullTurn = 2 * Math.PI
    return ((value % fullTurn) + fullTurn) % fullTurn
}

function normalizeHours(value: number) {
    return ((value % 24) + 24) % 24
}


function projectVisibleHemisphere(
    stars: readonly CatalogStar[],
    parameters: VisibleHemisphereParameters,
    viewportSize: number,
    chartPadding: number,
): ProjectedStar[] {
    const latitudeRad = parameters.latitudeDeg * DEG_TO_RAD
    const siderealTimeRad = (
        normalizeHours(parameters.siderealTimeHours)
        * 15
        * DEG_TO_RAD
    )

    const sinLatitude = Math.sin(latitudeRad)
    const cosLatitude = Math.cos(latitudeRad)

    const chartCenter = viewportSize / 2
    const chartRadius = chartCenter - chartPadding
    const projectedStars: ProjectedStar[] = []

    for (const star of stars) {
        if (
            star.magnitude > parameters.limitingMagnitude
            && !star.isAsterismVertex
        ) {
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

        // Север сверху, восток слева — как в исходном ноутбуке.
        const x = chartCenter - radialDistance * Math.sin(azimuthRad)
        const y = chartCenter - radialDistance * Math.cos(azimuthRad)

        projectedStars.push({
            ...star,
            x,
            y,
            radius: starRadius(star.magnitude),
            angularDistanceDeg: zenithDistanceDeg,
            altitudeDeg: altitudeRad * RAD_TO_DEG,
            azimuthDeg: azimuthRad * RAD_TO_DEG,
        })
    }

    return projectedStars
}

function projectEquatorialField(
    stars: readonly CatalogStar[],
    parameters: EquatorialFieldParameters,
    viewportSize: number,
    chartPadding: number,
): ProjectedStar[] {
    const centerRaRad = (
        normalizeHours(parameters.centerRaHours)
        * 15
        * DEG_TO_RAD
    )
    const centerDecRad = (
        clamp(parameters.centerDecDeg, -90, 90)
        * DEG_TO_RAD
    )
    const angularRadiusRad = (
        clamp(parameters.angularDiameterDeg, 2, 180)
        / 2
        * DEG_TO_RAD
    )
    const rotationRad = parameters.rotationDeg * DEG_TO_RAD

    const sinCenterRa = Math.sin(centerRaRad)
    const cosCenterRa = Math.cos(centerRaRad)
    const sinCenterDec = Math.sin(centerDecRad)
    const cosCenterDec = Math.cos(centerDecRad)

    const centerVector = {
        x: cosCenterDec * cosCenterRa,
        y: cosCenterDec * sinCenterRa,
        z: sinCenterDec,
    }
    const eastVector = {
        x: -sinCenterRa,
        y: cosCenterRa,
        z: 0,
    }
    const northVector = {
        x: -sinCenterDec * cosCenterRa,
        y: -sinCenterDec * sinCenterRa,
        z: cosCenterDec,
    }

    const chartCenter = viewportSize / 2
    const chartRadius = chartCenter - chartPadding
    const cosRotation = Math.cos(rotationRad)
    const sinRotation = Math.sin(rotationRad)
    const projectedStars: ProjectedStar[] = []

    for (const star of stars) {
        if (
            star.magnitude > parameters.limitingMagnitude
            && !star.isAsterismVertex
        ) {
            continue
        }

        const raRad = star.raDeg * DEG_TO_RAD
        const decRad = star.decDeg * DEG_TO_RAD
        const cosDec = Math.cos(decRad)
        const starVector = {
            x: cosDec * Math.cos(raRad),
            y: cosDec * Math.sin(raRad),
            z: Math.sin(decRad),
        }

        const dotCenter = clamp(
            starVector.x * centerVector.x
            + starVector.y * centerVector.y
            + starVector.z * centerVector.z,
            -1,
            1,
        )
        const angularDistanceRad = Math.acos(dotCenter)

        if (angularDistanceRad > angularRadiusRad) {
            continue
        }

        let baseDx = 0
        let baseDy = 0
        const sinDistance = Math.sin(angularDistanceRad)

        if (sinDistance > 1e-12) {
            const eastComponent = (
                starVector.x * eastVector.x
                + starVector.y * eastVector.y
                + starVector.z * eastVector.z
            ) / sinDistance
            const northComponent = (
                starVector.x * northVector.x
                + starVector.y * northVector.y
                + starVector.z * northVector.z
            ) / sinDistance
            const radialDistance = (
                angularDistanceRad
                / angularRadiusRad
                * chartRadius
            )

            // В азимутальной эквидистантной проекции расстояние
            // от центра пропорционально угловому расстоянию.
            // Восток направлен влево, север — вверх.
            baseDx = -radialDistance * eastComponent
            baseDy = -radialDistance * northComponent
        }

        // Положительный угол поворачивает карту по часовой стрелке.
        const rotatedDx = (
            baseDx * cosRotation
            - baseDy * sinRotation
        )
        const rotatedDy = (
            baseDx * sinRotation
            + baseDy * cosRotation
        )

        projectedStars.push({
            ...star,
            x: chartCenter + rotatedDx,
            y: chartCenter + rotatedDy,
            radius: starRadius(star.magnitude),
            angularDistanceDeg: angularDistanceRad * RAD_TO_DEG,
            altitudeDeg: null,
            azimuthDeg: null,
        })
    }

    return projectedStars
}

export function projectSkyChart(
    stars: readonly CatalogStar[],
    parameters: SkyChartParameters,
    viewportSize = 1000,
    chartPadding = 28,
): ProjectedStar[] {
    if (parameters.mode === 'visible-hemisphere') {
        return projectVisibleHemisphere(
            stars,
            parameters,
            viewportSize,
            chartPadding,
        )
    }

    return projectEquatorialField(
        stars,
        parameters,
        viewportSize,
        chartPadding,
    )
}
