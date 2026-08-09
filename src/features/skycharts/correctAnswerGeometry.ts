import { messierObjects } from '../../data/messierObjects'
import type { Star } from '../../data/stars'
import {
    projectEquatorialPosition,
} from './astronomy'
import type {
    ChartPoint,
    ReferencePointId,
    SkyChartExerciseTask,
    SkyChartSessionState,
} from './exercise'
import {
    BOUNDARY_CROSSING_GROUPS,
    REFERENCE_POINT_LABELS,
} from './exerciseLabels'
import {
    buildDeckStarCatalogIdMap,
} from './selectableStars'
import type {
    SkyChartMarker,
} from './SkyChartSvg'
import type {
    ProjectedStar,
    SkyChartParameters,
} from './types'


const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI
const OBLIQUITY_DEG = 23.4392911

const GALACTIC_NORTH_POLE_RA_DEG = 192.85948
const GALACTIC_NORTH_POLE_DEC_DEG = 27.12825

export const POINT_TOLERANCE = 25
export const BOUNDARY_TOLERANCE = 25
export const MESSIER_TOLERANCE = 25
export const LATITUDE_TOLERANCE_DEG = 5
export const SIDEREAL_TIME_TOLERANCE_HOURS = 0.5


type Vector3 = {
    x: number
    y: number
    z: number
}


function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}


function vectorLength(vector: Vector3) {
    return Math.hypot(vector.x, vector.y, vector.z)
}


function normalizeVector(vector: Vector3): Vector3 {
    const length = vectorLength(vector)

    if (length <= 1e-15) {
        return { x: 0, y: 0, z: 0 }
    }

    return {
        x: vector.x / length,
        y: vector.y / length,
        z: vector.z / length,
    }
}


function scaleVector(vector: Vector3, scale: number): Vector3 {
    return {
        x: vector.x * scale,
        y: vector.y * scale,
        z: vector.z * scale,
    }
}


function addVectors(first: Vector3, second: Vector3): Vector3 {
    return {
        x: first.x + second.x,
        y: first.y + second.y,
        z: first.z + second.z,
    }
}


function subtractVectors(first: Vector3, second: Vector3): Vector3 {
    return {
        x: first.x - second.x,
        y: first.y - second.y,
        z: first.z - second.z,
    }
}


function dotProduct(first: Vector3, second: Vector3) {
    return (
        first.x * second.x
        + first.y * second.y
        + first.z * second.z
    )
}


function crossProduct(first: Vector3, second: Vector3): Vector3 {
    return {
        x: first.y * second.z - first.z * second.y,
        y: first.z * second.x - first.x * second.z,
        z: first.x * second.y - first.y * second.x,
    }
}


function vectorFromRaDec(raDeg: number, decDeg: number): Vector3 {
    const ra = raDeg * DEG_TO_RAD
    const dec = decDeg * DEG_TO_RAD
    const cosDec = Math.cos(dec)

    return {
        x: cosDec * Math.cos(ra),
        y: cosDec * Math.sin(ra),
        z: Math.sin(dec),
    }
}


function raDecFromVector(vector: Vector3) {
    const normalized = normalizeVector(vector)

    return {
        raDeg: (
            Math.atan2(normalized.y, normalized.x)
            * RAD_TO_DEG
            + 360
        ) % 360,
        decDeg: Math.asin(
            clamp(normalized.z, -1, 1),
        ) * RAD_TO_DEG,
    }
}


function eclipticVector(longitudeDeg: number): Vector3 {
    const longitude = longitudeDeg * DEG_TO_RAD
    const obliquity = OBLIQUITY_DEG * DEG_TO_RAD

    return normalizeVector({
        x: Math.cos(longitude),
        y: Math.sin(longitude) * Math.cos(obliquity),
        z: Math.sin(longitude) * Math.sin(obliquity),
    })
}


const CELESTIAL_EQUATOR_NORMAL: Vector3 = {
    x: 0,
    y: 0,
    z: 1,
}


const ECLIPTIC_NORMAL: Vector3 = normalizeVector({
    x: 0,
    y: -Math.sin(OBLIQUITY_DEG * DEG_TO_RAD),
    z: Math.cos(OBLIQUITY_DEG * DEG_TO_RAD),
})


const GALACTIC_EQUATOR_NORMAL = vectorFromRaDec(
    GALACTIC_NORTH_POLE_RA_DEG,
    GALACTIC_NORTH_POLE_DEC_DEG,
)


function ascendingGalacticNode(
    referencePlaneNormal: Vector3,
) {
    const firstNode = normalizeVector(
        crossProduct(
            GALACTIC_EQUATOR_NORMAL,
            referencePlaneNormal,
        ),
    )
    const secondNode = scaleVector(firstNode, -1)

    const firstDerivative = dotProduct(
        crossProduct(
            GALACTIC_EQUATOR_NORMAL,
            firstNode,
        ),
        referencePlaneNormal,
    )

    return firstDerivative > 0
        ? firstNode
        : secondNode
}


function referencePointVector(
    pointId: ReferencePointId,
): Vector3 {
    switch (pointId) {
        case 'vernal-equinox':
            return eclipticVector(0)

        case 'autumnal-equinox':
            return eclipticVector(180)

        case 'june-solstice':
            return eclipticVector(90)

        case 'december-solstice':
            return eclipticVector(270)

        case 'galactic-celestial-intersection':
            return ascendingGalacticNode(
                CELESTIAL_EQUATOR_NORMAL,
            )

        case 'ecliptic-galactic-intersection':
            return ascendingGalacticNode(
                ECLIPTIC_NORMAL,
            )
    }
}


function chartCenterVector(
    parameters: SkyChartParameters,
) {
    if (parameters.mode === 'visible-hemisphere') {
        return vectorFromRaDec(
            parameters.siderealTimeHours * 15,
            parameters.latitudeDeg,
        )
    }

    return vectorFromRaDec(
        parameters.centerRaHours * 15,
        parameters.centerDecDeg,
    )
}


function chartAngularRadiusDeg(
    parameters: SkyChartParameters,
) {
    return parameters.mode === 'visible-hemisphere'
        ? 90
        : parameters.angularDiameterDeg / 2
}


function greatCircleBoundaryIntersections(
    greatCircleNormalValue: Vector3,
    parameters: SkyChartParameters,
) {
    const normal = normalizeVector(
        greatCircleNormalValue,
    )
    const center = chartCenterVector(parameters)
    const radius = (
        chartAngularRadiusDeg(parameters)
        * DEG_TO_RAD
    )
    const centerNormalComponent = scaleVector(
        normal,
        dotProduct(center, normal),
    )
    const projectedCenter = subtractVectors(
        center,
        centerNormalComponent,
    )
    const projectedCenterLength = vectorLength(
        projectedCenter,
    )
    const targetDot = Math.cos(radius)

    if (projectedCenterLength <= 1e-12) {
        return []
    }

    const coefficient = (
        targetDot / projectedCenterLength
    )

    if (Math.abs(coefficient) > 1 + 1e-10) {
        return []
    }

    const clampedCoefficient = clamp(
        coefficient,
        -1,
        1,
    )
    const firstBasis = scaleVector(
        projectedCenter,
        1 / projectedCenterLength,
    )
    const secondBasis = normalizeVector(
        crossProduct(normal, firstBasis),
    )
    const secondCoefficient = Math.sqrt(
        Math.max(
            0,
            1 - clampedCoefficient ** 2,
        ),
    )

    const first = normalizeVector(addVectors(
        scaleVector(
            firstBasis,
            clampedCoefficient,
        ),
        scaleVector(
            secondBasis,
            secondCoefficient,
        ),
    ))

    if (secondCoefficient < 1e-9) {
        return [first]
    }

    const second = normalizeVector(addVectors(
        scaleVector(
            firstBasis,
            clampedCoefficient,
        ),
        scaleVector(
            secondBasis,
            -secondCoefficient,
        ),
    ))

    return [first, second]
}


function boundaryNormal(groupId: string) {
    switch (groupId) {
        case 'celestial-equator':
            return CELESTIAL_EQUATOR_NORMAL

        case 'galactic-equator':
            return GALACTIC_EQUATOR_NORMAL

        case 'ecliptic':
            return ECLIPTIC_NORMAL

        default:
            return null
    }
}


function projectVector(
    vector: Vector3,
    parameters: SkyChartParameters,
    nudgeInside = false,
): ChartPoint | null {
    const value = nudgeInside
        ? normalizeVector(addVectors(
            vector,
            scaleVector(
                chartCenterVector(parameters),
                1e-9,
            ),
        ))
        : vector
    const coordinates = raDecFromVector(value)
    const projected = projectEquatorialPosition(
        coordinates.raDeg,
        coordinates.decDeg,
        parameters,
    )

    return projected
        ? {
            x: projected.x,
            y: projected.y,
        }
        : null
}


export function projectReferencePoint(
    pointId: ReferencePointId,
    parameters: SkyChartParameters,
) {
    return projectVector(
        referencePointVector(pointId),
        parameters,
    )
}


export function projectBoundaryGroup(
    groupId: string,
    parameters: SkyChartParameters,
) {
    const normal = boundaryNormal(groupId)

    if (!normal) {
        return [] as readonly ChartPoint[]
    }

    return greatCircleBoundaryIntersections(
        normal,
        parameters,
    )
        .map((vector) => projectVector(
            vector,
            parameters,
            true,
        ))
        .filter(
            (point): point is ChartPoint => (
                point !== null
            ),
        )
}


function parseRightAscensionDeg(value: string) {
    const match = value.match(
        /(\d+(?:\.\d+)?)\s*h\s*(\d+(?:\.\d+)?)\s*m\s*(\d+(?:\.\d+)?)\s*s/i,
    )

    if (!match) {
        return null
    }

    const [, hours, minutes, seconds] = match

    return 15 * (
        Number(hours)
        + Number(minutes) / 60
        + Number(seconds) / 3600
    )
}


function parseDeclinationDeg(value: string) {
    const match = value.trim().match(
        /^([+-])\s*(\d+(?:\.\d+)?)\s*[°º]\s*(\d+(?:\.\d+)?)\s*[′']\s*(\d+(?:\.\d+)?)\s*[″"]?$/u,
    )

    if (!match) {
        return null
    }

    const [
        ,
        sign,
        degrees,
        minutes,
        seconds,
    ] = match

    const absolute = (
        Number(degrees)
        + Number(minutes) / 60
        + Number(seconds) / 3600
    )

    return sign === '-'
        ? -absolute
        : absolute
}


export function messierCoordinates(number: number) {
    const object = messierObjects.find(
        (currentObject) => (
            currentObject.number === number
        ),
    )

    if (!object) {
        return null
    }

    const raDeg = parseRightAscensionDeg(
        object.rightAscension,
    )
    const decDeg = parseDeclinationDeg(
        object.declination,
    )

    if (raDeg === null || decDeg === null) {
        return null
    }

    return {
        raDeg,
        decDeg,
    }
}


export function projectMessier(
    number: number,
    parameters: SkyChartParameters,
) {
    const coordinates = messierCoordinates(number)

    if (!coordinates) {
        return null
    }

    const projected = projectEquatorialPosition(
        coordinates.raDeg,
        coordinates.decDeg,
        parameters,
    )

    return projected
        ? {
            x: projected.x,
            y: projected.y,
        }
        : null
}


type BuildCorrectAnswerMarkersOptions = {
    session: SkyChartSessionState
    activeTask: SkyChartExerciseTask
    projectedStarsById: ReadonlyMap<
        string,
        ProjectedStar
    >
    starDeckById: ReadonlyMap<string, Star>
}


export function buildCorrectAnswerMarkers({
    session,
    activeTask,
    projectedStarsById,
    starDeckById,
}: BuildCorrectAnswerMarkersOptions) {
    const markers: SkyChartMarker[] = []
    const chartTasks = session.exercise.tasks.filter(
        (task) => (
            task.chartId === session.activeChartId
        ),
    )
    const visibleCatalog = [
        ...projectedStarsById.values(),
    ]
    const visibleCatalogIdByDeckStarId = (
        buildDeckStarCatalogIdMap(
            visibleCatalog,
        )
    )

    for (const task of chartTasks) {
        const chart = session.exercise.charts.find(
            (currentChart) => (
                currentChart.id === task.chartId
            ),
        )

        if (!chart) {
            continue
        }

        const active = task.id === activeTask.id
        const parameters = chart.parameters

        if (task.kind === 'reference-points') {
            for (const pointId of task.pointIds) {
                const point = projectReferencePoint(
                    pointId,
                    parameters,
                )

                if (!point) {
                    continue
                }

                markers.push({
                    id: `correct-${task.id}-${pointId}`,
                    x: point.x,
                    y: point.y,
                    label: REFERENCE_POINT_LABELS[
                        pointId
                    ],
                    shape: 'cross',
                    active,
                    status: 'correct',
                    reference: true,
                    toleranceRadius: (
                        POINT_TOLERANCE
                    ),
                })
            }

            continue
        }

        if (task.kind === 'boundary-crossings') {
            for (
                const group
                of BOUNDARY_CROSSING_GROUPS
            ) {
                if (
                    !group.targetIds.some(
                        (targetId) => (
                            task.crossingIds.includes(
                                targetId,
                            )
                        ),
                    )
                ) {
                    continue
                }

                const points = projectBoundaryGroup(
                    group.id,
                    parameters,
                )

                points.forEach(
                    (point, pointIndex) => {
                        markers.push({
                            id: (
                                `correct-${task.id}`
                                + `-${group.id}`
                                + `-${pointIndex}`
                            ),
                            x: point.x,
                            y: point.y,
                            label: group.label,
                            shape: 'dot',
                            active,
                            status: 'correct',
                            reference: true,
                            toleranceRadius: (
                                BOUNDARY_TOLERANCE
                            ),
                            labelPlacement: 'inward',
                        })
                    },
                )
            }

            continue
        }

        if (task.kind === 'messier') {
            for (
                const number
                of task.messierNumbers
            ) {
                const point = projectMessier(
                    number,
                    parameters,
                )

                if (!point) {
                    continue
                }

                markers.push({
                    id: (
                        `correct-${task.id}`
                        + `-messier-${number}`
                    ),
                    x: point.x,
                    y: point.y,
                    label: `M${number}`,
                    shape: 'triangle',
                    active,
                    status: 'correct',
                    reference: true,
                    toleranceRadius: (
                        MESSIER_TOLERANCE
                    ),
                })
            }

            continue
        }

        if (task.kind === 'stars') {
            for (const starId of task.starIds) {
                const catalogStarId = (
                    visibleCatalogIdByDeckStarId
                        .get(starId)
                )
                const projectedStar = catalogStarId
                    ? projectedStarsById.get(
                        catalogStarId,
                    )
                    : null
                const deckStar = starDeckById.get(
                    starId,
                )

                if (!projectedStar || !deckStar) {
                    continue
                }

                markers.push({
                    id: (
                        `correct-${task.id}`
                        + `-star-${starId}`
                    ),
                    x: projectedStar.x,
                    y: projectedStar.y,
                    label: deckStar.name,
                    secondaryLabel: (
                        deckStar.designation
                    ),
                    shape: 'ring',
                    active,
                    status: 'correct',
                    reference: true,
                })
            }
        }
    }

    return markers
}
