import './skycharts.css'
import './skycharts-exercise.css'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import type { ChangeEvent } from 'react'
import { stars as starDeck } from '../../data/stars'
import SkyChartSvg from '../../features/skycharts/SkyChartSvg'
import {
    buildSkyChartAnswerMarkers,
} from '../../features/skycharts/answerLayers'
import SkyChartStarTaskPanel from '../../features/skycharts/SkyChartStarTaskPanel'
import {
    loadConstellationBoundaries,
    normalizeConstellationId,
    projectEvaluatedConstellationBoundaries,
} from '../../features/skycharts/constellationBoundaries'
import type {
    ConstellationBoundary,
    ConstellationEvaluationStatus,
} from '../../features/skycharts/constellationBoundaries'
import { projectSkyChart } from '../../features/skycharts/astronomy'
import {
    buildSkyChartLineId,
    evaluateSkyChart,
} from '../../features/skycharts/evaluateSkyChart'
import type {
    SkyChartEvaluation,
} from '../../features/skycharts/evaluateSkyChart'
import {
    activateTask,
    createInitialSessionState,
    SKY_CHART_TASK_TITLES,
} from '../../features/skycharts/exercise'
import type {
    AsterismsAnswer,
    BoundaryCrossingId,
    BoundaryCrossingsAnswer,
    ChartPoint,
    MessierAnswer,
    MessierMarkerAnswer,
    OrientationAnswer,
    ReferencePointId,
    ReferencePointsAnswer,
    SkyChartExerciseTask,
    SkyChartGenerationMode,
    SkyChartSessionState,
    SkyChartTaskAnswer,
    StarMarkerAnswer,
    StarsAnswer,
} from '../../features/skycharts/exercise'
import {
    BOUNDARY_CROSSING_LABELS,
    REFERENCE_POINT_LABELS,
    REFERENCE_POINT_NAMES,
} from '../../features/skycharts/exerciseLabels'
import {
    buildSkyChartExercise,
} from '../../features/skycharts/exerciseGenerator'
import {
    buildNamedCatalogStarIds,
    chooseSelectableStars,
} from '../../features/skycharts/selectableStars'
import {
    bindStellariumReferenceToCatalog,
    loadStellariumWesternReference,
} from '../../features/skycharts/stellariumReference'
import type {
    StellariumWesternReference,
} from '../../features/skycharts/stellariumReference'
import type {
    CatalogStar,
    EquatorialFieldParameters,
    ProjectedStar,
    SkyChartLine,
    SkyChartMode,
    SkyChartParameters,
    VisibleHemisphereParameters,
} from '../../features/skycharts/types'

const SESSION_STORAGE_KEY = 'astro-trainer:skycharts:session:v1'

const DEFAULT_VISIBLE_PARAMETERS: VisibleHemisphereParameters = {
    mode: 'visible-hemisphere',
    latitudeDeg: 55.75,
    siderealTimeHours: 12,
    limitingMagnitude: 6.5,
}

const DEFAULT_FIELD_PARAMETERS: EquatorialFieldParameters = {
    mode: 'equatorial-field',
    centerRaHours: 12,
    centerDecDeg: 20,
    angularDiameterDeg: 70,
    rotationDeg: 0,
    limitingMagnitude: 6.5,
}

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}

function finiteOr(value: number, fallback: number) {
    return Number.isFinite(value) ? value : fallback
}

function normalizeHours(value: number) {
    return ((value % 24) + 24) % 24
}

function normalizeRotation(value: number) {
    return ((value % 360) + 540) % 360 - 180
}

function normalizeParameters(
    parameters: SkyChartParameters,
): SkyChartParameters {
    if (parameters.mode === 'visible-hemisphere') {
        return {
            mode: 'visible-hemisphere',
            latitudeDeg: clamp(
                finiteOr(parameters.latitudeDeg, 0),
                -90,
                90,
            ),
            siderealTimeHours: normalizeHours(
                finiteOr(parameters.siderealTimeHours, 0),
            ),
            limitingMagnitude: clamp(
                finiteOr(parameters.limitingMagnitude, 6.5),
                -2,
                8,
            ),
        }
    }

    return {
        mode: 'equatorial-field',
        centerRaHours: normalizeHours(
            finiteOr(parameters.centerRaHours, 0),
        ),
        centerDecDeg: clamp(
            finiteOr(parameters.centerDecDeg, 0),
            -90,
            90,
        ),
        angularDiameterDeg: clamp(
            finiteOr(parameters.angularDiameterDeg, 70),
            2,
            180,
        ),
        rotationDeg: normalizeRotation(
            finiteOr(parameters.rotationDeg, 0),
        ),
        limitingMagnitude: clamp(
            finiteOr(parameters.limitingMagnitude, 6.5),
            -2,
            8,
        ),
    }
}

function randomParameters(
    currentParameters: SkyChartParameters,
): SkyChartParameters {
    if (currentParameters.mode === 'visible-hemisphere') {
        return {
            mode: 'visible-hemisphere',
            latitudeDeg: Math.round(
                (Math.random() * 140 - 70) * 10,
            ) / 10,
            siderealTimeHours: Math.floor(
                Math.random() * 240,
            ) / 10,
            limitingMagnitude: currentParameters.limitingMagnitude,
        }
    }

    const randomDeclination = (
        Math.asin(Math.random() * 2 - 1)
        * 180
        / Math.PI
    )

    return {
        mode: 'equatorial-field',
        centerRaHours: Math.floor(Math.random() * 240) / 10,
        centerDecDeg: Math.round(randomDeclination * 10) / 10,
        angularDiameterDeg: currentParameters.angularDiameterDeg,
        rotationDeg: Math.round(Math.random() * 360 - 180),
        limitingMagnitude: currentParameters.limitingMagnitude,
    }
}

function inputNumber(event: ChangeEvent<HTMLInputElement>) {
    return Number(event.target.value)
}

function newSeed() {
    return Math.floor(Math.random() * 0xFFFFFFFF)
}

function newMarkerId(prefix: string) {
    if (
        typeof crypto !== 'undefined'
        && typeof crypto.randomUUID === 'function'
    ) {
        return `${prefix}-${crypto.randomUUID()}`
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readStoredSession() {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)

        if (!raw) {
            return null
        }

        const parsed = JSON.parse(raw) as SkyChartSessionState

        if (
            !parsed.exercise
            || !Array.isArray(parsed.exercise.charts)
            || !Array.isArray(parsed.exercise.tasks)
            || parsed.exercise.charts.length === 0
            || parsed.exercise.tasks.length === 0
        ) {
            return null
        }

        return parsed
    } catch {
        return null
    }
}

function firstChartParameters(session: SkyChartSessionState | null) {
    return session?.exercise.charts[0]?.parameters
        ?? DEFAULT_VISIBLE_PARAMETERS
}

function replaceTaskAnswer(
    session: SkyChartSessionState,
    taskId: string,
    answer: SkyChartTaskAnswer,
): SkyChartSessionState {
    return {
        ...session,
        answersByTaskId: {
            ...session.answersByTaskId,
            [taskId]: answer,
        },
        updatedAt: new Date().toISOString(),
    }
}

function upsertReferenceMarker(
    answer: ReferencePointsAnswer,
    targetId: ReferencePointId,
    point: ChartPoint,
): ReferencePointsAnswer {
    const nextMarker = {
        id: `reference-${targetId}`,
        targetId,
        point,
    }

    return {
        ...answer,
        markers: [
            ...answer.markers.filter(
                (marker) => marker.targetId !== targetId,
            ),
            nextMarker,
        ],
        absentPointIds: answer.absentPointIds.filter(
            (pointId) => pointId !== targetId,
        ),
    }
}

function upsertBoundaryMarker(
    answer: BoundaryCrossingsAnswer,
    targetId: BoundaryCrossingId,
    point: ChartPoint,
): BoundaryCrossingsAnswer {
    return {
        ...answer,
        markers: [
            ...answer.markers.filter(
                (marker) => marker.targetId !== targetId,
            ),
            {
                id: `boundary-${targetId}`,
                targetId,
                point,
            },
        ],
    }
}

function upsertMessierMarker(
    answer: MessierAnswer,
    messierNumber: number,
    point: ChartPoint,
): MessierAnswer {
    const nextMarker: MessierMarkerAnswer = {
        id: `messier-${messierNumber}`,
        messierNumber,
        point,
    }

    return {
        ...answer,
        markers: [
            ...answer.markers.filter(
                (marker) => marker.messierNumber !== messierNumber,
            ),
            nextMarker,
        ],
        absentMessierNumbers: answer.absentMessierNumbers.filter(
            (number) => number !== messierNumber,
        ),
    }
}

function SkyChartsPage() {
    const [session, setSession] = useState<SkyChartSessionState | null>(
        () => readStoredSession(),
    )
    const restoredParameters = firstChartParameters(session)
    const [catalog, setCatalog] = useState<readonly CatalogStar[]>([])
    const [catalogError, setCatalogError] = useState<string | null>(null)
    const [stellariumReference, setStellariumReference] = (
        useState<StellariumWesternReference | null>(null)
    )
    const [stellariumError, setStellariumError] = useState<string | null>(null)
    const [constellationBoundaries, setConstellationBoundaries] = (
        useState<readonly ConstellationBoundary[]>([])
    )
    const [boundariesError, setBoundariesError] = useState<string | null>(null)
    const [draftParameters, setDraftParameters] = (
        useState<SkyChartParameters>(restoredParameters)
    )
    const [chartParameters, setChartParameters] = (
        useState<SkyChartParameters>(restoredParameters)
    )
    const [selectedStarId, setSelectedStarId] = useState<string | null>(null)
    const [evaluation, setEvaluation] = (
        useState<SkyChartEvaluation | null>(null)
    )
    const [eraseMode, setEraseMode] = useState(false)
    const [continuousDrawing, setContinuousDrawing] = useState(true)
    const [selectedPointTargetId, setSelectedPointTargetId] = (
        useState<string | null>(null)
    )
    const [editingStarMarkerId, setEditingStarMarkerId] = (
        useState<string | null>(null)
    )
    const [generatorOpen, setGeneratorOpen] = useState(session === null)

    useEffect(() => {
        const abortController = new AbortController()

        async function loadCatalog() {
            try {
                const response = await fetch(
                    '/skycharts/stars.json',
                    { signal: abortController.signal },
                )

                if (!response.ok) {
                    throw new Error(
                        `Каталог не загрузился: ${response.status}`,
                    )
                }

                const loadedCatalog = (
                    await response.json()
                ) as CatalogStar[]

                setCatalog(loadedCatalog)
                setCatalogError(null)
            } catch (error) {
                if (
                    error instanceof DOMException
                    && error.name === 'AbortError'
                ) {
                    return
                }

                setCatalogError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить каталог звёзд.',
                )
            }
        }

        void loadCatalog()

        return () => abortController.abort()
    }, [])

    useEffect(() => {
        const abortController = new AbortController()

        async function loadStellariumReference() {
            try {
                const loadedReference = await loadStellariumWesternReference(
                    abortController.signal,
                )

                setStellariumReference(loadedReference)
                setStellariumError(null)
            } catch (error) {
                if (
                    error instanceof DOMException
                    && error.name === 'AbortError'
                ) {
                    return
                }

                setStellariumError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить линии созвездий Stellarium.',
                )
            }
        }

        void loadStellariumReference()

        return () => abortController.abort()
    }, [])

    useEffect(() => {
        const abortController = new AbortController()

        async function loadBoundaries() {
            try {
                const loadedBoundaries = await loadConstellationBoundaries(
                    abortController.signal,
                )

                setConstellationBoundaries(loadedBoundaries)
                setBoundariesError(null)
            } catch (error) {
                if (
                    error instanceof DOMException
                    && error.name === 'AbortError'
                ) {
                    return
                }

                setBoundariesError(
                    error instanceof Error
                        ? error.message
                        : 'Не удалось загрузить границы созвездий IAU.',
                )
            }
        }

        void loadBoundaries()

        return () => abortController.abort()
    }, [])

    useEffect(() => {
        if (!session || typeof window === 'undefined') {
            return
        }

        window.localStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(session),
        )
    }, [session])

    const boundStellariumReference = useMemo(
        () => (
            stellariumReference && catalog.length > 0
                ? bindStellariumReferenceToCatalog(
                    catalog,
                    stellariumReference,
                )
                : null
        ),
        [catalog, stellariumReference],
    )

    const chartCatalog = boundStellariumReference?.catalog ?? catalog
    const requiredAsterismStarIds = (
        boundStellariumReference?.requiredStarIds
        ?? new Set<string>()
    )

    const projectedStars = useMemo(
        () => projectSkyChart(chartCatalog, chartParameters),
        [chartCatalog, chartParameters],
    )

    const projectedStarsById = useMemo(
        () => new Map(projectedStars.map((star) => [star.id, star])),
        [projectedStars],
    )

    const starDeckById = useMemo(
        () => new Map(starDeck.map((star) => [star.id, star])),
        [],
    )

    const namedCatalogStarIds = useMemo(
        () => buildNamedCatalogStarIds(chartCatalog),
        [chartCatalog],
    )

    const selectableStars = useMemo(
        () => chooseSelectableStars(projectedStars, {
            namedStarIds: namedCatalogStarIds,
            requiredAsterismStarIds,
        }),
        [
            namedCatalogStarIds,
            projectedStars,
            requiredAsterismStarIds,
        ],
    )

    useEffect(() => {
        if (
            session
            || !boundStellariumReference
            || chartCatalog.length === 0
        ) {
            return
        }

        const exercise = buildSkyChartExercise({
            parameters: chartParameters,
            catalog: chartCatalog,
            projectedStars,
            generationMode: 'manual',
            seed: newSeed(),
        })

        setSession(createInitialSessionState(exercise))
    }, [
        boundStellariumReference,
        chartCatalog,
        chartParameters,
        projectedStars,
        session,
    ])

    const activeTask = useMemo(() => (
        session?.exercise.tasks.find(
            (task) => task.id === session.activeTaskId,
        ) ?? null
    ), [session])

    const activeAnswer = (
        activeTask && session
            ? session.answersByTaskId[activeTask.id] ?? null
            : null
    )

    const asterismTask = useMemo(() => (
        session?.exercise.tasks.find((task) => task.kind === 'asterisms')
        ?? null
    ), [session])
    const asterismAnswer = (
        asterismTask && session
            ? session.answersByTaskId[asterismTask.id]
            : null
    )
    const lines = (
        asterismAnswer?.kind === 'asterisms'
            ? asterismAnswer.lines
            : []
    )
    const constellationStatuses = useMemo<
        ReadonlyMap<string, ConstellationEvaluationStatus>
    >(() => {
        const statuses = new Map<
            string,
            ConstellationEvaluationStatus
        >()

        if (activeTask?.kind !== 'asterisms') {
            return statuses
        }

        for (const constellation of evaluation?.constellations ?? []) {
            statuses.set(
                normalizeConstellationId(constellation.iau),
                constellation.isCorrect ? 'correct' : 'incorrect',
            )
        }

        return statuses
    }, [activeTask?.kind, evaluation])

    const constellationHighlights = useMemo(
        () => projectEvaluatedConstellationBoundaries(
            constellationBoundaries,
            constellationStatuses,
            chartParameters,
        ),
        [
            chartParameters,
            constellationBoundaries,
            constellationStatuses,
        ],
    )

    useEffect(() => {
        setSelectedStarId(null)
        setEraseMode(false)
        setEditingStarMarkerId(null)

        if (!activeTask || !activeAnswer) {
            setSelectedPointTargetId(null)
            return
        }

        if (activeTask.kind === 'reference-points') {
            setSelectedPointTargetId(activeTask.pointIds[0] ?? null)
        } else if (activeTask.kind === 'boundary-crossings') {
            setSelectedPointTargetId(activeTask.crossingIds[0] ?? null)
        } else if (activeTask.kind === 'messier') {
            setSelectedPointTargetId(
                activeTask.messierNumbers[0] !== undefined
                    ? String(activeTask.messierNumbers[0])
                    : null,
            )
        } else {
            setSelectedPointTargetId(null)
        }
    }, [activeTask?.id])

    function setAnswer(taskId: string, answer: SkyChartTaskAnswer) {
        setSession((currentSession) => (
            currentSession
                ? replaceTaskAnswer(currentSession, taskId, answer)
                : currentSession
        ))
    }

    function startExercise(
        parameters: SkyChartParameters,
        generationMode: SkyChartGenerationMode,
    ) {
        setDraftParameters(parameters)
        setChartParameters(parameters)
        setEvaluation(null)
        setSelectedStarId(null)
        setEraseMode(false)
        setEditingStarMarkerId(null)

        if (!boundStellariumReference) {
            return
        }

        const exerciseCatalog = boundStellariumReference.catalog
        const starsForExercise = projectSkyChart(
            exerciseCatalog,
            parameters,
        )
        const exercise = buildSkyChartExercise({
            parameters,
            catalog: exerciseCatalog,
            projectedStars: starsForExercise,
            generationMode,
            seed: newSeed(),
        })

        setSession(createInitialSessionState(exercise))
    }

    function changeMode(mode: SkyChartMode) {
        const nextParameters = mode === 'visible-hemisphere'
            ? DEFAULT_VISIBLE_PARAMETERS
            : DEFAULT_FIELD_PARAMETERS

        setDraftParameters(nextParameters)
    }

    function generateFromCurrentParameters() {
        const normalized = normalizeParameters(draftParameters)
        startExercise(normalized, 'manual')
        setGeneratorOpen(false)
    }

    function generateRandomChart() {
        const generatedParameters = randomParameters(draftParameters)
        const generationMode: SkyChartGenerationMode = (
            generatedParameters.mode === 'visible-hemisphere'
                ? 'random-hemisphere'
                : generatedParameters.centerDecDeg >= 0
                    ? 'random-north-field'
                    : 'random-south-field'
        )

        startExercise(generatedParameters, generationMode)
        setGeneratorOpen(false)
    }

    function updateLimitingMagnitude(value: number) {
        setDraftParameters((currentParameters) => ({
            ...currentParameters,
            limitingMagnitude: value,
        }))
    }

    function activateExerciseTask(task: SkyChartExerciseTask) {
        setSession((currentSession) => (
            currentSession
                ? activateTask(currentSession, task.id)
                : currentSession
        ))
    }

    function setAsterismAnswer(linesValue: readonly SkyChartLine[]) {
        if (!asterismTask || !session) {
            return
        }

        const currentAnswer = session.answersByTaskId[asterismTask.id]

        if (currentAnswer?.kind !== 'asterisms') {
            return
        }

        const nextAnswer: AsterismsAnswer = {
            ...currentAnswer,
            lines: linesValue,
        }
        setAnswer(asterismTask.id, nextAnswer)
        setEvaluation(null)
    }

    function handleStarSelect(star: ProjectedStar) {
        if (!activeTask || !activeAnswer) {
            return
        }

        if (activeTask.kind === 'asterisms') {
            if (!selectedStarId) {
                setSelectedStarId(star.id)
                return
            }

            if (selectedStarId === star.id) {
                setSelectedStarId(null)
                return
            }

            const lineId = buildSkyChartLineId(
                selectedStarId,
                star.id,
            )

            if (!lines.some((line) => line.id === lineId)) {
                setAsterismAnswer([
                    ...lines,
                    {
                        id: lineId,
                        startStarId: selectedStarId,
                        endStarId: star.id,
                    },
                ])
            }

            setSelectedStarId(continuousDrawing ? star.id : null)
            return
        }

        if (
            activeTask.kind !== 'stars'
            || activeAnswer.kind !== 'stars'
        ) {
            return
        }

        const existingMarker = activeAnswer.markers.find(
            (marker) => marker.catalogStarId === star.id,
        )

        if (existingMarker) {
            setEditingStarMarkerId(existingMarker.id)
            setSelectedStarId(star.id)
            return
        }

        const marker: StarMarkerAnswer = {
            id: newMarkerId('star'),
            catalogStarId: star.id,
            selectedStarId: '',
            selectedDesignation: '',
        }
        const nextAnswer: StarsAnswer = {
            ...activeAnswer,
            markers: [...activeAnswer.markers, marker],
        }

        setAnswer(activeTask.id, nextAnswer)
        setEditingStarMarkerId(marker.id)
        setSelectedStarId(star.id)
    }

    function handleLineErase(line: SkyChartLine) {
        setAsterismAnswer(lines.filter(
            (currentLine) => currentLine.id !== line.id,
        ))
    }

    function undoLastLine() {
        setAsterismAnswer(lines.slice(0, -1))
        setSelectedStarId(null)
    }

    function finishCurrentChain() {
        setSelectedStarId(null)
    }

    function resetDrawing() {
        setAsterismAnswer([])
        setSelectedStarId(null)
    }

    function checkDrawing() {
        if (!boundStellariumReference) {
            return
        }

        setEvaluation(evaluateSkyChart(
            projectedStars,
            boundStellariumReference.constellations,
            lines,
        ))
        setSelectedStarId(null)
        setEraseMode(false)
    }

    function handleChartPointSelect(point: ChartPoint) {
        if (
            !activeTask
            || !activeAnswer
            || !selectedPointTargetId
        ) {
            return
        }

        if (
            activeTask.kind === 'reference-points'
            && activeAnswer.kind === 'reference-points'
        ) {
            const targetId = selectedPointTargetId as ReferencePointId
            setAnswer(
                activeTask.id,
                upsertReferenceMarker(activeAnswer, targetId, point),
            )
            return
        }

        if (
            activeTask.kind === 'boundary-crossings'
            && activeAnswer.kind === 'boundary-crossings'
        ) {
            const targetId = selectedPointTargetId as BoundaryCrossingId
            setAnswer(
                activeTask.id,
                upsertBoundaryMarker(activeAnswer, targetId, point),
            )
            return
        }

        if (
            activeTask.kind === 'messier'
            && activeAnswer.kind === 'messier'
        ) {
            const messierNumber = Number(selectedPointTargetId)

            if (Number.isFinite(messierNumber)) {
                setAnswer(
                    activeTask.id,
                    upsertMessierMarker(
                        activeAnswer,
                        messierNumber,
                        point,
                    ),
                )
            }
        }
    }

    function toggleReferenceAbsent(pointId: ReferencePointId) {
        if (
            !activeTask
            || activeTask.kind !== 'reference-points'
            || activeAnswer?.kind !== 'reference-points'
        ) {
            return
        }

        const isAbsent = activeAnswer.absentPointIds.includes(pointId)
        const nextAnswer: ReferencePointsAnswer = {
            ...activeAnswer,
            markers: isAbsent
                ? activeAnswer.markers
                : activeAnswer.markers.filter(
                    (marker) => marker.targetId !== pointId,
                ),
            absentPointIds: isAbsent
                ? activeAnswer.absentPointIds.filter(
                    (currentId) => currentId !== pointId,
                )
                : [...activeAnswer.absentPointIds, pointId],
        }

        setAnswer(activeTask.id, nextAnswer)
    }

    function toggleStarAbsent(starId: string) {
        if (
            !activeTask
            || activeTask.kind !== 'stars'
            || activeAnswer?.kind !== 'stars'
        ) {
            return
        }

        const isAbsent = activeAnswer.absentStarIds.includes(starId)
        const markerForStar = activeAnswer.markers.find(
            (marker) => marker.selectedStarId === starId,
        )
        const nextAnswer: StarsAnswer = {
            ...activeAnswer,
            markers: isAbsent
                ? activeAnswer.markers
                : activeAnswer.markers.filter(
                    (marker) => marker.selectedStarId !== starId,
                ),
            absentStarIds: isAbsent
                ? activeAnswer.absentStarIds.filter(
                    (currentId) => currentId !== starId,
                )
                : [...activeAnswer.absentStarIds, starId],
        }

        setAnswer(activeTask.id, nextAnswer)

        if (
            !isAbsent
            && markerForStar?.id === editingStarMarkerId
        ) {
            setEditingStarMarkerId(null)
            setSelectedStarId(null)
        }
    }

    function toggleMessierAbsent(messierNumber: number) {
        if (
            !activeTask
            || activeTask.kind !== 'messier'
            || activeAnswer?.kind !== 'messier'
        ) {
            return
        }

        const isAbsent = activeAnswer.absentMessierNumbers.includes(
            messierNumber,
        )
        const nextAnswer: MessierAnswer = {
            ...activeAnswer,
            markers: isAbsent
                ? activeAnswer.markers
                : activeAnswer.markers.filter(
                    (marker) => marker.messierNumber !== messierNumber,
                ),
            absentMessierNumbers: isAbsent
                ? activeAnswer.absentMessierNumbers.filter(
                    (number) => number !== messierNumber,
                )
                : [...activeAnswer.absentMessierNumbers, messierNumber],
        }

        setAnswer(activeTask.id, nextAnswer)
    }

    function updateEditingStarMarker(
        patch: Partial<Pick<
            StarMarkerAnswer,
            'selectedStarId' | 'selectedDesignation'
        >>,
    ) {
        if (
            !activeTask
            || activeTask.kind !== 'stars'
            || activeAnswer?.kind !== 'stars'
            || !editingStarMarkerId
        ) {
            return
        }

        if (
            patch.selectedStarId
            && activeAnswer.markers.some((marker) => (
                marker.id !== editingStarMarkerId
                && marker.selectedStarId === patch.selectedStarId
            ))
        ) {
            return
        }

        const nextAnswer: StarsAnswer = {
            ...activeAnswer,
            markers: activeAnswer.markers.map((marker) => (
                marker.id === editingStarMarkerId
                    ? { ...marker, ...patch }
                    : marker
            )),
            absentStarIds: patch.selectedStarId
                ? activeAnswer.absentStarIds.filter(
                    (starId) => starId !== patch.selectedStarId,
                )
                : activeAnswer.absentStarIds,
        }

        setAnswer(activeTask.id, nextAnswer)
    }

    function deleteEditingStarMarker() {
        if (
            !activeTask
            || activeTask.kind !== 'stars'
            || activeAnswer?.kind !== 'stars'
            || !editingStarMarkerId
        ) {
            return
        }

        const nextAnswer: StarsAnswer = {
            ...activeAnswer,
            markers: activeAnswer.markers.filter(
                (marker) => marker.id !== editingStarMarkerId,
            ),
        }

        setAnswer(activeTask.id, nextAnswer)
        setEditingStarMarkerId(null)
        setSelectedStarId(null)
    }

    function finishEditingStarMarker() {
        setEditingStarMarkerId(null)
        setSelectedStarId(null)
    }

    function updateOrientation(
        patch: Partial<OrientationAnswer>,
    ) {
        if (
            !activeTask
            || activeTask.kind !== 'orientation'
            || activeAnswer?.kind !== 'orientation'
        ) {
            return
        }

        setAnswer(activeTask.id, {
            ...activeAnswer,
            ...patch,
        })
    }

    const answerMarkers = useMemo(() => (
        session && activeTask
            ? buildSkyChartAnswerMarkers({
                session,
                activeTask,
                projectedStarsById,
                starDeckById,
            })
            : []
    ), [
        activeTask,
        projectedStarsById,
        session,
        starDeckById,
    ])

    const pointSelectionEnabled = (
        activeTask?.kind === 'reference-points'
        || activeTask?.kind === 'boundary-crossings'
        || activeTask?.kind === 'messier'
    )
    const starSelectionEnabled = (
        activeTask?.kind === 'asterisms'
        || activeTask?.kind === 'stars'
    )

    function renderTaskPanel() {
        if (!activeTask || !activeAnswer) {
            return null
        }

        if (
            activeTask.kind === 'reference-points'
            && activeAnswer.kind === 'reference-points'
        ) {
            return (
                <div className="skychart-task-panel">
                    <strong>Выберите точку и отметьте её на карте</strong>
                    <div className="skychart-target-list">
                        {activeTask.pointIds.map((pointId) => {
                            const marked = activeAnswer.markers.some(
                                (marker) => marker.targetId === pointId,
                            )
                            const absent = activeAnswer.absentPointIds.includes(
                                pointId,
                            )

                            return (
                                <div
                                    className="skychart-target-row"
                                    key={pointId}
                                >
                                    <button
                                        type="button"
                                        className={[
                                            'skychart-target-button',
                                            selectedPointTargetId === pointId
                                                ? 'skychart-target-button--active'
                                                : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => setSelectedPointTargetId(
                                            pointId,
                                        )}
                                    >
                                        <span>
                                            {REFERENCE_POINT_LABELS[pointId]}
                                        </span>
                                        <span>
                                            {REFERENCE_POINT_NAMES[pointId]}
                                        </span>
                                        <span>
                                            {marked ? '✓' : absent ? 'нет' : ''}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            absent
                                                ? 'skychart-absent-button skychart-absent-button--active'
                                                : 'skychart-absent-button'
                                        }
                                        onClick={() => toggleReferenceAbsent(
                                            pointId,
                                        )}
                                    >
                                        Нет на карте
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

        if (
            activeTask.kind === 'boundary-crossings'
            && activeAnswer.kind === 'boundary-crossings'
        ) {
            return (
                <div className="skychart-task-panel">
                    <strong>Выберите обозначение и поставьте точку на границе карты</strong>
                    <div className="skychart-simple-target-grid">
                        {activeTask.crossingIds.map((crossingId) => {
                            const marked = activeAnswer.markers.some(
                                (marker) => marker.targetId === crossingId,
                            )

                            return (
                                <button
                                    type="button"
                                    key={crossingId}
                                    className={[
                                        'skychart-target-button',
                                        selectedPointTargetId === crossingId
                                            ? 'skychart-target-button--active'
                                            : '',
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => setSelectedPointTargetId(
                                        crossingId,
                                    )}
                                >
                                    <span>
                                        {BOUNDARY_CROSSING_LABELS[crossingId]}
                                    </span>
                                    <span>{marked ? '✓' : ''}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )
        }

        if (
            activeTask.kind === 'stars'
            && activeAnswer.kind === 'stars'
        ) {
            return (
                <SkyChartStarTaskPanel
                    task={activeTask}
                    answer={activeAnswer}
                    starDeckById={starDeckById}
                    editingMarkerId={editingStarMarkerId}
                    onEditMarker={(marker) => {
                        setEditingStarMarkerId(marker.id)
                        setSelectedStarId(marker.catalogStarId)
                    }}
                    onToggleAbsent={toggleStarAbsent}
                    onUpdateMarker={updateEditingStarMarker}
                    onDeleteMarker={deleteEditingStarMarker}
                    onFinishEditing={finishEditingStarMarker}
                />
            )
        }

        if (
            activeTask.kind === 'messier'
            && activeAnswer.kind === 'messier'
        ) {
            return (
                <div className="skychart-task-panel">
                    <strong>
                        Выберите объект и отметьте его положение треугольником
                    </strong>
                    <div className="skychart-target-list">
                        {activeTask.messierNumbers.map((number) => {
                            const marked = activeAnswer.markers.some(
                                (marker) => marker.messierNumber === number,
                            )
                            const absent = activeAnswer.absentMessierNumbers.includes(
                                number,
                            )

                            return (
                                <div
                                    className="skychart-target-row"
                                    key={number}
                                >
                                    <button
                                        type="button"
                                        className={[
                                            'skychart-target-button',
                                            selectedPointTargetId === String(number)
                                                ? 'skychart-target-button--active'
                                                : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => setSelectedPointTargetId(
                                            String(number),
                                        )}
                                    >
                                        <span>M{number}</span>
                                        <span>{marked ? '✓' : absent ? 'нет' : ''}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={
                                            absent
                                                ? 'skychart-absent-button skychart-absent-button--active'
                                                : 'skychart-absent-button'
                                        }
                                        onClick={() => toggleMessierAbsent(number)}
                                    >
                                        Нет на карте
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

        if (
            activeTask.kind === 'asterisms'
            && activeAnswer.kind === 'asterisms'
        ) {
            return (
                <div className="skychart-drawing-panel">
                    <div>
                        <span className="skychart-drawing-label">
                            Линии созвездий
                        </span>
                        <strong>
                            {eraseMode
                                ? 'Нажмите на линию, чтобы стереть её'
                                : selectedStarId
                                    ? 'Выберите следующую звезду'
                                    : 'Выберите первую звезду'}
                        </strong>
                    </div>

                    <div className="skychart-tool-switch">
                        <button
                            type="button"
                            className={
                                eraseMode
                                    ? 'skychart-tool-button'
                                    : 'skychart-tool-button skychart-tool-button--active'
                            }
                            onClick={() => setEraseMode(false)}
                        >
                            Рисование
                        </button>
                        <button
                            type="button"
                            className={
                                eraseMode
                                    ? 'skychart-tool-button skychart-tool-button--active'
                                    : 'skychart-tool-button'
                            }
                            onClick={() => {
                                setEraseMode(true)
                                setSelectedStarId(null)
                            }}
                        >
                            Ластик
                        </button>
                    </div>

                    <label className="skychart-chain-toggle">
                        <input
                            type="checkbox"
                            checked={continuousDrawing}
                            onChange={(event) => setContinuousDrawing(
                                event.target.checked,
                            )}
                        />
                        <span>Непрерывная линия</span>
                    </label>

                    <div className="skychart-drawing-actions">
                        <button
                            type="button"
                            onClick={undoLastLine}
                            disabled={lines.length === 0}
                        >
                            Отменить
                        </button>
                        <button
                            type="button"
                            onClick={finishCurrentChain}
                            disabled={!selectedStarId}
                        >
                            Завершить линию
                        </button>
                        <button
                            type="button"
                            onClick={resetDrawing}
                            disabled={
                                lines.length === 0
                                && !selectedStarId
                            }
                        >
                            Очистить всё
                        </button>
                        <button
                            type="button"
                            className="skychart-check-button"
                            onClick={checkDrawing}
                            disabled={!boundStellariumReference}
                        >
                            Проверить
                        </button>
                    </div>

                    {evaluation && (
                        <div className={[
                            'skychart-evaluation',
                            evaluation.isPerfect
                                ? 'skychart-evaluation--perfect'
                                : '',
                        ].filter(Boolean).join(' ')}>
                            <strong>
                                {evaluation.isPerfect
                                    ? 'Все видимые созвездия распознаны'
                                    : `Оценка: ${evaluation.scorePercent}%`}
                            </strong>
                            <span>
                                Правильных созвездий: {' '}
                                {evaluation.correctConstellationCount}
                                {' / '}
                                {evaluation.checkedConstellationCount}
                            </span>
                            <span>
                                Неправильных: {evaluation.incorrectConstellationCount}
                            </span>
                            <span>
                                Лишних линий: {evaluation.extraLineCount}
                            </span>
                            <span>
                                Не дорисовано: {evaluation.missingLineCount}
                            </span>
                        </div>
                    )}
                </div>
            )
        }

        if (
            activeTask.kind === 'orientation'
            && activeAnswer.kind === 'orientation'
        ) {
            return (
                <div className="skychart-task-panel">
                    <strong>Определите параметры карты</strong>
                    <label className="skychart-field">
                        <span>Широта, °</span>
                        <input
                            type="number"
                            min="-90"
                            max="90"
                            step="0.1"
                            value={activeAnswer.latitudeDeg ?? ''}
                            onChange={(event) => updateOrientation({
                                latitudeDeg: event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                            })}
                        />
                    </label>
                    <label className="skychart-field">
                        <span>Звёздное время, ч</span>
                        <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.1"
                            value={activeAnswer.siderealTimeHours ?? ''}
                            onChange={(event) => updateOrientation({
                                siderealTimeHours: event.target.value === ''
                                    ? null
                                    : Number(event.target.value),
                            })}
                        />
                    </label>
                </div>
            )
        }

        return null
    }

    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <h2>Скайчарты</h2>
            </div>

            <div className="skychart-workspace">
                <aside className="skychart-controls">
                    <button
                        type="button"
                        className="skychart-generator-toggle"
                        onClick={() => setGeneratorOpen((open) => !open)}
                    >
                        {generatorOpen
                            ? 'Скрыть параметры генератора'
                            : 'Параметры генератора'}
                    </button>

                    {generatorOpen && (
                        <div className="skychart-generator-settings">
                            <h3>Параметры карты</h3>

                            <div className="skychart-mode-switch">
                                <button
                                    type="button"
                                    className={
                                        draftParameters.mode === 'visible-hemisphere'
                                            ? 'skychart-mode-button skychart-mode-button--active'
                                            : 'skychart-mode-button'
                                    }
                                    onClick={() => changeMode('visible-hemisphere')}
                                >
                                    Полушарие
                                </button>
                                <button
                                    type="button"
                                    className={
                                        draftParameters.mode === 'equatorial-field'
                                            ? 'skychart-mode-button skychart-mode-button--active'
                                            : 'skychart-mode-button'
                                    }
                                    onClick={() => changeMode('equatorial-field')}
                                >
                                    Участок неба
                                </button>
                            </div>

                            {draftParameters.mode === 'visible-hemisphere' ? (
                                <>
                                    <label className="skychart-field">
                                        <span>Широта, °</span>
                                        <input
                                            type="number"
                                            min="-90"
                                            max="90"
                                            step="0.1"
                                            value={draftParameters.latitudeDeg}
                                            onChange={(event) => setDraftParameters({
                                                ...draftParameters,
                                                latitudeDeg: inputNumber(event),
                                            })}
                                        />
                                    </label>

                                    <label className="skychart-field">
                                        <span>Звёздное время, ч</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.1"
                                            value={draftParameters.siderealTimeHours}
                                            onChange={(event) => setDraftParameters({
                                                ...draftParameters,
                                                siderealTimeHours: inputNumber(event),
                                            })}
                                        />
                                    </label>
                                </>
                            ) : (
                                <>
                                    <label className="skychart-field">
                                        <span>Прямое восхождение центра, ч</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.1"
                                            value={draftParameters.centerRaHours}
                                            onChange={(event) => setDraftParameters({
                                                ...draftParameters,
                                                centerRaHours: inputNumber(event),
                                            })}
                                        />
                                    </label>

                                    <label className="skychart-field">
                                        <span>Склонение центра, °</span>
                                        <input
                                            type="number"
                                            min="-90"
                                            max="90"
                                            step="0.1"
                                            value={draftParameters.centerDecDeg}
                                            onChange={(event) => setDraftParameters({
                                                ...draftParameters,
                                                centerDecDeg: inputNumber(event),
                                            })}
                                        />
                                    </label>

                                    <label className="skychart-field">
                                        <span>Угловой диаметр карты, °</span>
                                        <input
                                            type="number"
                                            min="2"
                                            max="180"
                                            step="1"
                                            value={draftParameters.angularDiameterDeg}
                                            onChange={(event) => setDraftParameters({
                                                ...draftParameters,
                                                angularDiameterDeg: inputNumber(event),
                                            })}
                                        />
                                    </label>

                                    <label className="skychart-field">
                                        <span>Поворот карты, °</span>
                                        <input
                                            type="number"
                                            min="-180"
                                            max="180"
                                            step="1"
                                            value={draftParameters.rotationDeg}
                                            onChange={(event) => setDraftParameters({
                                                ...draftParameters,
                                                rotationDeg: inputNumber(event),
                                            })}
                                        />
                                    </label>
                                </>
                            )}

                            <label className="skychart-field">
                                <span>Предельная звёздная величина</span>
                                <input
                                    type="number"
                                    min="-2"
                                    max="8"
                                    step="0.1"
                                    value={draftParameters.limitingMagnitude}
                                    onChange={(event) => updateLimitingMagnitude(
                                        inputNumber(event),
                                    )}
                                />
                            </label>

                            <div className="skychart-control-actions">
                                <button
                                    className="button button-primary"
                                    type="button"
                                    onClick={generateFromCurrentParameters}
                                >
                                    Построить карту и задания
                                </button>

                                <button
                                    className="button button-secondary"
                                    type="button"
                                    onClick={generateRandomChart}
                                >
                                    Случайная карта и задания
                                </button>
                            </div>
                        </div>
                    )}

                    {session && (
                        <>
                            <div className="skychart-task-switcher">
                                {session.exercise.tasks.map((task, index) => (
                                    <button
                                        type="button"
                                        key={task.id}
                                        className={
                                            task.id === session.activeTaskId
                                                ? 'skychart-task-button skychart-task-button--active'
                                                : 'skychart-task-button'
                                        }
                                        onClick={() => activateExerciseTask(task)}
                                    >
                                        <span>{index + 1}</span>
                                        <span>
                                            {SKY_CHART_TASK_TITLES[task.kind]}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {renderTaskPanel()}

                            <div className="skychart-current-values">
                                <span>
                                    Seed
                                    <strong>{session.exercise.seed}</strong>
                                </span>
                                <span>
                                    Звёзд на карте
                                    <strong>{projectedStars.length}</strong>
                                </span>
                                <span>
                                    Кликабельных звёзд
                                    <strong>{selectableStars.length}</strong>
                                </span>
                                <span>
                                    Сохранение
                                    <strong>автоматически</strong>
                                </span>
                            </div>
                        </>
                    )}
                </aside>

                <div className="skychart-preview">
                    {catalogError || stellariumError || boundariesError ? (
                        <div className="skychart-message skychart-message--error">
                            {catalogError ?? stellariumError ?? boundariesError}
                        </div>
                    ) : (
                        catalog.length === 0
                        || !boundStellariumReference
                        || constellationBoundaries.length === 0
                        || !session
                    ) ? (
                        <div className="skychart-message">
                            Загружаем каталог, эталон и задания…
                        </div>
                    ) : (
                        <>
                            <SkyChartSvg
                                stars={projectedStars}
                                selectableStars={selectableStars}
                                lines={lines}
                                linesActive={
                                    activeTask?.kind === 'asterisms'
                                }
                                selectedStarId={selectedStarId}
                                onStarSelect={handleStarSelect}
                                starSelectionEnabled={starSelectionEnabled}
                                pointSelectionEnabled={pointSelectionEnabled}
                                onChartPointSelect={handleChartPointSelect}
                                markers={answerMarkers}
                                eraseMode={
                                    activeTask?.kind === 'asterisms'
                                    && eraseMode
                                }
                                onLineErase={handleLineErase}
                                correctLineIds={
                                    activeTask?.kind === 'asterisms'
                                        ? evaluation?.correctLineIds
                                        : undefined
                                }
                                extraLineIds={
                                    activeTask?.kind === 'asterisms'
                                        ? evaluation?.extraLineIds
                                        : undefined
                                }
                                missingLines={
                                    activeTask?.kind === 'asterisms'
                                        ? evaluation?.missingLines
                                        : []
                                }
                                constellationHighlights={
                                    activeTask?.kind === 'asterisms'
                                        ? constellationHighlights
                                        : []
                                }
                            />
                            <p className="skychart-hint">
                                Переключайте задания слева. Всё уже нанесённое остаётся
                                на общей карте: активный слой показывается полностью,
                                остальные — полупрозрачно. Точки и объекты ставятся
                                обычным кликом, звёзды привязываются к ближайшей
                                кликабельной звезде, а астеризмы рисуются линиями.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export default SkyChartsPage
