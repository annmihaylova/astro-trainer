import { messierObjects } from '../../data/messierObjects'
import { stars as starDeck } from '../../data/stars'
import {
    projectEquatorialPosition,
    projectSkyChart,
} from './astronomy'
import { parseSimpleBayerDesignation } from './bayer'
import {
    BOUNDARY_CROSSING_GROUPS,
} from './exerciseLabels'
import type {
    BoundaryCrossingsAnswer,
    ChartPoint,
    MessierAnswer,
    ReferencePointId,
    ReferencePointsAnswer,
    SkyChartExerciseTask,
    SkyChartSessionState,
    SkyChartTaskAnswer,
    SkyChartTaskKind,
    StarsAnswer,
} from './exercise'
import {
    SKY_CHART_TASK_TITLES,
} from './exercise'
import {
    evaluateSkyChart,
} from './evaluateSkyChart'
import type {
    SkyChartEvaluation,
} from './evaluateSkyChart'
import {
    buildDeckStarCatalogIdMap,
} from './selectableStars'
import type {
    BoundStellariumConstellation,
} from './stellariumReference'
import type {
    CatalogStar,
    SkyChartParameters,
} from './types'

const DEG_TO_RAD = Math.PI / 180
const RAD_TO_DEG = 180 / Math.PI
const OBLIQUITY_DEG = 23.4392911

// ICRS/J2000 coordinates of the north Galactic pole.
const GALACTIC_NORTH_POLE_RA_DEG = 192.85948
const GALACTIC_NORTH_POLE_DEC_DEG = 27.12825

// These are deliberately easy to tune after a few real trials.
const POINT_TOLERANCE = 25
const BOUNDARY_TOLERANCE = 25
const MESSIER_TOLERANCE = 25
const LATITUDE_TOLERANCE_DEG = 5
const SIDEREAL_TIME_TOLERANCE_HOURS = 0.5

type Vector3 = {
    x: number
    y: number
    z: number
}

export type SkyChartMarkerEvaluationStatus = (
    | 'correct'
    | 'partial'
    | 'incorrect'
)

export type SkyChartTaskEvaluationResult = {
    taskId: string
    kind: SkyChartTaskKind
    title: string
    scorePercent: number
    details: readonly string[]
}

export type SkyChartExerciseEvaluationResult = {
    scorePercent: number
    tasks: readonly SkyChartTaskEvaluationResult[]
    markerStatuses: Readonly<Record<
        string,
        SkyChartMarkerEvaluationStatus
    >>
    asterismEvaluation: SkyChartEvaluation | null
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
        decDeg: Math.asin(clamp(normalized.z, -1, 1)) * RAD_TO_DEG,
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

function ascendingGalacticNode(referencePlaneNormal: Vector3) {
    const firstNode = normalizeVector(
        crossProduct(GALACTIC_EQUATOR_NORMAL, referencePlaneNormal),
    )
    const secondNode = scaleVector(firstNode, -1)

    // Along increasing Galactic longitude the tangent direction is
    // n_gal x r. The ascending node is where that tangent points to
    // the positive side of the reference plane.
    const firstDerivative = dotProduct(
        crossProduct(GALACTIC_EQUATOR_NORMAL, firstNode),
        referencePlaneNormal,
    )

    return firstDerivative > 0 ? firstNode : secondNode
}

function referencePointVector(pointId: ReferencePointId): Vector3 {
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
            return ascendingGalacticNode(CELESTIAL_EQUATOR_NORMAL)
        case 'ecliptic-galactic-intersection':
            return ascendingGalacticNode(ECLIPTIC_NORMAL)
    }
}

function chartCenterVector(parameters: SkyChartParameters) {
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

function chartAngularRadiusDeg(parameters: SkyChartParameters) {
    return parameters.mode === 'visible-hemisphere'
        ? 90
        : parameters.angularDiameterDeg / 2
}

function greatCircleBoundaryIntersections(
    greatCircleNormalValue: Vector3,
    parameters: SkyChartParameters,
) {
    const normal = normalizeVector(greatCircleNormalValue)
    const center = chartCenterVector(parameters)
    const radius = chartAngularRadiusDeg(parameters) * DEG_TO_RAD
    const centerNormalComponent = scaleVector(
        normal,
        dotProduct(center, normal),
    )
    const projectedCenter = subtractVectors(center, centerNormalComponent)
    const projectedCenterLength = vectorLength(projectedCenter)
    const targetDot = Math.cos(radius)

    if (projectedCenterLength <= 1e-12) {
        // The chart boundary and requested great circle coincide or
        // never intersect in two isolated points. This pathological
        // case is better treated as "no unique answer".
        return []
    }

    const coefficient = targetDot / projectedCenterLength

    if (Math.abs(coefficient) > 1 + 1e-10) {
        return []
    }

    const clampedCoefficient = clamp(coefficient, -1, 1)
    const firstBasis = scaleVector(
        projectedCenter,
        1 / projectedCenterLength,
    )
    const secondBasis = normalizeVector(
        crossProduct(normal, firstBasis),
    )
    const secondCoefficient = Math.sqrt(Math.max(
        0,
        1 - clampedCoefficient ** 2,
    ))
    const first = normalizeVector(addVectors(
        scaleVector(firstBasis, clampedCoefficient),
        scaleVector(secondBasis, secondCoefficient),
    ))

    if (secondCoefficient < 1e-9) {
        return [first]
    }

    const second = normalizeVector(addVectors(
        scaleVector(firstBasis, clampedCoefficient),
        scaleVector(secondBasis, -secondCoefficient),
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
            scaleVector(chartCenterVector(parameters), 1e-9),
        ))
        : vector
    const coordinates = raDecFromVector(value)
    const projected = projectEquatorialPosition(
        coordinates.raDeg,
        coordinates.decDeg,
        parameters,
    )

    return projected
        ? { x: projected.x, y: projected.y }
        : null
}

function pointDistance(first: ChartPoint, second: ChartPoint) {
    return Math.hypot(first.x - second.x, first.y - second.y)
}

function roundPercent(value: number) {
    return Math.round(clamp(value, 0, 100))
}

function taskResult(
    task: SkyChartExerciseTask,
    scorePercent: number,
    details: readonly string[],
): SkyChartTaskEvaluationResult {
    return {
        taskId: task.id,
        kind: task.kind,
        title: SKY_CHART_TASK_TITLES[task.kind],
        scorePercent: roundPercent(scorePercent),
        details,
    }
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

    const [, sign, degrees, minutes, seconds] = match
    const absolute = (
        Number(degrees)
        + Number(minutes) / 60
        + Number(seconds) / 3600
    )

    return sign === '-' ? -absolute : absolute
}

function messierCoordinates(number: number) {
    const object = messierObjects.find(
        (currentObject) => currentObject.number === number,
    )

    if (!object) {
        return null
    }

    const raDeg = parseRightAscensionDeg(object.rightAscension)
    const decDeg = parseDeclinationDeg(object.declination)

    if (raDeg === null || decDeg === null) {
        return null
    }

    return { raDeg, decDeg }
}

function normalizedBayer(value: string) {
    const parsed = parseSimpleBayerDesignation(value)

    return {
        greekLetter: parsed.greekLetter,
        constellation: parsed.constellation.toLowerCase(),
    }
}

function bayerMatches(answer: string, expected: string) {
    const normalizedAnswer = normalizedBayer(answer)
    const normalizedExpected = normalizedBayer(expected)

    return Boolean(
        normalizedAnswer.greekLetter
        && normalizedAnswer.constellation
        && normalizedAnswer.greekLetter === normalizedExpected.greekLetter
        && normalizedAnswer.constellation === normalizedExpected.constellation
    )
}

function finalizeAnswer(
    task: SkyChartExerciseTask,
    answer: SkyChartTaskAnswer,
): SkyChartTaskAnswer {
    if (
        task.kind === 'reference-points'
        && answer.kind === 'reference-points'
    ) {
        const markedIds = new Set(
            answer.markers.map((marker) => marker.targetId),
        )

        return {
            ...answer,
            absentPointIds: task.pointIds.filter(
                (pointId) => !markedIds.has(pointId),
            ),
        }
    }

    if (task.kind === 'stars' && answer.kind === 'stars') {
        const markedIds = new Set(
            answer.markers
                .map((marker) => marker.selectedStarId)
                .filter(Boolean),
        )

        return {
            ...answer,
            absentStarIds: task.starIds.filter(
                (starId) => !markedIds.has(starId),
            ),
        }
    }

    if (task.kind === 'messier' && answer.kind === 'messier') {
        const markedNumbers = new Set(
            answer.markers.map((marker) => marker.messierNumber),
        )

        return {
            ...answer,
            absentMessierNumbers: task.messierNumbers.filter(
                (number) => !markedNumbers.has(number),
            ),
        }
    }

    return answer
}

export function finalizeSkyChartSessionAnswers(
    session: SkyChartSessionState,
): SkyChartSessionState {
    const answersByTaskId: Record<string, SkyChartTaskAnswer> = {
        ...session.answersByTaskId,
    }

    for (const task of session.exercise.tasks) {
        const answer = answersByTaskId[task.id]

        if (answer) {
            answersByTaskId[task.id] = finalizeAnswer(task, answer)
        }
    }

    return {
        ...session,
        answersByTaskId,
        updatedAt: new Date().toISOString(),
    }
}

function evaluateReferencePoints(
    task: Extract<SkyChartExerciseTask, { kind: 'reference-points' }>,
    answer: ReferencePointsAnswer,
    parameters: SkyChartParameters,
    markerStatuses: Record<string, SkyChartMarkerEvaluationStatus>,
) {
    let correct = 0

    for (const pointId of task.pointIds) {
        const expected = projectVector(
            referencePointVector(pointId),
            parameters,
        )
        const marker = answer.markers.find(
            (currentMarker) => currentMarker.targetId === pointId,
        )
        const absent = answer.absentPointIds.includes(pointId)

        if (!expected) {
            if (!marker && absent) {
                correct += 1
            } else if (marker) {
                markerStatuses[marker.id] = 'incorrect'
            }
            continue
        }

        if (marker) {
            const markerCorrect = (
                pointDistance(marker.point, expected) <= POINT_TOLERANCE
            )
            markerStatuses[marker.id] = markerCorrect
                ? 'correct'
                : 'incorrect'

            if (markerCorrect) {
                correct += 1
            }
        }
    }

    return taskResult(
        task,
        correct / task.pointIds.length * 100,
        [`Правильно: ${correct} / ${task.pointIds.length}`],
    )
}

function bestBoundaryAssignment(
    markers: BoundaryCrossingsAnswer['markers'],
    expected: readonly ChartPoint[],
) {
    if (markers.length === 0 || expected.length === 0) {
        return [] as readonly {
            markerIndex: number
            expectedIndex: number
            distance: number
        }[]
    }

    if (markers.length === 1) {
        let bestExpectedIndex = 0
        let bestDistance = Number.POSITIVE_INFINITY

        expected.forEach((expectedPoint, expectedIndex) => {
            const distance = pointDistance(markers[0].point, expectedPoint)
            if (distance < bestDistance) {
                bestDistance = distance
                bestExpectedIndex = expectedIndex
            }
        })

        return [{
            markerIndex: 0,
            expectedIndex: bestExpectedIndex,
            distance: bestDistance,
        }]
    }

    if (expected.length === 1) {
        const firstDistance = pointDistance(markers[0].point, expected[0])
        const secondDistance = pointDistance(markers[1].point, expected[0])
        const markerIndex = firstDistance <= secondDistance ? 0 : 1

        return [{
            markerIndex,
            expectedIndex: 0,
            distance: Math.min(firstDistance, secondDistance),
        }]
    }

    const direct = [
        pointDistance(markers[0].point, expected[0]),
        pointDistance(markers[1].point, expected[1]),
    ]
    const swapped = [
        pointDistance(markers[0].point, expected[1]),
        pointDistance(markers[1].point, expected[0]),
    ]

    if (direct[0] + direct[1] <= swapped[0] + swapped[1]) {
        return [
            { markerIndex: 0, expectedIndex: 0, distance: direct[0] },
            { markerIndex: 1, expectedIndex: 1, distance: direct[1] },
        ]
    }

    return [
        { markerIndex: 0, expectedIndex: 1, distance: swapped[0] },
        { markerIndex: 1, expectedIndex: 0, distance: swapped[1] },
    ]
}

function evaluateBoundaryCrossings(
    task: Extract<SkyChartExerciseTask, { kind: 'boundary-crossings' }>,
    answer: BoundaryCrossingsAnswer,
    parameters: SkyChartParameters,
    markerStatuses: Record<string, SkyChartMarkerEvaluationStatus>,
) {
    let groupScoreSum = 0
    let matchedPointCount = 0
    let expectedPointCount = 0

    for (const group of BOUNDARY_CROSSING_GROUPS) {
        const normal = boundaryNormal(group.id)
        const expected = normal
            ? greatCircleBoundaryIntersections(normal, parameters)
                .map((vector) => projectVector(vector, parameters, true))
                .filter((point): point is ChartPoint => point !== null)
            : []
        const markers = group.targetIds
            .map((targetId) => answer.markers.find(
                (marker) => marker.targetId === targetId,
            ))
            .filter((marker): marker is BoundaryCrossingsAnswer['markers'][number] => (
                marker !== undefined
            ))

        expectedPointCount += expected.length

        if (expected.length === 0) {
            if (markers.length === 0) {
                groupScoreSum += 1
            } else {
                markers.forEach((marker) => {
                    markerStatuses[marker.id] = 'incorrect'
                })
            }
            continue
        }

        const assignments = bestBoundaryAssignment(markers, expected)
        let groupMatched = 0
        const assignedMarkerIndexes = new Set<number>()

        for (const assignment of assignments) {
            assignedMarkerIndexes.add(assignment.markerIndex)
            const marker = markers[assignment.markerIndex]
            const correct = assignment.distance <= BOUNDARY_TOLERANCE
            markerStatuses[marker.id] = correct ? 'correct' : 'incorrect'

            if (correct) {
                groupMatched += 1
                matchedPointCount += 1
            }
        }

        markers.forEach((marker, markerIndex) => {
            if (!assignedMarkerIndexes.has(markerIndex)) {
                markerStatuses[marker.id] = 'incorrect'
            }
        })

        groupScoreSum += groupMatched / expected.length
    }

    return taskResult(
        task,
        groupScoreSum / BOUNDARY_CROSSING_GROUPS.length * 100,
        [
            `Совпавших точек: ${matchedPointCount} / ${expectedPointCount}`,
            'Порядок двух точек в паре не учитывается',
        ],
    )
}

function evaluateStars(
    task: Extract<SkyChartExerciseTask, { kind: 'stars' }>,
    answer: StarsAnswer,
    catalog: readonly CatalogStar[],
    parameters: SkyChartParameters,
    markerStatuses: Record<string, SkyChartMarkerEvaluationStatus>,
) {
    const catalogIdByDeckStarId = buildDeckStarCatalogIdMap(catalog)
    const projected = projectSkyChart(catalog, parameters)
    const visibleCatalogIds = new Set(projected.map((star) => star.id))
    const deckById = new Map(starDeck.map((star) => [star.id, star]))
    let earned = 0
    let possible = 0
    let identificationCorrect = 0
    let bayerCorrect = 0
    let visibleTargets = 0
    let absentCorrect = 0
    let hiddenTargets = 0

    for (const starId of task.starIds) {
        const trueCatalogId = catalogIdByDeckStarId.get(starId)
        const deckStar = deckById.get(starId)

        if (!trueCatalogId || !deckStar) {
            continue
        }

        const visible = visibleCatalogIds.has(trueCatalogId)
        const marker = answer.markers.find(
            (currentMarker) => currentMarker.selectedStarId === starId,
        )

        if (!visible) {
            hiddenTargets += 1
            possible += 1

            if (!marker && answer.absentStarIds.includes(starId)) {
                earned += 1
                absentCorrect += 1
            } else if (marker) {
                markerStatuses[marker.id] = 'incorrect'
            }
            continue
        }

        visibleTargets += 1
        possible += 2

        if (!marker) {
            continue
        }

        const nameCorrect = marker.catalogStarId === trueCatalogId
        const designationCorrect = bayerMatches(
            marker.selectedDesignation,
            deckStar.designation,
        )

        if (nameCorrect) {
            earned += 1
            identificationCorrect += 1
        }

        if (designationCorrect) {
            earned += 1
            bayerCorrect += 1
        }

        markerStatuses[marker.id] = (
            nameCorrect && designationCorrect
                ? 'correct'
                : nameCorrect || designationCorrect
                    ? 'partial'
                    : 'incorrect'
        )
    }

    const blankMarkers = answer.markers.filter(
        (marker) => !marker.selectedStarId,
    )

    blankMarkers.forEach((marker) => {
        markerStatuses[marker.id] = 'incorrect'
    })
    possible += blankMarkers.length

    return taskResult(
        task,
        possible > 0 ? earned / possible * 100 : 100,
        [
            `Распознано звёзд: ${identificationCorrect} / ${visibleTargets}`,
            `Байер: ${bayerCorrect} / ${visibleTargets}`,
            `Верно отсутствуют: ${absentCorrect} / ${hiddenTargets}`,
        ],
    )
}

function evaluateMessier(
    task: Extract<SkyChartExerciseTask, { kind: 'messier' }>,
    answer: MessierAnswer,
    parameters: SkyChartParameters,
    markerStatuses: Record<string, SkyChartMarkerEvaluationStatus>,
) {
    let correct = 0
    let visibleTargets = 0
    let hiddenTargets = 0

    for (const number of task.messierNumbers) {
        const coordinates = messierCoordinates(number)

        if (!coordinates) {
            continue
        }

        const expected = projectEquatorialPosition(
            coordinates.raDeg,
            coordinates.decDeg,
            parameters,
        )
        const marker = answer.markers.find(
            (currentMarker) => currentMarker.messierNumber === number,
        )

        if (!expected) {
            hiddenTargets += 1
            if (!marker && answer.absentMessierNumbers.includes(number)) {
                correct += 1
            } else if (marker) {
                markerStatuses[marker.id] = 'incorrect'
            }
            continue
        }

        visibleTargets += 1

        if (marker) {
            const markerCorrect = pointDistance(
                marker.point,
                expected,
            ) <= MESSIER_TOLERANCE
            markerStatuses[marker.id] = markerCorrect
                ? 'correct'
                : 'incorrect'

            if (markerCorrect) {
                correct += 1
            }
        }
    }

    const total = visibleTargets + hiddenTargets

    return taskResult(
        task,
        total > 0 ? correct / total * 100 : 100,
        [
            `Правильно: ${correct} / ${total}`,
            `На карте: ${visibleTargets}; вне карты: ${hiddenTargets}`,
        ],
    )
}

function circularHourDifference(first: number, second: number) {
    const raw = Math.abs(first - second) % 24
    return Math.min(raw, 24 - raw)
}

function evaluateOrientation(
    task: Extract<SkyChartExerciseTask, { kind: 'orientation' }>,
    answer: Extract<SkyChartTaskAnswer, { kind: 'orientation' }>,
    parameters: SkyChartParameters,
) {
    if (parameters.mode !== 'visible-hemisphere') {
        return taskResult(task, 100, ['Для этой карты задание не применяется'])
    }

    let correct = 0
    let total = 0
    const details: string[] = []

    if (task.askLatitude) {
        total += 1
        const latitudeCorrect = (
            answer.latitudeDeg !== null
            && Math.abs(
                answer.latitudeDeg - parameters.latitudeDeg,
            ) <= LATITUDE_TOLERANCE_DEG
        )
        if (latitudeCorrect) {
            correct += 1
        }
        details.push(
            `Широта: ${latitudeCorrect ? 'верно' : 'неверно'}`,
        )
    }

    if (task.askSiderealTime) {
        total += 1
        const timeCorrect = (
            answer.siderealTimeHours !== null
            && circularHourDifference(
                answer.siderealTimeHours,
                parameters.siderealTimeHours,
            ) <= SIDEREAL_TIME_TOLERANCE_HOURS
        )
        if (timeCorrect) {
            correct += 1
        }
        details.push(
            `Звёздное время: ${timeCorrect ? 'верно' : 'неверно'}`,
        )
    }

    return taskResult(
        task,
        total > 0 ? correct / total * 100 : 100,
        details,
    )
}

export function evaluateSkyChartExercise(
    session: SkyChartSessionState,
    catalog: readonly CatalogStar[],
    constellations: readonly BoundStellariumConstellation[],
): SkyChartExerciseEvaluationResult {
    const markerStatuses: Record<
        string,
        SkyChartMarkerEvaluationStatus
    > = {}
    const results: SkyChartTaskEvaluationResult[] = []
    let asterismEvaluation: SkyChartEvaluation | null = null

    for (const task of session.exercise.tasks) {
        const answer = session.answersByTaskId[task.id]
        const chart = session.exercise.charts.find(
            (currentChart) => currentChart.id === task.chartId,
        )

        if (!answer || !chart) {
            continue
        }

        if (
            task.kind === 'reference-points'
            && answer.kind === 'reference-points'
        ) {
            results.push(evaluateReferencePoints(
                task,
                answer,
                chart.parameters,
                markerStatuses,
            ))
            continue
        }

        if (
            task.kind === 'boundary-crossings'
            && answer.kind === 'boundary-crossings'
        ) {
            results.push(evaluateBoundaryCrossings(
                task,
                answer,
                chart.parameters,
                markerStatuses,
            ))
            continue
        }

        if (task.kind === 'stars' && answer.kind === 'stars') {
            results.push(evaluateStars(
                task,
                answer,
                catalog,
                chart.parameters,
                markerStatuses,
            ))
            continue
        }

        if (task.kind === 'messier' && answer.kind === 'messier') {
            results.push(evaluateMessier(
                task,
                answer,
                chart.parameters,
                markerStatuses,
            ))
            continue
        }

        if (task.kind === 'asterisms' && answer.kind === 'asterisms') {
            const projectedStars = projectSkyChart(
                catalog,
                chart.parameters,
            )
            asterismEvaluation = evaluateSkyChart(
                projectedStars,
                constellations,
                answer.lines,
            )
            results.push(taskResult(
                task,
                asterismEvaluation.scorePercent,
                [
                    `Правильных созвездий: ${asterismEvaluation.correctConstellationCount} / ${asterismEvaluation.checkedConstellationCount}`,
                    `Лишних линий: ${asterismEvaluation.extraLineCount}`,
                ],
            ))
            continue
        }

        if (
            task.kind === 'orientation'
            && answer.kind === 'orientation'
        ) {
            results.push(evaluateOrientation(
                task,
                answer,
                chart.parameters,
            ))
        }
    }

    const scorePercent = results.length > 0
        ? results.reduce(
            (sum, result) => sum + result.scorePercent,
            0,
        ) / results.length
        : 0

    return {
        scorePercent: roundPercent(scorePercent),
        tasks: results,
        markerStatuses,
        asterismEvaluation,
    }
}
