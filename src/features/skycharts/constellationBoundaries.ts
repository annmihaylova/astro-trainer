import type {
    EquatorialFieldParameters,
    SkyChartParameters,
    VisibleHemisphereParameters,
} from './types'

const CONSTELLATION_BOUNDARIES_URL = (
    'https://raw.githubusercontent.com/'
    + 'ofrohn/d3-celestial/'
    + '7e720a3de062059d4c5400a379146a601d9010e0/'
    + 'data/constellations.bounds.json'
)

const DEG_TO_RAD = Math.PI / 180
const MAX_INTERPOLATION_STEP_DEG = 0.75
const DEFAULT_VIEWPORT_SIZE = 1000
const DEFAULT_CHART_PADDING = 28

export type ConstellationEvaluationStatus = 'correct' | 'incorrect'

export type EquatorialBoundaryPoint = {
    raDeg: number
    decDeg: number
}

export type ConstellationBoundaryPolygon = readonly (
    readonly EquatorialBoundaryPoint[]
)[]

export type ConstellationBoundary = {
    iau: string
    polygons: readonly ConstellationBoundaryPolygon[]
}

export type ProjectedConstellationHighlight = {
    id: string
    status: ConstellationEvaluationStatus
    paths: readonly string[]
}

type ChartPoint = {
    x: number
    y: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function finiteNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value)
        ? value
        : null
}

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}

function normalizeHours(value: number) {
    return ((value % 24) + 24) % 24
}

function normalizeRadians(value: number) {
    const fullTurn = 2 * Math.PI
    return ((value % fullTurn) + fullTurn) % fullTurn
}

export function normalizeConstellationId(value: string) {
    return value.trim().toUpperCase()
}

function parseBoundaryPoint(value: unknown): EquatorialBoundaryPoint | null {
    if (!Array.isArray(value)) {
        return null
    }

    const longitudeDeg = finiteNumber(value[0])
    const decDeg = finiteNumber(value[1])

    if (longitudeDeg === null || decDeg === null) {
        return null
    }

    return {
        raDeg: longitudeDeg,
        decDeg: clamp(decDeg, -90, 90),
    }
}

function parseBoundaryRing(value: unknown) {
    if (!Array.isArray(value)) {
        return null
    }

    const points = value
        .map(parseBoundaryPoint)
        .filter((point): point is EquatorialBoundaryPoint => point !== null)

    if (points.length < 3) {
        return null
    }

    return points
}

function parseBoundaryPolygon(value: unknown) {
    if (!Array.isArray(value)) {
        return null
    }

    const rings = value
        .map(parseBoundaryRing)
        .filter((ring): ring is EquatorialBoundaryPoint[] => ring !== null)

    if (rings.length === 0) {
        return null
    }

    return rings
}

function parseGeometry(value: unknown): ConstellationBoundaryPolygon[] {
    if (!isRecord(value) || typeof value.type !== 'string') {
        return []
    }

    if (value.type === 'Polygon') {
        const polygon = parseBoundaryPolygon(value.coordinates)
        return polygon ? [polygon] : []
    }

    if (value.type === 'MultiPolygon' && Array.isArray(value.coordinates)) {
        return value.coordinates
            .map(parseBoundaryPolygon)
            .filter((polygon): polygon is EquatorialBoundaryPoint[][] => (
                polygon !== null
            ))
    }

    return []
}

function parseConstellationBoundaries(value: unknown) {
    if (!isRecord(value) || !Array.isArray(value.features)) {
        throw new Error('В данных нет границ созвездий IAU.')
    }

    const boundaries: ConstellationBoundary[] = []

    for (const rawFeature of value.features) {
        if (!isRecord(rawFeature) || typeof rawFeature.id !== 'string') {
            continue
        }

        const polygons = parseGeometry(rawFeature.geometry)

        if (polygons.length === 0) {
            continue
        }

        boundaries.push({
            iau: normalizeConstellationId(rawFeature.id),
            polygons,
        })
    }

    if (boundaries.length === 0) {
        throw new Error('Не удалось разобрать границы созвездий IAU.')
    }

    return boundaries
}

export async function loadConstellationBoundaries(
    signal: AbortSignal,
): Promise<readonly ConstellationBoundary[]> {
    const response = await fetch(
        CONSTELLATION_BOUNDARIES_URL,
        { signal },
    )

    if (!response.ok) {
        throw new Error(
            `Не удалось загрузить границы созвездий: ${response.status}`,
        )
    }

    return parseConstellationBoundaries(
        await response.json() as unknown,
    )
}

function unwrapRightAscensionDelta(deltaDeg: number) {
    return ((deltaDeg + 540) % 360) - 180
}

function interpolateBoundarySegment(
    startPoint: EquatorialBoundaryPoint,
    endPoint: EquatorialBoundaryPoint,
) {
    const raDeltaDeg = unwrapRightAscensionDelta(
        endPoint.raDeg - startPoint.raDeg,
    )
    const decDeltaDeg = endPoint.decDeg - startPoint.decDeg
    const middleDecRad = (
        (startPoint.decDeg + endPoint.decDeg)
        / 2
        * DEG_TO_RAD
    )
    const approximateAngularLengthDeg = Math.hypot(
        raDeltaDeg * Math.cos(middleDecRad),
        decDeltaDeg,
    )
    const stepCount = Math.max(
        1,
        Math.ceil(
            approximateAngularLengthDeg
            / MAX_INTERPOLATION_STEP_DEG,
        ),
    )
    const points: EquatorialBoundaryPoint[] = []

    for (let stepIndex = 0; stepIndex < stepCount; stepIndex += 1) {
        const fraction = stepIndex / stepCount

        points.push({
            raDeg: startPoint.raDeg + raDeltaDeg * fraction,
            decDeg: startPoint.decDeg + decDeltaDeg * fraction,
        })
    }

    return points
}

function interpolateBoundaryRing(
    ring: readonly EquatorialBoundaryPoint[],
) {
    const points: EquatorialBoundaryPoint[] = []

    for (let pointIndex = 0; pointIndex < ring.length; pointIndex += 1) {
        const startPoint = ring[pointIndex]
        const endPoint = ring[(pointIndex + 1) % ring.length]

        points.push(...interpolateBoundarySegment(
            startPoint,
            endPoint,
        ))
    }

    return points
}

function projectVisibleHemispherePoint(
    point: EquatorialBoundaryPoint,
    parameters: VisibleHemisphereParameters,
    viewportSize: number,
    chartPadding: number,
): ChartPoint {
    const latitudeRad = parameters.latitudeDeg * DEG_TO_RAD
    const siderealTimeRad = (
        normalizeHours(parameters.siderealTimeHours)
        * 15
        * DEG_TO_RAD
    )
    const rightAscensionRad = point.raDeg * DEG_TO_RAD
    const declinationRad = point.decDeg * DEG_TO_RAD
    const hourAngle = Math.atan2(
        Math.sin(siderealTimeRad - rightAscensionRad),
        Math.cos(siderealTimeRad - rightAscensionRad),
    )
    const sinLatitude = Math.sin(latitudeRad)
    const cosLatitude = Math.cos(latitudeRad)
    const sinDeclination = Math.sin(declinationRad)
    const cosDeclination = Math.cos(declinationRad)
    const sinHourAngle = Math.sin(hourAngle)
    const cosHourAngle = Math.cos(hourAngle)
    const east = -cosDeclination * sinHourAngle
    const north = (
        sinDeclination * cosLatitude
        - cosDeclination * cosHourAngle * sinLatitude
    )
    const up = clamp(
        sinDeclination * sinLatitude
        + cosDeclination * cosHourAngle * cosLatitude,
        -1,
        1,
    )
    const zenithDistanceRad = Math.acos(up)
    const azimuthRad = normalizeRadians(Math.atan2(east, north))
    const chartCenter = viewportSize / 2
    const chartRadius = chartCenter - chartPadding
    const radialDistance = (
        zenithDistanceRad
        / (Math.PI / 2)
        * chartRadius
    )

    return {
        x: chartCenter - radialDistance * Math.sin(azimuthRad),
        y: chartCenter - radialDistance * Math.cos(azimuthRad),
    }
}

function projectEquatorialFieldPoint(
    point: EquatorialBoundaryPoint,
    parameters: EquatorialFieldParameters,
    viewportSize: number,
    chartPadding: number,
): ChartPoint {
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
    const raRad = point.raDeg * DEG_TO_RAD
    const decRad = point.decDeg * DEG_TO_RAD
    const cosDec = Math.cos(decRad)
    const pointVector = {
        x: cosDec * Math.cos(raRad),
        y: cosDec * Math.sin(raRad),
        z: Math.sin(decRad),
    }
    const dotCenter = clamp(
        pointVector.x * centerVector.x
        + pointVector.y * centerVector.y
        + pointVector.z * centerVector.z,
        -1,
        1,
    )
    const angularDistanceRad = Math.acos(dotCenter)
    const sinDistance = Math.sin(angularDistanceRad)
    const chartCenter = viewportSize / 2
    const chartRadius = chartCenter - chartPadding
    const radialDistance = (
        angularDistanceRad
        / angularRadiusRad
        * chartRadius
    )
    let baseDx = radialDistance
    let baseDy = 0

    if (sinDistance > 1e-9) {
        const eastComponent = (
            pointVector.x * eastVector.x
            + pointVector.y * eastVector.y
            + pointVector.z * eastVector.z
        ) / sinDistance
        const northComponent = (
            pointVector.x * northVector.x
            + pointVector.y * northVector.y
            + pointVector.z * northVector.z
        ) / sinDistance

        baseDx = -radialDistance * eastComponent
        baseDy = -radialDistance * northComponent
    }

    const cosRotation = Math.cos(rotationRad)
    const sinRotation = Math.sin(rotationRad)
    const rotatedDx = (
        baseDx * cosRotation
        - baseDy * sinRotation
    )
    const rotatedDy = (
        baseDx * sinRotation
        + baseDy * cosRotation
    )

    return {
        x: chartCenter + rotatedDx,
        y: chartCenter + rotatedDy,
    }
}

function projectBoundaryPoint(
    point: EquatorialBoundaryPoint,
    parameters: SkyChartParameters,
    viewportSize: number,
    chartPadding: number,
) {
    if (parameters.mode === 'visible-hemisphere') {
        return projectVisibleHemispherePoint(
            point,
            parameters,
            viewportSize,
            chartPadding,
        )
    }

    return projectEquatorialFieldPoint(
        point,
        parameters,
        viewportSize,
        chartPadding,
    )
}

function numberForPath(value: number) {
    return Number(value.toFixed(2))
}

function buildProjectedPolygonPath(
    polygon: ConstellationBoundaryPolygon,
    parameters: SkyChartParameters,
    viewportSize: number,
    chartPadding: number,
) {
    const pathParts: string[] = []

    for (const ring of polygon) {
        const projectedPoints = interpolateBoundaryRing(ring).map(
            (point) => projectBoundaryPoint(
                point,
                parameters,
                viewportSize,
                chartPadding,
            ),
        )

        if (projectedPoints.length < 3) {
            continue
        }

        pathParts.push(
            `M ${numberForPath(projectedPoints[0].x)} ${numberForPath(projectedPoints[0].y)}`,
        )

        for (const point of projectedPoints.slice(1)) {
            pathParts.push(
                `L ${numberForPath(point.x)} ${numberForPath(point.y)}`,
            )
        }

        pathParts.push('Z')
    }

    return pathParts.join(' ')
}

export function projectEvaluatedConstellationBoundaries(
    boundaries: readonly ConstellationBoundary[],
    statusesByConstellationId: ReadonlyMap<
        string,
        ConstellationEvaluationStatus
    >,
    parameters: SkyChartParameters,
    viewportSize = DEFAULT_VIEWPORT_SIZE,
    chartPadding = DEFAULT_CHART_PADDING,
): readonly ProjectedConstellationHighlight[] {
    const highlights: ProjectedConstellationHighlight[] = []

    for (const boundary of boundaries) {
        const status = statusesByConstellationId.get(boundary.iau)

        if (!status) {
            continue
        }

        const paths = boundary.polygons
            .map((polygon) => buildProjectedPolygonPath(
                polygon,
                parameters,
                viewportSize,
                chartPadding,
            ))
            .filter((path) => path.length > 0)

        if (paths.length === 0) {
            continue
        }

        highlights.push({
            id: boundary.iau,
            status,
            paths,
        })
    }

    return highlights
}
