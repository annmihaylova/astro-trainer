import {
    useEffect,
    useRef,
} from 'react'


type MathJaxRuntime = {
    typesetPromise?: (
        elements?: HTMLElement[],
    ) => Promise<void>

    typesetClear?: (
        elements?: HTMLElement[],
    ) => void

    tex?: unknown
    startup?: unknown
    options?: unknown
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

const MATHJAX_URL =
    'https://cdn.jsdelivr.net/npm/mathjax@4.0.0/tex-mml-chtml.js'

let mathJaxPromise:
    Promise<void> | null = null


function waitForMathJax(): Promise<void> {
    return new Promise((resolve, reject) => {
        const startedAt = Date.now()

        const check = () => {
            if (
                typeof window.MathJax
                    ?.typesetPromise
                === 'function'
            ) {
                resolve()
                return
            }

            if (
                Date.now() - startedAt
                > 15_000
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
                40,
            )
        }

        check()
    })
}


function loadMathJax(): Promise<void> {
    if (
        typeof window === 'undefined'
    ) {
        return Promise.resolve()
    }

    if (
        typeof window.MathJax
            ?.typesetPromise
        === 'function'
    ) {
        return Promise.resolve()
    }

    if (mathJaxPromise) {
        return mathJaxPromise
    }

    mathJaxPromise =
        new Promise((resolve, reject) => {
            const existingScript =
                document.getElementById(
                    MATHJAX_SCRIPT_ID,
                ) as HTMLScriptElement | null

            if (existingScript) {
                void waitForMathJax()
                    .then(resolve)
                    .catch(reject)

                return
            }

            window.MathJax = {
                tex: {
                    inlineMath: [
                        ['\\(', '\\)'],
                    ],
                    displayMath: [
                        ['\\[', '\\]'],
                    ],
                },
                startup: {
                    typeset: false,
                },
            }

            const script =
                document.createElement(
                    'script',
                )

            script.id =
                MATHJAX_SCRIPT_ID

            script.src =
                MATHJAX_URL

            script.async = true

            script.addEventListener(
                'load',
                () => {
                    void waitForMathJax()
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

            document.head.appendChild(
                script,
            )
        })

    return mathJaxPromise
}


function MathFormula({
    tex,
    className = '',
}: MathFormulaProps) {
    const rootRef =
        useRef<HTMLDivElement | null>(null)


    useEffect(() => {
        const element = rootRef.current

        if (!element) {
            return
        }

        let cancelled = false

        element.classList.remove(
            'math-formula--ready',
            'math-formula--error',
        )

        element.textContent =
            `\\[\\displaystyle ${tex}\\]`

        void loadMathJax()
            .then(async () => {
                if (cancelled) {
                    return
                }

                window.MathJax
                    ?.typesetClear
                    ?.([element])

                await window.MathJax
                    ?.typesetPromise
                    ?.([element])

                if (!cancelled) {
                    element.classList.add(
                        'math-formula--ready',
                    )
                }
            })
            .catch(() => {
                if (!cancelled) {
                    element.classList.add(
                        'math-formula--error',
                    )
                }
            })

        return () => {
            cancelled = true

            window.MathJax
                ?.typesetClear
                ?.([element])
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
