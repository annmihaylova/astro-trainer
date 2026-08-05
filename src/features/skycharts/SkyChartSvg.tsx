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
    ProjectedStar,
    SkyChartLine,
} from './types'

const VIEWPORT_SIZE = 1000
const MIN_VIEWBOX_SIZE = 125
const CLICK_MOVEMENT_LIMIT_PX = 6
const STAR_HIT_RADIUS_PX = 13

export type SkyChartSvgProps = {
    stars: readonly ProjectedStar[]
    lines: readonly SkyChartLine[]
    selectedStarId: string | null
    onStarSelect: (star: ProjectedStar) => void
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

function SkyChartSvg({
    stars,
    lines,
    selectedStarId,
    onStarSelect,
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

        for (const star of stars) {
            const deltaX = pointer.x - star.x
            const deltaY = pointer.y - star.y
            const distanceSquared = deltaX ** 2 + deltaY ** 2
            const allowedDistance = Math.max(
                hitRadius,
                star.radius + hitRadius * 0.35,
            )

            if (
                distanceSquared <= allowedDistance ** 2
                && distanceSquared < nearestDistanceSquared
            ) {
                nearestStar = star
                nearestDistanceSquared = distanceSquared
            }
        }

        if (nearestStar) {
            onStarSelect(nearestStar)
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
            selectNearestStar(event)
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

                    {lines.map((line) => {
                        const startStar = starsById.get(line.startStarId)
                        const endStar = starsById.get(line.endStarId)

                        if (!startStar || !endStar) {
                            return null
                        }

                        return (
                            <line
                                key={line.id}
                                x1={startStar.x}
                                y1={startStar.y}
                                x2={endStar.x}
                                y2={endStar.y}
                                className="sky-chart-constellation-line"
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
