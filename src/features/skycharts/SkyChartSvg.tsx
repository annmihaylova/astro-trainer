import {
    useEffect,
    useId,
    useRef,
    useState,
} from 'react'
import type {
    PointerEvent as ReactPointerEvent,
} from 'react'
import type { ProjectedStar } from './types'

const VIEWPORT_SIZE = 1000
const MIN_VIEWBOX_SIZE = 125

export type SkyChartSvgProps = {
    stars: readonly ProjectedStar[]
}

type ViewBox = {
    x: number
    y: number
    width: number
    height: number
}

type DragState = {
    pointerId: number
    startClientX: number
    startClientY: number
    startViewBox: ViewBox
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

function SkyChartSvg({ stars }: SkyChartSvgProps) {
    const svgRef = useRef<SVGSVGElement | null>(null)
    const dragStateRef = useRef<DragState | null>(null)
    const viewBoxRef = useRef<ViewBox>(INITIAL_VIEWBOX)
    const [viewBox, setViewBox] = useState<ViewBox>(INITIAL_VIEWBOX)
    const clipPathId = `sky-chart-${useId().replaceAll(':', '')}`
    const isZoomed = viewBox.width < VIEWPORT_SIZE

    function applyViewBox(nextViewBox: ViewBox) {
        const clampedViewBox = clampViewBox(nextViewBox)
        viewBoxRef.current = clampedViewBox
        setViewBox(clampedViewBox)
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
        const svgElement = svgRef.current

        if (!svgElement) {
            return
        }

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault()

            const bounds = svgElement.getBoundingClientRect()
            const currentViewBox = viewBoxRef.current
            const pointerX = (
                currentViewBox.x
                + (event.clientX - bounds.left)
                / bounds.width
                * currentViewBox.width
            )
            const pointerY = (
                currentViewBox.y
                + (event.clientY - bounds.top)
                / bounds.height
                * currentViewBox.height
            )
            const scaleFactor = event.deltaY < 0 ? 0.82 : 1.22
            const nextViewBox = calculateZoomedViewBox(
                currentViewBox,
                pointerX,
                pointerY,
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

    function handlePointerDown(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        if (
            event.pointerType === 'touch'
            || event.button !== 0
            || !isZoomed
        ) {
            return
        }

        event.currentTarget.setPointerCapture(event.pointerId)
        dragStateRef.current = {
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startViewBox: viewBoxRef.current,
        }
    }

    function handlePointerMove(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        const dragState = dragStateRef.current
        const svg = svgRef.current

        if (
            !dragState
            || dragState.pointerId !== event.pointerId
            || !svg
        ) {
            return
        }

        const bounds = svg.getBoundingClientRect()
        const deltaX = (
            event.clientX - dragState.startClientX
        ) * dragState.startViewBox.width / bounds.width
        const deltaY = (
            event.clientY - dragState.startClientY
        ) * dragState.startViewBox.height / bounds.height

        applyViewBox({
            ...dragState.startViewBox,
            x: dragState.startViewBox.x - deltaX,
            y: dragState.startViewBox.y - deltaY,
        })
    }

    function finishPointerDrag(
        event: ReactPointerEvent<SVGSVGElement>,
    ) {
        if (dragStateRef.current?.pointerId !== event.pointerId) {
            return
        }

        dragStateRef.current = null

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
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

    function resetViewBox() {
        viewBoxRef.current = INITIAL_VIEWBOX
        setViewBox(INITIAL_VIEWBOX)
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
                aria-label="Карта видимой полусферы"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishPointerDrag}
                onPointerCancel={finishPointerDrag}
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

                    {stars.map((star) => (
                        <circle
                            key={star.id}
                            cx={star.x}
                            cy={star.y}
                            r={star.radius}
                            fill="#000000"
                        />
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
