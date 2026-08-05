import './skycharts.css'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import type { ChangeEvent } from 'react'
import SkyChartSvg from '../../features/skycharts/SkyChartSvg'
import { projectSkyChart } from '../../features/skycharts/astronomy'
import type {
    CatalogStar,
    EquatorialFieldParameters,
    ProjectedStar,
    SkyChartLine,
    SkyChartMode,
    SkyChartParameters,
    VisibleHemisphereParameters,
} from '../../features/skycharts/types'

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
    return inputNumber(event)
}

function buildLineId(firstStarId: string, secondStarId: string) {
    return [firstStarId, secondStarId].sort().join('--')
}

function SkyChartsPage() {
    const [catalog, setCatalog] = useState<readonly CatalogStar[]>([])
    const [catalogError, setCatalogError] = useState<string | null>(null)
    const [draftParameters, setDraftParameters] = (
        useState<SkyChartParameters>(DEFAULT_VISIBLE_PARAMETERS)
    )
    const [chartParameters, setChartParameters] = (
        useState<SkyChartParameters>(DEFAULT_VISIBLE_PARAMETERS)
    )
    const [lines, setLines] = useState<readonly SkyChartLine[]>([])
    const [selectedStarId, setSelectedStarId] = useState<string | null>(null)

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

    const projectedStars = useMemo(
        () => projectSkyChart(catalog, chartParameters),
        [catalog, chartParameters],
    )

    function resetDrawing() {
        setLines([])
        setSelectedStarId(null)
    }

    function changeMode(mode: SkyChartMode) {
        const nextParameters = mode === 'visible-hemisphere'
            ? DEFAULT_VISIBLE_PARAMETERS
            : DEFAULT_FIELD_PARAMETERS

        setDraftParameters(nextParameters)
        setChartParameters(nextParameters)
        resetDrawing()
    }

    function generateFromCurrentParameters() {
        const normalized = normalizeParameters(draftParameters)
        setDraftParameters(normalized)
        setChartParameters(normalized)
        resetDrawing()
    }

    function generateRandomChart() {
        const generatedParameters = randomParameters(draftParameters)
        setDraftParameters(generatedParameters)
        setChartParameters(generatedParameters)
        resetDrawing()
    }

    function updateLimitingMagnitude(value: number) {
        setDraftParameters((currentParameters) => ({
            ...currentParameters,
            limitingMagnitude: value,
        }))
    }

    function handleStarSelect(star: ProjectedStar) {
        if (!selectedStarId) {
            setSelectedStarId(star.id)
            return
        }

        if (selectedStarId === star.id) {
            setSelectedStarId(null)
            return
        }

        const lineId = buildLineId(selectedStarId, star.id)

        setLines((currentLines) => {
            if (currentLines.some((line) => line.id === lineId)) {
                return currentLines
            }

            return [
                ...currentLines,
                {
                    id: lineId,
                    startStarId: selectedStarId,
                    endStarId: star.id,
                },
            ]
        })
        setSelectedStarId(null)
    }

    function undoLastLine() {
        setLines((currentLines) => currentLines.slice(0, -1))
        setSelectedStarId(null)
    }

    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <h2>Скайчарты</h2>
            </div>

            <div className="skychart-workspace">
                <aside className="skychart-controls">
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
                                    onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftParameters({
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
                                    onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftParameters({
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
                                    onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftParameters({
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
                                    onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftParameters({
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
                                    onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftParameters({
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
                                    onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftParameters({
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
                            onChange={(event: ChangeEvent<HTMLInputElement>) => updateLimitingMagnitude(
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
                            Построить карту
                        </button>

                        <button
                            className="button button-secondary"
                            type="button"
                            onClick={generateRandomChart}
                        >
                            Случайная карта
                        </button>
                    </div>

                    <div className="skychart-drawing-panel">
                        <div>
                            <span className="skychart-drawing-label">
                                Линии созвездий
                            </span>
                            <strong>
                                {selectedStarId
                                    ? 'Выберите вторую звезду'
                                    : 'Выберите первую звезду'}
                            </strong>
                        </div>

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
                                onClick={resetDrawing}
                                disabled={
                                    lines.length === 0
                                    && !selectedStarId
                                }
                            >
                                Очистить
                            </button>
                        </div>
                    </div>

                    <div className="skychart-current-values">
                        {chartParameters.mode === 'visible-hemisphere' ? (
                            <>
                                <span>
                                    Широта
                                    <strong>
                                        {chartParameters.latitudeDeg.toFixed(1)}°
                                    </strong>
                                </span>
                                <span>
                                    Звёздное время
                                    <strong>
                                        {chartParameters.siderealTimeHours.toFixed(1)} ч
                                    </strong>
                                </span>
                            </>
                        ) : (
                            <>
                                <span>
                                    Центр
                                    <strong>
                                        {chartParameters.centerRaHours.toFixed(1)} ч,{' '}
                                        {chartParameters.centerDecDeg.toFixed(1)}°
                                    </strong>
                                </span>
                                <span>
                                    Диаметр
                                    <strong>
                                        {chartParameters.angularDiameterDeg.toFixed(0)}°
                                    </strong>
                                </span>
                            </>
                        )}
                        <span>
                            Звёзд на карте
                            <strong>{projectedStars.length}</strong>
                        </span>
                        <span>
                            Нарисовано линий
                            <strong>{lines.length}</strong>
                        </span>
                    </div>
                </aside>

                <div className="skychart-preview">
                    {catalogError ? (
                        <div className="skychart-message skychart-message--error">
                            {catalogError}
                        </div>
                    ) : catalog.length === 0 ? (
                        <div className="skychart-message">
                            Загружаем каталог звёзд…
                        </div>
                    ) : (
                        <>
                            <SkyChartSvg
                                stars={projectedStars}
                                lines={lines}
                                selectedStarId={selectedStarId}
                                onStarSelect={handleStarSelect}
                            />
                            <p className="skychart-hint">
                                Нажмите на две звезды, чтобы соединить их прямой линией.
                                Повторный клик по первой звезде отменяет выбор.
                                Колёсико мыши меняет масштаб, перетаскивание двигает
                                приближённую карту.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export default SkyChartsPage
