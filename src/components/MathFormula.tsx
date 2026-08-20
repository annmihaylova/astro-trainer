import {
    useEffect,
    useRef,
} from 'react'


type MathJaxConversionOptions = {
    display?: boolean
    containerWidth?: number
}


type MathJaxRuntime = {
    tex2chtmlPromise?: (
        math: string,
        options?: MathJaxConversionOptions,
    ) => Promise<HTMLElement>

    startup?: {
        typeset?: boolean
    }

    options?: {
        enableMenu?: boolean
    }
}


declare global {
    interface Window {
        MathJax?: MathJaxRuntime
    }
}


type MathFormulaProps = {
    tex: string
    className?: string
}


const MATHJAX_SCRIPT_ID =
    'astro-trainer-mathjax'

const MATHJAX_FALLBACK_URL =
    'https://unpkg.com/mathjax@4/tex-chtml.js'

let mathJaxPromise:
    Promise<MathJaxRuntime> | null = null


function isMathJaxReady(): boolean {
    return (
        typeof window.MathJax
            ?.tex2chtmlPromise
        === 'function'
    )
}


function createMathJaxConfig(): MathJaxRuntime {
    return {
        startup: {
            typeset: false,
        },
        options: {
            enableMenu: false,
        },
    }
}


function waitForMathJax(
    timeoutMs: number,
): Promise<MathJaxRuntime> {
    return new Promise((resolve, reject) => {
        const startedAt = Date.now()

        const check = () => {
            if (isMathJaxReady()) {
                resolve(window.MathJax as MathJaxRuntime)
                return
            }

            if (
                Date.now() - startedAt
                >= timeoutMs
            ) {
                reject(
                    new Error(
                        'MathJax did not initialise.',
                    ),
                )
                return
            }

            window.setTimeout(
                check,
                50,
            )
        }

        check()
    })
}


function loadFallbackMathJax():
    Promise<MathJaxRuntime> {
    return new Promise((resolve, reject) => {
        document.getElementById(
            MATHJAX_SCRIPT_ID,
        )?.remove()

        window.MathJax =
            createMathJaxConfig()

        const script =
            document.createElement('script')

        script.id =
            MATHJAX_SCRIPT_ID

        script.src =
            MATHJAX_FALLBACK_URL

        script.async = true

        script.addEventListener(
            'load',
            () => {
                void waitForMathJax(12_000)
                    .then(resolve)
                    .catch(reject)
            },
            { once: true },
        )

        script.addEventListener(
            'error',
            () => {
                reject(
                    new Error(
                        'MathJax could not be loaded.',
                    ),
                )
            },
            { once: true },
        )

        document.head.appendChild(script)
    })
}


function ensureMathJax():
    Promise<MathJaxRuntime> {
    if (
        typeof window === 'undefined'
    ) {
        return Promise.reject(
            new Error('Browser is unavailable.'),
        )
    }

    if (isMathJaxReady()) {
        return Promise.resolve(
            window.MathJax as MathJaxRuntime,
        )
    }

    if (mathJaxPromise) {
        return mathJaxPromise
    }

    mathJaxPromise = (
        async () => {
            /*
             * index.html заранее загружает MathJax через jsDelivr.
             * Сначала даём этому скрипту время завершить startup.
             */
            try {
                return await waitForMathJax(
                    8_000,
                )
            } catch {
                /*
                 * Если jsDelivr недоступен в конкретной сети,
                 * автоматически пробуем второй CDN.
                 */
                return loadFallbackMathJax()
            }
        }
    )()

    return mathJaxPromise
}


function MathFormula({
    tex,
    className = '',
}: MathFormulaProps) {
    const rootRef =
        useRef<HTMLDivElement | null>(null)


    useEffect(() => {
        const currentElement = rootRef.current

        if (currentElement === null) {
            return
        }

        const element: HTMLDivElement =
            currentElement

        let cancelled = false
        let hasStarted = false

        element.classList.remove(
            'math-formula--ready',
            'math-formula--error',
        )

        element.replaceChildren()


        async function renderFormula() {
            if (
                cancelled
                || hasStarted
            ) {
                return
            }

            hasStarted = true

            try {
                const mathJax =
                    await ensureMathJax()

                if (cancelled) {
                    return
                }

                const convert =
                    mathJax.tex2chtmlPromise

                if (!convert) {
                    throw new Error(
                        'MathJax TeX converter is unavailable.',
                    )
                }

                const rendered =
                    await convert(
                        tex,
                        {
                            display: true,
                            containerWidth:
                                Math.max(
                                    element.clientWidth,
                                    320,
                                ),
                        },
                    )

                if (cancelled) {
                    return
                }

                element.replaceChildren(
                    rendered,
                )

                element.classList.add(
                    'math-formula--ready',
                )
            } catch {
                if (cancelled) {
                    return
                }

                /*
                 * TeX показываем только как аварийный fallback.
                 * В нормальном состоянии пользователь видит CHTML.
                 */
                element.textContent = tex

                element.classList.add(
                    'math-formula--error',
                )
            }
        }


        if (
            typeof IntersectionObserver
            === 'undefined'
        ) {
            void renderFormula()

            return () => {
                cancelled = true
            }
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    if (
                        entries.some(
                            (entry) =>
                                entry.isIntersecting,
                        )
                    ) {
                        observer.disconnect()
                        void renderFormula()
                    }
                },
                {
                    rootMargin:
                        '700px 0px',
                },
            )

        observer.observe(element)

        return () => {
            cancelled = true
            observer.disconnect()
        }
    }, [tex])


    return (
        <div
            aria-label={tex}
            className={
                'math-formula '
                + className
            }
            ref={rootRef}
        />
    )
}


export default MathFormula
