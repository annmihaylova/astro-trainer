import type { Star } from '../../data/stars'
import {
    BOUNDARY_CROSSING_LABELS,
    REFERENCE_POINT_LABELS,
} from './exerciseLabels'
import type {
    SkyChartExerciseTask,
    SkyChartSessionState,
} from './exercise'
import type {
    SkyChartMarker,
} from './SkyChartSvg'
import type {
    ProjectedStar,
} from './types'


type BuildSkyChartAnswerMarkersOptions = {
    session: SkyChartSessionState
    activeTask: SkyChartExerciseTask
    projectedStarsById: ReadonlyMap<string, ProjectedStar>
    starDeckById: ReadonlyMap<string, Star>
    markerStatuses?: Readonly<Record<
        string,
        'correct' | 'partial' | 'incorrect'
    >>
}


export function buildSkyChartAnswerMarkers({
    session,
    activeTask,
    projectedStarsById,
    starDeckById,
    markerStatuses,
}: BuildSkyChartAnswerMarkersOptions) {
    const markers: SkyChartMarker[] = []
    const chartTasks = session.exercise.tasks.filter(
        (task) => task.chartId === session.activeChartId,
    )
    const orderedTasks = [
        ...chartTasks.filter((task) => task.id !== activeTask.id),
        ...chartTasks.filter((task) => task.id === activeTask.id),
    ]

    for (const task of orderedTasks) {
        const answer = session.answersByTaskId[task.id]

        if (!answer) {
            continue
        }

        const active = task.id === activeTask.id

        if (answer.kind === 'reference-points') {
            answer.markers.forEach((marker) => {
                markers.push({
                    id: marker.id,
                    x: marker.point.x,
                    y: marker.point.y,
                    label: REFERENCE_POINT_LABELS[marker.targetId],
                    shape: 'cross',
                    active,
                    status: markerStatuses?.[marker.id],
                })
            })
            continue
        }

        if (answer.kind === 'boundary-crossings') {
            answer.markers.forEach((marker) => {
                markers.push({
                    id: marker.id,
                    x: marker.point.x,
                    y: marker.point.y,
                    label: BOUNDARY_CROSSING_LABELS[marker.targetId],
                    shape: 'dot',
                    active,
                    status: markerStatuses?.[marker.id],
                    labelPlacement: 'inward',
                })
            })
            continue
        }

        if (answer.kind === 'messier') {
            answer.markers.forEach((marker) => {
                markers.push({
                    id: marker.id,
                    x: marker.point.x,
                    y: marker.point.y,
                    label: `M${marker.messierNumber}`,
                    shape: 'triangle',
                    active,
                    status: markerStatuses?.[marker.id],
                })
            })
            continue
        }

        if (answer.kind === 'stars') {
            answer.markers.forEach((marker) => {
                const projectedStar = projectedStarsById.get(
                    marker.catalogStarId,
                )

                if (!projectedStar) {
                    return
                }

                const selectedDeckStar = starDeckById.get(
                    marker.selectedStarId,
                )
                const designation = marker.selectedDesignation.trim()

                markers.push({
                    id: marker.id,
                    x: projectedStar.x,
                    y: projectedStar.y,
                    label: active
                        ? selectedDeckStar?.name
                        : designation || undefined,
                    secondaryLabel: (
                        active && designation
                            ? designation
                            : undefined
                    ),
                    shape: 'cross',
                    active,
                    status: markerStatuses?.[marker.id],
                })
            })
        }
    }

    return markers
}
