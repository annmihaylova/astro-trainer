import './skycharts.css'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import SkyChartSvg from '../../features/skycharts/SkyChartSvg'
import { projectVisibleHemisphere } from '../../features/skycharts/astronomy'
import type {
    CatalogStar,
    SkyChartParameters,
} from '../../features/skycharts/types'

const DEFAULT_PARAMETERS: SkyChartParameters = {
    latitudeDeg: 55.75,
    siderealTimeHours: 12,
    limitingMagnitude: 6.5,
}

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value))
}

function normalizeParameters(
    parameters: SkyChartParameters,
): SkyChartParameters {
    return {
        latitudeDeg: clamp(parameters.latitudeDeg, -90, 90),
        siderealTimeHours: (
            (parameters.siderealTimeHours % 24) + 24
        ) % 24,
        limitingMagnitude: clamp(
            parameters.limitingMagnitude,
            -2,
            8,
        ),
    }
}

function randomParameters(): SkyChartParameters {
    return {
        latitudeDeg: Math.round(
            (Math.random() * 140 - 70) * 10,
        ) / 10,
        siderealTimeHours: Math.floor(
            Math.random() * 240,
        ) / 10,
        limitingMagnitude: 6.5,
    }
}

function SkyChartsPage() {
    const [catalog, setCatalog] = useState<readonly CatalogStar[]>([])
    const [catalogError, setCatalogError] = useState<string | null>(null)
    const [draftParameters, setDraftParameters] = (
        useState<SkyChartParameters>(DEFAULT_PARAMETERS)
    )
    const [chartParameters, setChartParameters] = (
        useState<SkyChartParameters>(DEFAULT_PARAMETERS)
    )

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
                if (error instanceof DOMException && error.name === 'AbortError') {
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
        () => projectVisibleHemisphere(
            catalog,
            chartParameters,
        ),
        [catalog, chartParameters],
    )

    function generateFromCurrentParameters() {
        const normalized = normalizeParameters(draftParameters)
        setDraftParameters(normalized)
        setChartParameters(normalized)
    }

    function generateRandomChart() {
        const generatedParameters = randomParameters()
        setDraftParameters(generatedParameters)
        setChartParameters(generatedParameters)
    }

    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <h2>Скайчарты</h2>
            </div>

            <div className="skychart-workspace">
                <aside className="skychart-controls">
                    <h3>Параметры карты</h3>

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
                                latitudeDeg: Number(event.target.value),
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
                                siderealTimeHours: Number(event.target.value),
                            })}
                        />
                    </label>

                    <label className="skychart-field">
                        <span>Предельная звёздная величина</span>
                        <input
                            type="number"
                            min="-2"
                            max="8"
                            step="0.1"
                            value={draftParameters.limitingMagnitude}
                            onChange={(event) => setDraftParameters({
                                ...draftParameters,
                                limitingMagnitude: Number(event.target.value),
                            })}
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

                    <div className="skychart-current-values">
                        <span>
                            Широта
                            <strong>{chartParameters.latitudeDeg.toFixed(1)}°</strong>
                        </span>
                        <span>
                            Звёздное время
                            <strong>
                                {chartParameters.siderealTimeHours.toFixed(1)} ч
                            </strong>
                        </span>
                        <span>
                            Звёзд на карте
                            <strong>{projectedStars.length}</strong>
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
                            <SkyChartSvg stars={projectedStars} />
                            <p className="skychart-hint">
                                Север сверху, восток слева. Колёсико мыши — масштаб,
                                перетаскивание — перемещение по приближённой карте.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export default SkyChartsPage
