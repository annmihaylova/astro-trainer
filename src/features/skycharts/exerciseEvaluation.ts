import { stars as starDeck } from '../../data/stars'
import {
    projectSkyChart,
} from './astronomy'
import {
    parseSimpleBayerDesignation,
} from './bayer'
import {
    BOUNDARY_CROSSING_GROUPS,
    REFERENCE_POINT_LABELS,
} from './exerciseLabels'
import type {
    BoundaryCrossingsAnswer,
    ChartPoint,
    MessierAnswer,
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
    BOUNDARY_TOLERANCE,
    LATITUDE_TOLERANCE_DEG,
    MESSIER_TOLERANCE,
    POINT_TOLERANCE,
    SIDEREAL_TIME_TOLERANCE_HOURS,
    projectBoundaryGroup,
    projectMessier,
    projectReferencePoint,
} from './correctAnswerGeometry'
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


export type SkyChartMarkerEvaluationStatus = (
    | 'correct'
    | 'partial'
    | 'incorrect'
)


export type SkyChartTaskEvaluationResult = {
    taskId: string
    kind: SkyChartTaskKind
    title: string
    earnedScore: number
    maxScore: number
    scorePercent: number
    details: readonly string[]
}


export type SkyChartExerciseEvaluationResult = {
    earnedScore: number
    maxScore: number
    scorePercent: number
    tasks: readonly SkyChartTaskEvaluationResult[]
    markerStatuses: Readonly<Record<
        string,
        SkyChartMarkerEvaluationStatus
    >>
    asterismEvaluation: SkyChartEvaluation | null
}


function clamp(
    value: number,
    minimum: number,
    maximum: number,
) {
    return Math.min(
        maximum,
        Math.max(minimum, value),
    )
}


function roundPercent(value: number) {
    return Math.round(clamp(value, 0, 100))
}


function roundedScore(value: number) {
    return Math.round(value * 100) / 100
}


function formatScore(value: number) {
    return Number.isInteger(value)
        ? String(value)
        : String(roundedScore(value))
}


function taskResult(
    task: SkyChartExerciseTask,
    earnedScore: number,
    maxScore: number,
    details: readonly string[],
): SkyChartTaskEvaluationResult {
    return {
        taskId: task.id,
        kind: task.kind,
        title: SKY_CHART_TASK_TITLES[
            task.kind
        ],
        earnedScore: roundedScore(earnedScore),
        maxScore: roundedScore(maxScore),
        scorePercent: maxScore > 0
            ? roundPercent(
                earnedScore
                / maxScore
                * 100,
            )
            : 100,
        details: [
            (
                `Баллы: ${formatScore(earnedScore)}`
                + ` / ${formatScore(maxScore)}`
            ),
            ...details,
        ],
    }
}


function pointDistance(
    first: ChartPoint,
    second: ChartPoint,
) {
    return Math.hypot(
        first.x - second.x,
        first.y - second.y,
    )
}


function normalizedBayer(value: string) {
    const parsed = parseSimpleBayerDesignation(
        value,
    )

    return {
        greekLetter: parsed.greekLetter,
        constellation: (
            parsed.constellation.toLowerCase()
        ),
    }
}


function bayerMatches(
    answer: string,
    expected: string,
) {
    const normalizedAnswer = normalizedBayer(
        answer,
    )
    const normalizedExpected = normalizedBayer(
        expected,
    )

    return Boolean(
        normalizedAnswer.greekLetter
        && normalizedAnswer.constellation
        && (
            normalizedAnswer.greekLetter
            === normalizedExpected.greekLetter
        )
        && (
            normalizedAnswer.constellation
            === normalizedExpected.constellation
        )
    )
}


function circularHourDifference(
    first: number,
    second: number,
) {
    const raw = (
        Math.abs(first - second) % 24
    )

    return Math.min(raw, 24 - raw)
}


// Пустые ответы больше НЕ превращаются в "нет на карте".
// Функция сохранена с прежним именем, чтобы SkyChartsPage
// не пришлось переписывать.
export function finalizeSkyChartSessionAnswers(
    session: SkyChartSessionState,
) {
    return session
}


function evaluateReferencePoints(
    task: Extract<
        SkyChartExerciseTask,
        { kind: 'reference-points' }
    >,
    answer: ReferencePointsAnswer,
    parameters: SkyChartParameters,
    markerStatuses: Record<
        string,
        SkyChartMarkerEvaluationStatus
    >,
) {
    let earned = 0
    let maximum = 0
    const correctAnswers: string[] = []

    for (const pointId of task.pointIds) {
        const expected = projectReferencePoint(
            pointId,
            parameters,
        )
        const marker = answer.markers.find(
            (currentMarker) => (
                currentMarker.targetId
                === pointId
            ),
        )
        const absent = (
            answer.absentPointIds.includes(
                pointId,
            )
        )

        if (expected) {
            maximum += 1
            correctAnswers.push(
                `${REFERENCE_POINT_LABELS[pointId]} — на карте`,
            )

            if (marker) {
                const correct = (
                    pointDistance(
                        marker.point,
                        expected,
                    )
                    <= POINT_TOLERANCE
                )

                markerStatuses[marker.id] = (
                    correct
                        ? 'correct'
                        : 'incorrect'
                )

                if (correct) {
                    earned += 1
                }
            }

            continue
        }

        maximum += 0.5
        correctAnswers.push(
            `${REFERENCE_POINT_LABELS[pointId]} — нет на карте`,
        )

        if (!marker && absent) {
            earned += 0.5
        } else if (marker) {
            markerStatuses[marker.id] = (
                'incorrect'
            )
        }
    }

    return taskResult(
        task,
        earned,
        maximum,
        [
            (
                'Правильные ответы: '
                + correctAnswers.join(', ')
            ),
        ],
    )
}


function bestBoundaryAssignment(
    markers: BoundaryCrossingsAnswer[
        'markers'
    ],
    expected: readonly ChartPoint[],
) {
    if (
        markers.length === 0
        || expected.length === 0
    ) {
        return [] as readonly {
            markerIndex: number
            expectedIndex: number
            distance: number
        }[]
    }

    if (markers.length === 1) {
        let bestExpectedIndex = 0
        let bestDistance = (
            Number.POSITIVE_INFINITY
        )

        expected.forEach((
            expectedPoint,
            expectedIndex,
        ) => {
            const distance = pointDistance(
                markers[0].point,
                expectedPoint,
            )

            if (distance < bestDistance) {
                bestDistance = distance
                bestExpectedIndex = (
                    expectedIndex
                )
            }
        })

        return [{
            markerIndex: 0,
            expectedIndex: bestExpectedIndex,
            distance: bestDistance,
        }]
    }

    if (expected.length === 1) {
        const firstDistance = pointDistance(
            markers[0].point,
            expected[0],
        )
        const secondDistance = pointDistance(
            markers[1].point,
            expected[0],
        )
        const markerIndex = (
            firstDistance <= secondDistance
                ? 0
                : 1
        )

        return [{
            markerIndex,
            expectedIndex: 0,
            distance: Math.min(
                firstDistance,
                secondDistance,
            ),
        }]
    }

    const direct = [
        pointDistance(
            markers[0].point,
            expected[0],
        ),
        pointDistance(
            markers[1].point,
            expected[1],
        ),
    ]

    const swapped = [
        pointDistance(
            markers[0].point,
            expected[1],
        ),
        pointDistance(
            markers[1].point,
            expected[0],
        ),
    ]

    if (
        direct[0] + direct[1]
        <= swapped[0] + swapped[1]
    ) {
        return [
            {
                markerIndex: 0,
                expectedIndex: 0,
                distance: direct[0],
            },
            {
                markerIndex: 1,
                expectedIndex: 1,
                distance: direct[1],
            },
        ]
    }

    return [
        {
            markerIndex: 0,
            expectedIndex: 1,
            distance: swapped[0],
        },
        {
            markerIndex: 1,
            expectedIndex: 0,
            distance: swapped[1],
        },
    ]
}


function evaluateBoundaryCrossings(
    task: Extract<
        SkyChartExerciseTask,
        { kind: 'boundary-crossings' }
    >,
    answer: BoundaryCrossingsAnswer,
    parameters: SkyChartParameters,
    markerStatuses: Record<
        string,
        SkyChartMarkerEvaluationStatus
    >,
) {
    let earned = 0
    let maximum = 0
    const correctAnswers: string[] = []

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

        const expected = projectBoundaryGroup(
            group.id,
            parameters,
        )

        const markers = group.targetIds
            .map((targetId) => (
                answer.markers.find(
                    (marker) => (
                        marker.targetId
                        === targetId
                    ),
                )
            ))
            .filter((
                marker,
            ): marker is BoundaryCrossingsAnswer[
                'markers'
            ][number] => (
                marker !== undefined
            ))

        maximum += expected.length
        correctAnswers.push(
            expected.length > 0
                ? (
                    `${group.label} — `
                    + `${expected.length} точки`
                )
                : (
                    `${group.label} — `
                    + 'нет пересечений'
                ),
        )

        if (expected.length === 0) {
            markers.forEach((marker) => {
                markerStatuses[marker.id] = (
                    'incorrect'
                )
            })
            continue
        }

        const assignments = (
            bestBoundaryAssignment(
                markers,
                expected,
            )
        )
        const assignedMarkerIndexes = (
            new Set<number>()
        )

        for (const assignment of assignments) {
            assignedMarkerIndexes.add(
                assignment.markerIndex,
            )

            const marker = markers[
                assignment.markerIndex
            ]
            const correct = (
                assignment.distance
                <= BOUNDARY_TOLERANCE
            )

            markerStatuses[marker.id] = (
                correct
                    ? 'correct'
                    : 'incorrect'
            )

            if (correct) {
                earned += 1
            }
        }

        markers.forEach((
            marker,
            markerIndex,
        ) => {
            if (
                !assignedMarkerIndexes.has(
                    markerIndex,
                )
            ) {
                markerStatuses[marker.id] = (
                    'incorrect'
                )
            }
        })
    }

    return taskResult(
        task,
        earned,
        maximum,
        [
            (
                'Порядок двух точек '
                + 'в паре не учитывается'
            ),
            (
                'Правильные ответы: '
                + correctAnswers.join(', ')
            ),
        ],
    )
}


function evaluateStars(
    task: Extract<
        SkyChartExerciseTask,
        { kind: 'stars' }
    >,
    answer: StarsAnswer,
    catalog: readonly CatalogStar[],
    parameters: SkyChartParameters,
    markerStatuses: Record<
        string,
        SkyChartMarkerEvaluationStatus
    >,
) {
    const catalogIdByDeckStarId = (
        buildDeckStarCatalogIdMap(catalog)
    )
    const projected = projectSkyChart(
        catalog,
        parameters,
    )
    const visibleCatalogIds = new Set(
        projected.map((star) => star.id),
    )
    const deckById = new Map(
        starDeck.map((star) => [
            star.id,
            star,
        ]),
    )

    let earned = 0
    let maximum = 0
    let identificationCorrect = 0
    let bayerCorrect = 0
    let absentCorrect = 0

    const correctAnswers: string[] = []

    for (const starId of task.starIds) {
        const trueCatalogId = (
            catalogIdByDeckStarId.get(starId)
        )
        const deckStar = deckById.get(starId)

        if (!trueCatalogId || !deckStar) {
            continue
        }

        const visible = (
            visibleCatalogIds.has(
                trueCatalogId,
            )
        )
        const marker = answer.markers.find(
            (currentMarker) => (
                currentMarker.selectedStarId
                === starId
            ),
        )
        const absent = (
            answer.absentStarIds.includes(
                starId,
            )
        )

        if (!visible) {
            maximum += 0.5
            correctAnswers.push(
                (
                    `${deckStar.name} — `
                    + `${deckStar.designation} — `
                    + 'нет на карте'
                ),
            )

            if (!marker && absent) {
                earned += 0.5
                absentCorrect += 1
            } else if (marker) {
                markerStatuses[marker.id] = (
                    'incorrect'
                )
            }

            continue
        }

        maximum += 1
        correctAnswers.push(
            (
                `${deckStar.name} — `
                + `${deckStar.designation} — `
                + 'на карте'
            ),
        )

        if (!marker) {
            continue
        }

        const nameCorrect = (
            marker.catalogStarId
            === trueCatalogId
        )
        const designationCorrect = (
            bayerMatches(
                marker.selectedDesignation,
                deckStar.designation,
            )
        )

        if (nameCorrect) {
            earned += 0.5
            identificationCorrect += 1
        }

        if (designationCorrect) {
            earned += 0.5
            bayerCorrect += 1
        }

        markerStatuses[marker.id] = (
            nameCorrect && designationCorrect
                ? 'correct'
                : (
                    nameCorrect
                    || designationCorrect
                )
                    ? 'partial'
                    : 'incorrect'
        )
    }

    answer.markers
        .filter(
            (marker) => (
                !marker.selectedStarId
            ),
        )
        .forEach((marker) => {
            markerStatuses[marker.id] = (
                'incorrect'
            )
        })

    return taskResult(
        task,
        earned,
        maximum,
        [
            (
                `Распознано звёзд: `
                + identificationCorrect
            ),
            `Правильный Байер: ${bayerCorrect}`,
            (
                'Верно отмечено отсутствие: '
                + absentCorrect
            ),
            (
                'Правильные ответы: '
                + correctAnswers.join('; ')
            ),
        ],
    )
}


function evaluateMessier(
    task: Extract<
        SkyChartExerciseTask,
        { kind: 'messier' }
    >,
    answer: MessierAnswer,
    parameters: SkyChartParameters,
    markerStatuses: Record<
        string,
        SkyChartMarkerEvaluationStatus
    >,
) {
    let earned = 0
    let maximum = 0
    let absentCorrect = 0
    const correctAnswers: string[] = []

    for (
        const number
        of task.messierNumbers
    ) {
        const expected = projectMessier(
            number,
            parameters,
        )
        const marker = answer.markers.find(
            (currentMarker) => (
                currentMarker.messierNumber
                === number
            ),
        )
        const absent = (
            answer.absentMessierNumbers.includes(
                number,
            )
        )

        if (!expected) {
            maximum += 0.5
            correctAnswers.push(
                `M${number} — нет на карте`,
            )

            if (!marker && absent) {
                earned += 0.5
                absentCorrect += 1
            } else if (marker) {
                markerStatuses[marker.id] = (
                    'incorrect'
                )
            }

            continue
        }

        maximum += 1
        correctAnswers.push(
            `M${number} — на карте`,
        )

        if (!marker) {
            continue
        }

        const correct = (
            pointDistance(
                marker.point,
                expected,
            )
            <= MESSIER_TOLERANCE
        )

        markerStatuses[marker.id] = (
            correct
                ? 'correct'
                : 'incorrect'
        )

        if (correct) {
            earned += 1
        }
    }

    return taskResult(
        task,
        earned,
        maximum,
        [
            (
                'Верно отмечено отсутствие: '
                + absentCorrect
            ),
            (
                'Правильные ответы: '
                + correctAnswers.join(', ')
            ),
        ],
    )
}


function evaluateOrientation(
    task: Extract<
        SkyChartExerciseTask,
        { kind: 'orientation' }
    >,
    answer: Extract<
        SkyChartTaskAnswer,
        { kind: 'orientation' }
    >,
    parameters: SkyChartParameters,
) {
    if (
        parameters.mode
        !== 'visible-hemisphere'
    ) {
        return taskResult(
            task,
            0,
            0,
            ['Для этой карты задание не применяется'],
        )
    }

    let earned = 0
    let maximum = 0
    const details: string[] = []
    const correctAnswers: string[] = []

    if (task.askLatitude) {
        maximum += 1

        const correct = (
            answer.latitudeDeg !== null
            && Math.abs(
                answer.latitudeDeg
                - parameters.latitudeDeg,
            ) <= LATITUDE_TOLERANCE_DEG
        )

        if (correct) {
            earned += 1
        }

        details.push(
            `Широта: ${correct ? 'верно' : 'неверно'}`,
        )
        correctAnswers.push(
            (
                `широта ${parameters.latitudeDeg}°`
                + ` (±${LATITUDE_TOLERANCE_DEG}°)`
            ),
        )
    }

    if (task.askSiderealTime) {
        maximum += 1

        const correct = (
            answer.siderealTimeHours !== null
            && circularHourDifference(
                answer.siderealTimeHours,
                parameters.siderealTimeHours,
            )
            <= SIDEREAL_TIME_TOLERANCE_HOURS
        )

        if (correct) {
            earned += 1
        }

        details.push(
            (
                `Звёздное время: `
                + (correct ? 'верно' : 'неверно')
            ),
        )
        correctAnswers.push(
            (
                'звёздное время '
                + `${parameters.siderealTimeHours} ч`
                + ` (±${SIDEREAL_TIME_TOLERANCE_HOURS} ч)`
            ),
        )
    }

    return taskResult(
        task,
        earned,
        maximum,
        [
            ...details,
            (
                'Правильные ответы: '
                + correctAnswers.join(', ')
            ),
        ],
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

    let asterismEvaluation: (
        SkyChartEvaluation | null
    ) = null

    for (
        const task
        of session.exercise.tasks
    ) {
        const answer = (
            session.answersByTaskId[task.id]
        )
        const chart = session.exercise.charts.find(
            (currentChart) => (
                currentChart.id === task.chartId
            ),
        )

        if (!answer || !chart) {
            continue
        }

        if (
            task.kind === 'reference-points'
            && answer.kind === 'reference-points'
        ) {
            results.push(
                evaluateReferencePoints(
                    task,
                    answer,
                    chart.parameters,
                    markerStatuses,
                ),
            )
            continue
        }

        if (
            task.kind === 'boundary-crossings'
            && answer.kind === 'boundary-crossings'
        ) {
            results.push(
                evaluateBoundaryCrossings(
                    task,
                    answer,
                    chart.parameters,
                    markerStatuses,
                ),
            )
            continue
        }

        if (
            task.kind === 'stars'
            && answer.kind === 'stars'
        ) {
            results.push(
                evaluateStars(
                    task,
                    answer,
                    catalog,
                    chart.parameters,
                    markerStatuses,
                ),
            )
            continue
        }

        if (
            task.kind === 'messier'
            && answer.kind === 'messier'
        ) {
            results.push(
                evaluateMessier(
                    task,
                    answer,
                    chart.parameters,
                    markerStatuses,
                ),
            )
            continue
        }

        if (
            task.kind === 'asterisms'
            && answer.kind === 'asterisms'
        ) {
            const projectedStars = (
                projectSkyChart(
                    catalog,
                    chart.parameters,
                )
            )

            asterismEvaluation = evaluateSkyChart(
                projectedStars,
                constellations,
                answer.lines,
            )

            results.push(
                taskResult(
                    task,
                    (
                        asterismEvaluation
                            .correctConstellationCount
                    ),
                    (
                        asterismEvaluation
                            .checkedConstellationCount
                    ),
                    [
                        (
                            'Правильных созвездий: '
                            + (
                                asterismEvaluation
                                    .correctConstellationCount
                            )
                            + ' / '
                            + (
                                asterismEvaluation
                                    .checkedConstellationCount
                            )
                        ),
                        (
                            'Лишних линий: '
                            + asterismEvaluation
                                .extraLineCount
                        ),
                        (
                            'Эталонные недостающие линии '
                            + 'показаны на карте'
                        ),
                    ],
                ),
            )

            continue
        }

        if (
            task.kind === 'orientation'
            && answer.kind === 'orientation'
        ) {
            results.push(
                evaluateOrientation(
                    task,
                    answer,
                    chart.parameters,
                ),
            )
        }
    }

    const earnedScore = results.reduce(
        (sum, result) => (
            sum + result.earnedScore
        ),
        0,
    )
    const maxScore = results.reduce(
        (sum, result) => (
            sum + result.maxScore
        ),
        0,
    )

    return {
        earnedScore: roundedScore(
            earnedScore,
        ),
        maxScore: roundedScore(maxScore),
        scorePercent: maxScore > 0
            ? roundPercent(
                earnedScore
                / maxScore
                * 100,
            )
            : 0,
        tasks: results,
        markerStatuses,
        asterismEvaluation,
    }
}
