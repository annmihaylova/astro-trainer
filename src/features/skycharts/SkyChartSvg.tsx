import {
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react'
import type {
    PointerEvent as ReactPointerEvent,
} from 'react'
import type {
    ProjectedConstellationHighlight,
} from './constellationBoundaries'
import type {
    ProjectedStar,
    SkyChartLine,
} from './types'

const VIEWPORT_SIZE = 1000
const CHART_CENTER = VIEWPORT_SIZE / 2
const CHART_RADIUS = 472
const MIN_VIEWBOX_SIZE = 125
const CLICK_MOVEMENT_LIMIT_PX = 6
const STAR_HIT_RADIUS_PX = 10
const LINE_HIT_RADIUS_PX = 12

export type SkyChartMarkerShape = 'cross' | 'triangle' | 'dot'

export type SkyChartMarker = {
    id: string
    x: number
    y: number
    label?: string
    secondaryLabel?: string
    shape: SkyChartMarkerShape
    active?: boolean
}

export type SkyChartSvgProps = {
    stars: readonly ProjectedStar[]
    selectableStars: readonly ProjectedStar[]
    lines: readonly SkyChartLine[]
    linesActive?: boolean
    selectedStarId: string | null
    onStarSelect: (star: ProjectedStar) => void
    starSelectionEnabled?: boolean
    pointSelectionEnabled?: boolean
    onChartPointSelect?: (point: { x: number; y: number }) => void
    markers?: readonly SkyChartMarker[]
    eraseMode?: boolean
    onLineErase?: (line: SkyChartLine) => void
    correctLineIds?: ReadonlySet<string>
    extraLineIds?: ReadonlySet<string>
    missingLines?: readonly SkyChartLine[]
    constellationHighlights?: readonly ProjectedConstellationHighlight[]
}

type ViewBox = {
    x: number
    y: number
    width: number
    height: number
}

type PointerState = {
    pointerId: number
    startClientX: number
    startClientY: number
    startViewBox: ViewBox
    moved: boolean
}

type Point = {
    x: number
    y: number
}

const INITIAL_VIEWBOX: ViewBox = {
    x: 0,
    y: 0,
    width: VIEWPORT_SIZE,
    height: VIEWPORT_SIZE,
}

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}

function clampViewBox(viewBox: ViewBox): ViewBox {
    const width = clamp(
        viewBox.width,
        MIN_VIEWBOX_SIZE,
        VIEWPORT_SIZE,
    )
    const height = width

    return {
        x: clamp(viewBox.x, 0, VIEWPORT_SIZE - width),
        y: clamp(viewBox.y, 0, VIEWPORT_SIZE - height),
        width,
        height,
    }
}

function calculateZoomedViewBox(
    currentViewBox: ViewBox,
    targetX: number,
    targetY: number,
    scaleFactor: number,
) {
    const nextWidth = clamp(
        currentViewBox.width * scaleFactor,
        MIN_VIEWBOX_SIZE,
        VIEWPORT_SIZE,
    )
    const relativeX = (
        targetX - currentViewBox.x
    ) / currentViewBox.width
    const relativeY = (
        targetY - currentViewBox.y
    ) / currentViewBox.height

    return clampViewBox({
        x: targetX - relativeX * nextWidth,
        y: targetY - relativeY * nextWidth,
        width: nextWidth,
        height: nextWidth,
    })
}

function clientPointToChartPoint(
    clientX: number,
    clientY: number,
    bounds: DOMRect,
    viewBox: ViewBox,
) {
    return {
        x: (
            viewBox.x
            + (clientX - bounds.left)
            / bounds.width
            * viewBox.width
        ),
        y: (
            viewBox.y
            + (clientY - bounds.top)
            / bounds.height
            * viewBox.height
        ),
    }
}

function isInsideChart(point: Point) {
    return Math.hypot(
        point.x - CHART_CENTER,
        point.y - CHART_CENTER,
    ) <= CHART_RADIUS + 1e-6
}

function distanceSquared(first: Point, second: Point) {
    return (
        (first.x - second.x) ** 2
        + (first.y - second.y) ** 2
    )
}

function distanceToSegmentSquared(
    point: Point,
    segmentStart: Point,
    segmentEnd: Point,
) {
    const deltaX = segmentEnd.x - segmentStart.x
    const deltaY = segmentEnd.y - segmentStart.y
    const segmentLengthSquared = deltaX ** 2 + deltaY ** 2

    if (segmentLengthSquared <= 1e-12) {
        return distanceSquared(point, segmentStart)
    }

    const projection = clamp(
        (
            (point.x - segmentStart.x) * deltaX
            + (point.y - segmentStart.y) * deltaY
        ) / segmentLengthSquared,
        0,
        1,
    )

    return distanceSquared(point, {
        x: segmentStart.x + projection * deltaX,
        y: segmentStart.y + projection * deltaY,
    })
}

function SkyChartSvg({
    stars,
    selectableStars,
    lines,
    linesActive = true,
    selectedStarId,
    onStarSelect,
    starSelectionEnabled = true,
    pointSelectionEnabled = false,
    onChartPointSelect,
    markers = [],
    eraseMode = false,
    onLineErase,
    correctLineIds,
    extraLineIds,
    missingLines = [],
    constellationHighlights = [],
}: SkyChartSvgProps) {
    const svgRef = useRef<SVGSVGElement | null>(null)
    const pointerStateRef = useRef<PointerState | null>(null)
    const viewBoxRef = useRef<ViewBox>(INITIAL_VIEWBOX)
    const [viewBox, setViewBox] = useState<ViewBox>(INITIAL_VIEWBOX)
    const clipPathId = `sky-chart-${useId().replaceAll(':', '')}`
    const isZoomed = viewBox.width < VIEWPORT_SIZE

    const starsById = useMemo(
        () => new Map(stars.map((star) => [star.id, star])),
        [stars],
    )
    const selectedStar = selectedStarId
        ? starsById.get(selectedStarId) ?? null
        : null

    function applyViewBox(nextViewBox: ViewBox) {
        const clampedViewBox = clampViewBox(nextViewBox)
        viewBoxRef.current = clampedViewBox
        setViewBox(clampedViewBox)
    }

    function resetViewBox() {
        viewBoxRef.current = INITIAL_VIEWBOX
        setViewBox(INITIAL_VIEWBOX)
    }

    function zoomAroundPoint(
        targetX: number,
        targetY: number,
        scaleFactor: number,
    ) {
        applyViewBox(calculateZoomedViewBox(
            viewBoxRef.current,
            targetX,
            targetY,
            scaleFactor,
        ))
    }

    useEffect(() => {
        resetViewBox()
    }, [stars])

    useEffect(() => {
        const svgElement = svgRef.current

        if (!svgElement) {
            return
        }

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault()

            const bounds = svgElement.getBoundingClientRect()
            const currentViewBox = viewBoxRef.current
            const pointer = clientPointToChartPoint(
                event.clientX,
                event.clientY,
                bounds,
                currentViewBox,
            )
            const scaleFactor = event.deltaY < 0 ? 0.82 : 1.22
            const nextViewBox = calculateZoomedViewBox(
                currentViewBox,
                pointer.x,
                pointer.y,
                scaleFactor,
            )

            viewBoxRef.current = nextViewBox
            setViewBox(nextViewBox)
        }

        svgElement.addEventListener(
            'wheel',
            handleWheel,
            { passive: false },
        )

        return () => {
            svgElement.removeEventListener('wheel', handleWheel)
        }
    }, [])

    function chartPointFromEvent(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        const bounds = event.currentTarget.getBoundingClientRect()
        return clientPointToChartPoint(
            event.clientX,
            event.clientY,
            bounds,
            viewBoxRef.current,
        )
    }

    function selectNearestStar(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        const bounds = event.currentTarget.getBoundingClientRect()
        const currentViewBox = viewBoxRef.current
        const pointer = clientPointToChartPoint(
            event.clientX,
            event.clientY,
            bounds,
            currentViewBox,
        )
        const hitRadius = (
            STAR_HIT_RADIUS_PX
            * currentViewBox.width
            / bounds.width
        )

        let nearestStar: ProjectedStar | null = null
        let nearestDistanceSquared = Number.POSITIVE_INFINITY

        for (const star of selectableStars) {
            const distanceToStarSquared = distanceSquared(pointer, star)
            const allowedDistance = Math.max(
                hitRadius,
                star.radius + hitRadius * 0.35,
            )

            if (
                distanceToStarSquared <= allowedDistance ** 2
                && distanceToStarSquared < nearestDistanceSquared
            ) {
                nearestStar = star
                nearestDistanceSquared = distanceToStarSquared
            }
        }

        if (nearestStar) {
            onStarSelect(nearestStar)
        }
    }

    function selectChartPoint(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        if (!onChartPointSelect) {
            return
        }

        const point = chartPointFromEvent(event)

        if (isInsideChart(point)) {
            onChartPointSelect(point)
        }
    }

    function eraseNearestLine(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        if (!onLineErase || lines.length === 0) {
            return
        }

        const bounds = event.currentTarget.getBoundingClientRect()
        const currentViewBox = viewBoxRef.current
        const pointer = clientPointToChartPoint(
            event.clientX,
            event.clientY,
            bounds,
            currentViewBox,
        )
        const hitRadius = (
            LINE_HIT_RADIUS_PX
            * currentViewBox.width
            / bounds.width
        )

        let nearestLine: SkyChartLine | null = null
        let nearestDistanceSquared = Number.POSITIVE_INFINITY

        for (const line of lines) {
            const startStar = starsById.get(line.startStarId)
            const endStar = starsById.get(line.endStarId)

            if (!startStar || !endStar) {
                continue
            }

            const distanceToLineSquared = distanceToSegmentSquared(
                pointer,
                startStar,
                endStar,
            )

            if (
                distanceToLineSquared <= hitRadius ** 2
                && distanceToLineSquared < nearestDistanceSquared
            ) {
                nearestLine = line
                nearestDistanceSquared = distanceToLineSquared
            }
        }

        if (nearestLine) {
            onLineErase(nearestLine)
        }
    }

    function handlePointerDown(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return
        }

        pointerStateRef.current = {
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startViewBox: viewBoxRef.current,
            moved: false,
        }

        if (event.pointerType !== 'touch' && isZoomed) {
            event.currentTarget.setPointerCapture(event.pointerId)
        }
    }

    function handlePointerMove(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        const pointerState = pointerStateRef.current

        if (
            !pointerState
            || pointerState.pointerId !== event.pointerId
        ) {
            return
        }

        const clientDeltaX = event.clientX - pointerState.startClientX
        const clientDeltaY = event.clientY - pointerState.startClientY

        if (
            Math.hypot(clientDeltaX, clientDeltaY)
            > CLICK_MOVEMENT_LIMIT_PX
        ) {
            pointerState.moved = true
        }

        if (
            !pointerState.moved
            || event.pointerType === 'touch'
            || !isZoomed
        ) {
            return
        }

        const bounds = event.currentTarget.getBoundingClientRect()
        const deltaX = (
            clientDeltaX
            * pointerState.startViewBox.width
            / bounds.width
        )
        const deltaY = (
            clientDeltaY
            * pointerState.startViewBox.height
            / bounds.height
        )

        applyViewBox({
            ...pointerState.startViewBox,
            x: pointerState.startViewBox.x - deltaX,
            y: pointerState.startViewBox.y - deltaY,
        })
    }

    function handlePointerUp(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        const pointerState = pointerStateRef.current

        if (
            !pointerState
            || pointerState.pointerId !== event.pointerId
        ) {
            return
        }

        if (!pointerState.moved) {
            if (eraseMode) {
                eraseNearestLine(event)
            } else if (pointSelectionEnabled) {
                selectChartPoint(event)
            } else if (starSelectionEnabled) {
                selectNearestStar(event)
            }
        }

        pointerStateRef.current = null

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
    }

    function handlePointerCancel(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        if (pointerStateRef.current?.pointerId === event.pointerId) {
            pointerStateRef.current = null
        }
    }

    function zoomFromCenter(scaleFactor: number) {
        const currentViewBox = viewBoxRef.current
        zoomAroundPoint(
            currentViewBox.x + currentViewBox.width / 2,
            currentViewBox.y + currentViewBox.height / 2,
            scaleFactor,
        )
    }

    return (
        <div className="sky-chart-viewer">
            <div className="sky-chart-zoom-controls">
                <button
                    type="button"
                    aria-label="Приблизить карту"
                    onClick={() => zoomFromCenter(0.75)}
                >
                    +
                </button>
                <button
                    type="button"
                    aria-label="Отдалить карту"
                    onClick={() => zoomFromCenter(1.34)}
                >
                    −
                </button>
                <button
                    type="button"
                    aria-label="Вернуть исходный масштаб"
                    onClick={resetViewBox}
                    disabled={!isZoomed}
                >
                    1:1
                </button>
            </div>

            <svg
                ref={svgRef}
                className={[
                    'sky-chart-svg',
                    isZoomed ? 'sky-chart-svg--zoomed' : '',
                    eraseMode ? 'sky-chart-svg--erase-mode' : '',
                    pointSelectionEnabled
                        ? 'sky-chart-svg--point-selection'
                        : '',
                ].filter(Boolean).join(' ')}
                viewBox={[
                    viewBox.x,
                    viewBox.y,
                    viewBox.width,
                    viewBox.height,
                ].join(' ')}
                role="img"
                aria-label="Интерактивная звёздная карта"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
            >
                <defs>
                    <clipPath id={clipPathId}>
                        <circle cx="500" cy="500" r="472" />
                    </clipPath>
                </defs>

                <rect
                    x="0"
                    y="0"
                    width="1000"
                    height="1000"
                    fill="#ffffff"
                />

                <g clipPath={`url(#${clipPathId})`}>
                    <circle
                        cx="500"
                        cy="500"
                        r="472"
                        fill="#ffffff"
                    />

                    {constellationHighlights.flatMap((highlight) => {
                        const className = [
                            'sky-chart-constellation-highlight',
                            highlight.status === 'correct'
                                ? 'sky-chart-constellation-highlight--correct'
                                : 'sky-chart-constellation-highlight--incorrect',
                        ].join(' ')

                        return highlight.paths.map((path, pathIndex) => (
                            <path
                                key={`highlight-${highlight.id}-${pathIndex}`}
                                d={path}
                                className={className}
                                fillRule="evenodd"
                                clipRule="evenodd"
                                vectorEffect="non-scaling-stroke"
                            />
                        ))
                    })}

                    {missingLines.map((line) => {
                        const startStar = starsById.get(line.startStarId)
                        const endStar = starsById.get(line.endStarId)

                        if (!startStar || !endStar) {
                            return null
                        }

                        return (
                            <line
                                key={`missing-${line.id}`}
                                x1={startStar.x}
                                y1={startStar.y}
                                x2={endStar.x}
                                y2={endStar.y}
                                className="sky-chart-constellation-line sky-chart-constellation-line--missing"
                                vectorEffect="non-scaling-stroke"
                            />
                        )
                    })}

                    {lines.map((line) => {
                        const startStar = starsById.get(line.startStarId)
                        const endStar = starsById.get(line.endStarId)

                        if (!startStar || !endStar) {
                            return null
                        }

                        const lineClassName = [
                            'sky-chart-constellation-line',
                            !linesActive
                                ? 'sky-chart-constellation-line--inactive'
                                : '',
                            correctLineIds?.has(line.id)
                                ? 'sky-chart-constellation-line--correct'
                                : '',
                            extraLineIds?.has(line.id)
                                ? 'sky-chart-constellation-line--extra'
                                : '',
                        ].filter(Boolean).join(' ')

                        return (
                            <line
                                key={line.id}
                                x1={startStar.x}
                                y1={startStar.y}
                                x2={endStar.x}
                                y2={endStar.y}
                                className={lineClassName}
                                vectorEffect="non-scaling-stroke"
                            />
                        )
                    })}

                    {stars.map((star) => (
                        <circle
                            key={star.id}
                            cx={star.x}
                            cy={star.y}
                            r={star.radius}
                            fill="#000000"
                        />
                    ))}

                    {selectedStar && (
                        <circle
                            cx={selectedStar.x}
                            cy={selectedStar.y}
                            r={Math.max(selectedStar.radius + 7, 10)}
                            className="sky-chart-selected-star"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {markers.map((marker) => (
                        <g
                            key={marker.id}
                            className={[
                                'sky-chart-answer-marker',
                                marker.active === false
                                    ? 'sky-chart-answer-marker--inactive'
                                    : '',
                            ].filter(Boolean).join(' ')}
                            transform={`translate(${marker.x} ${marker.y})`}
                        >
                            {marker.shape === 'cross' && (
                                <>
                                    <line
                                        x1="-8"
                                        y1="-8"
                                        x2="8"
                                        y2="8"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    <line
                                        x1="-8"
                                        y1="8"
                                        x2="8"
                                        y2="-8"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </>
                            )}

                            {marker.shape === 'triangle' && (
                                <path
                                    d="M 0 -10 L 9 7 L -9 7 Z"
                                    vectorEffect="non-scaling-stroke"
                                />
                            )}

                            {marker.shape === 'dot' && (
                                <circle
                                    r="5"
                                    vectorEffect="non-scaling-stroke"
                                />
                            )}

                            {marker.label && (
                                <text
                                    x="13"
                                    y="-11"
                                    className="sky-chart-answer-marker-label"
                                >
                                    {marker.label}
                                </text>
                            )}

                            {marker.secondaryLabel && (
                                <text
                                    x="13"
                                    y="9"
                                    className="sky-chart-answer-marker-secondary-label"
                                >
                                    {marker.secondaryLabel}
                                </text>
                            )}
                        </g>
                    ))}
                </g>

                <circle
                    cx="500"
                    cy="500"
                    r="472"
                    fill="none"
                    stroke="#111111"
                    strokeWidth="2.2"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        </div>
    )
}

export default SkyChartSvg
