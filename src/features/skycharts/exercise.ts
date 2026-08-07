import type {
    SkyChartLine,
    SkyChartParameters,
} from './types'


export type SkyChartTaskKind =
    | 'reference-points'
    | 'boundary-crossings'
    | 'stars'
    | 'messier'
    | 'asterisms'
    | 'orientation'


export type SkyChartGenerationMode =
    | 'manual'
    | 'random-hemisphere'
    | 'random-north-hemisphere'
    | 'random-south-hemisphere'
    | 'random-north-field'
    | 'random-south-field'


export type SkyChartExerciseChart = {
    id: string
    title: string
    parameters: SkyChartParameters
}


export type ReferencePointId =
    | 'vernal-equinox'
    | 'autumnal-equinox'
    | 'june-solstice'
    | 'december-solstice'
    | 'galactic-celestial-intersection'
    | 'ecliptic-galactic-intersection'


export type BoundaryCrossingId =
    | 'celestial-equator-1'
    | 'celestial-equator-2'
    | 'galactic-equator-1'
    | 'galactic-equator-2'
    | 'ecliptic-1'
    | 'ecliptic-2'


export type ReferencePointsTask = {
    id: string
    kind: 'reference-points'
    chartId: string
    pointIds: readonly ReferencePointId[]
}


export type BoundaryCrossingsTask = {
    id: string
    kind: 'boundary-crossings'
    chartId: string
    crossingIds: readonly BoundaryCrossingId[]
}


export type StarsTask = {
    id: string
    kind: 'stars'
    chartId: string
    starIds: readonly string[]
}


export type MessierTask = {
    id: string
    kind: 'messier'
    chartId: string
    messierNumbers: readonly number[]
}


export type AsterismsTask = {
    id: string
    kind: 'asterisms'
    chartId: string
}


export type OrientationTask = {
    id: string
    kind: 'orientation'
    chartId: string
    askLatitude: boolean
    askSiderealTime: boolean
}


export type SkyChartExerciseTask =
    | ReferencePointsTask
    | BoundaryCrossingsTask
    | StarsTask
    | MessierTask
    | AsterismsTask
    | OrientationTask


export type SkyChartExercise = {
    id: string
    seed: number
    generationMode: SkyChartGenerationMode
    charts: readonly SkyChartExerciseChart[]
    tasks: readonly SkyChartExerciseTask[]
}


export type ChartPoint = {
    x: number
    y: number
}


export type PointMarkerAnswer<TId extends string> = {
    id: string
    targetId: TId
    point: ChartPoint
}


export type ReferencePointsAnswer = {
    kind: 'reference-points'
    markers: readonly PointMarkerAnswer<ReferencePointId>[]
    absentPointIds: readonly ReferencePointId[]
}


export type BoundaryCrossingsAnswer = {
    kind: 'boundary-crossings'
    markers: readonly PointMarkerAnswer<BoundaryCrossingId>[]
}


export type StarMarkerAnswer = {
    id: string

    // Реальная звезда каталога, на которую пользователь нажал на карте.
    catalogStarId: string

    // Звезда из учебной колоды, которую пользователь считает этой звездой.
    selectedStarId: string

    // Выбранное пользователем обозначение Байера.
    selectedDesignation: string
}


export type StarsAnswer = {
    kind: 'stars'
    markers: readonly StarMarkerAnswer[]

    // Звёзды из предложенного списка, которые пользователь считает
    // отсутствующими на карте.
    absentStarIds: readonly string[]
}


export type MessierMarkerAnswer = {
    id: string
    messierNumber: number
    point: ChartPoint
}


export type MessierAnswer = {
    kind: 'messier'
    markers: readonly MessierMarkerAnswer[]

    // Объекты из предложенного списка, которые пользователь считает
    // отсутствующими на карте.
    absentMessierNumbers: readonly number[]
}


export type AsterismsAnswer = {
    kind: 'asterisms'
    lines: readonly SkyChartLine[]
}


export type OrientationAnswer = {
    kind: 'orientation'
    latitudeDeg: number | null
    siderealTimeHours: number | null
}


export type SkyChartTaskAnswer =
    | ReferencePointsAnswer
    | BoundaryCrossingsAnswer
    | StarsAnswer
    | MessierAnswer
    | AsterismsAnswer
    | OrientationAnswer


export type SkyChartTaskEvaluation = {
    scorePercent: number
    checked: boolean
}


export type SkyChartSessionState = {
    exercise: SkyChartExercise

    // Активный вопрос определяет инструмент взаимодействия с картой.
    activeTaskId: string

    // Какую карту сейчас показываем. Несколько заданий могут ссылаться
    // на один и тот же chartId.
    activeChartId: string

    // Все ответы живут одновременно. Переключение вопроса ничего
    // не удаляет, поэтому этот объект можно целиком автосохранять.
    answersByTaskId: Readonly<Record<string, SkyChartTaskAnswer>>

    evaluationsByTaskId: Readonly<Record<string, SkyChartTaskEvaluation>>

    updatedAt: string
}


export const DEFAULT_REFERENCE_POINT_IDS: readonly ReferencePointId[] = [
    'vernal-equinox',
    'autumnal-equinox',
    'june-solstice',
    'december-solstice',
    'galactic-celestial-intersection',
    'ecliptic-galactic-intersection',
]


export const DEFAULT_BOUNDARY_CROSSING_IDS: readonly BoundaryCrossingId[] = [
    'celestial-equator-1',
    'celestial-equator-2',
    'galactic-equator-1',
    'galactic-equator-2',
    'ecliptic-1',
    'ecliptic-2',
]


export const SKY_CHART_TASK_TITLES: Readonly<
    Record<SkyChartTaskKind, string>
> = {
    'reference-points': 'Точки на небе',
    'boundary-crossings': 'Пересечения с границей',
    stars: 'Звёзды',
    messier: 'Объекты Мессье',
    asterisms: 'Астеризмы',
    orientation: 'Широта и звёздное время',
}


export function createEmptyTaskAnswer(
    task: SkyChartExerciseTask,
): SkyChartTaskAnswer {
    switch (task.kind) {
        case 'reference-points':
            return {
                kind: 'reference-points',
                markers: [],
                absentPointIds: [],
            }

        case 'boundary-crossings':
            return {
                kind: 'boundary-crossings',
                markers: [],
            }

        case 'stars':
            return {
                kind: 'stars',
                markers: [],
                absentStarIds: [],
            }

        case 'messier':
            return {
                kind: 'messier',
                markers: [],
                absentMessierNumbers: [],
            }

        case 'asterisms':
            return {
                kind: 'asterisms',
                lines: [],
            }

        case 'orientation':
            return {
                kind: 'orientation',
                latitudeDeg: null,
                siderealTimeHours: null,
            }
    }
}


export function createInitialSessionState(
    exercise: SkyChartExercise,
): SkyChartSessionState {
    const firstTask = exercise.tasks[0]
    const firstChart = exercise.charts[0]

    if (!firstTask || !firstChart) {
        throw new Error(
            'В упражнении должна быть хотя бы одна карта и одно задание.',
        )
    }

    const answersByTaskId: Record<string, SkyChartTaskAnswer> = {}

    for (const task of exercise.tasks) {
        answersByTaskId[task.id] = createEmptyTaskAnswer(task)
    }

    return {
        exercise,
        activeTaskId: firstTask.id,
        activeChartId: firstTask.chartId,
        answersByTaskId,
        evaluationsByTaskId: {},
        updatedAt: new Date().toISOString(),
    }
}


export function activateTask(
    session: SkyChartSessionState,
    taskId: string,
): SkyChartSessionState {
    const task = session.exercise.tasks.find(
        (exerciseTask) => exerciseTask.id === taskId,
    )

    if (!task) {
        return session
    }

    return {
        ...session,
        activeTaskId: task.id,
        activeChartId: task.chartId,
        updatedAt: new Date().toISOString(),
    }
}
