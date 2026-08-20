import {
    useMemo,
    useRef,
    useState,
} from 'react'
import type {
    PointerEvent as ReactPointerEvent,
    MouseEvent as ReactMouseEvent,
    KeyboardEvent as ReactKeyboardEvent,
    CSSProperties,
} from 'react'

import {
    blitzFormulaCategories,
    blitzFormulas,
} from '../data/blitzFormulas'
import MathFormula from './MathFormula'
import './BlitzFormulaTrainer.css'


type StoredDeckState = {
    queue: string[]
    mastered: string[]
    categories: string[]
}


type GestureAxis =
    | 'pending'
    | 'horizontal'


type ActiveGesture = {
    pointerId: number
    startX: number
    startY: number
    currentX: number
    currentY: number
    axis: GestureAxis
}


const STORAGE_KEY =
    'astro-trainer:blitz-formulas:v2'

const SWIPE_THRESHOLD = 72
const GESTURE_LOCK_THRESHOLD = 10
const WRONG_CARD_GAP = 4


function shuffle<T>(items: readonly T[]): T[] {
    const result = [...items]

    for (
        let i = result.length - 1;
        i > 0;
        i -= 1
    ) {
        const j = Math.floor(
            Math.random() * (i + 1),
        )

        ;[
            result[i],
            result[j],
        ] = [
            result[j],
            result[i],
        ]
    }

    return result
}


function getFormulaIdsForCategories(
    categories: readonly string[],
): string[] {
    const categorySet =
        new Set(categories)

    return blitzFormulas
        .filter(
            (formula) =>
                categorySet.has(
                    formula.category,
                ),
        )
        .map(
            (formula) => formula.id,
        )
}


function createInitialState(
    categories:
        readonly string[] =
            blitzFormulaCategories,
): StoredDeckState {
    const normalizedCategories =
        blitzFormulaCategories.filter(
            (category) =>
                categories.includes(
                    category,
                ),
        )

    const activeCategories =
        normalizedCategories.length > 0
            ? normalizedCategories
            : [...blitzFormulaCategories]

    return {
        queue: shuffle(
            getFormulaIdsForCategories(
                activeCategories,
            ),
        ),
        mastered: [],
        categories: activeCategories,
    }
}


function loadState(): StoredDeckState {
    if (typeof window === 'undefined') {
        return createInitialState()
    }

    const validCategorySet =
        new Set(blitzFormulaCategories)

    const validIdSet =
        new Set(
            blitzFormulas.map(
                (formula) => formula.id,
            ),
        )

    try {
        const raw =
            window.localStorage.getItem(
                STORAGE_KEY,
            )

        if (!raw) {
            return createInitialState()
        }

        const parsed =
            JSON.parse(raw) as Partial<StoredDeckState>

        const parsedCategories = [
            ...new Set(
                (parsed.categories ?? [])
                    .filter(
                        (category): category is string =>
                            typeof category === 'string'
                            && validCategorySet.has(
                                category,
                            ),
                    ),
            ),
        ]

        const categories =
            parsedCategories.length > 0
                ? blitzFormulaCategories.filter(
                    (category) =>
                        parsedCategories.includes(
                            category,
                        ),
                )
                : [...blitzFormulaCategories]

        const activeIdSet =
            new Set(
                getFormulaIdsForCategories(
                    categories,
                ),
            )

        const mastered = [
            ...new Set(
                (parsed.mastered ?? [])
                    .filter(
                        (id): id is string =>
                            typeof id === 'string'
                            && validIdSet.has(id)
                            && activeIdSet.has(id),
                    ),
            ),
        ]

        const masteredSet =
            new Set(mastered)

        const queue = [
            ...new Set(
                (parsed.queue ?? [])
                    .filter(
                        (id): id is string =>
                            typeof id === 'string'
                            && validIdSet.has(id)
                            && activeIdSet.has(id)
                            && !masteredSet.has(id),
                    ),
            ),
        ]

        const alreadyPresent =
            new Set([
                ...mastered,
                ...queue,
            ])

        const newlyAdded =
            getFormulaIdsForCategories(
                categories,
            )
                .filter(
                    (id) =>
                        !alreadyPresent.has(id),
                )

        return {
            categories,
            mastered,
            queue: [
                ...queue,
                ...shuffle(newlyAdded),
            ],
        }
    } catch {
        return createInitialState()
    }
}


function persistState(
    state: StoredDeckState,
) {
    try {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state),
        )
    } catch {
        // Карточки продолжают работать и без localStorage.
    }
}


function isInteractiveTarget(
    target: EventTarget,
): boolean {
    return (
        target instanceof Element
        && Boolean(
            target.closest(
                'button, a, input, select, textarea',
            ),
        )
    )
}


function BlitzFormulaTrainer() {
    const [state, setState] =
        useState<StoredDeckState>(
            loadState,
        )

    const [
        selectedCategories,
        setSelectedCategories,
    ] = useState<string[]>(
        () => [...loadState().categories],
    )

    const [isAnswerVisible, setIsAnswerVisible] =
        useState(false)

    const [swipeX, setSwipeX] =
        useState(0)

    const [isDragging, setIsDragging] =
        useState(false)

    const activeGesture =
        useRef<ActiveGesture | null>(null)

    const formulasById =
        useMemo(
            () => new Map(
                blitzFormulas.map(
                    (formula) => [
                        formula.id,
                        formula,
                    ]),
            ),
            [],
        )

    const categoryCounts =
        useMemo(
            () => new Map(
                blitzFormulaCategories.map(
                    (category) => [
                        category,
                        blitzFormulas.filter(
                            (formula) =>
                                formula.category
                                === category,
                        ).length,
                    ]),
            ),
            [],
        )

    const currentFormula =
        state.queue.length > 0
            ? formulasById.get(
                  state.queue[0],
              ) ?? null
            : null

    const activeFormulaCount =
        getFormulaIdsForCategories(
            state.categories,
        ).length

    const selectedFormulaCount =
        getFormulaIdsForCategories(
            selectedCategories,
        ).length

    const allCategoriesSelected =
        selectedCategories.length
        === blitzFormulaCategories.length


    function commitState(
        nextState: StoredDeckState,
    ) {
        setState(nextState)
        persistState(nextState)
        setIsAnswerVisible(false)
        setSwipeX(0)
        setIsDragging(false)
    }


    function answerCurrent(
        knowsFormula: boolean,
    ) {
        if (!currentFormula) {
            return
        }

        const remaining =
            state.queue.slice(1)

        if (knowsFormula) {
            commitState({
                ...state,
                queue: remaining,
                mastered: [
                    ...state.mastered,
                    currentFormula.id,
                ],
            })

            return
        }

        const insertionIndex =
            Math.min(
                WRONG_CARD_GAP,
                remaining.length,
            )

        remaining.splice(
            insertionIndex,
            0,
            currentFormula.id,
        )

        commitState({
            ...state,
            queue: remaining,
        })
    }


    function reshuffleRemaining() {
        commitState({
            ...state,
            queue: shuffle(state.queue),
        })
    }


    function restartDeck() {
        commitState(
            createInitialState(
                state.categories,
            ),
        )
    }


    function startSelectedDeck() {
        if (
            selectedCategories.length === 0
        ) {
            return
        }

        commitState(
            createInitialState(
                selectedCategories,
            ),
        )
    }


    function toggleSelectedCategory(
        category: string,
    ) {
        setSelectedCategories(
            (current) =>
                current.includes(category)
                    ? current.filter(
                        (item) =>
                            item !== category,
                    )
                    : [
                        ...current,
                        category,
                    ],
        )
    }


    function handleCardClick(
        event: ReactMouseEvent<HTMLElement>,
    ) {
        if (
            isAnswerVisible
            || isInteractiveTarget(
                event.target,
            )
        ) {
            return
        }

        setIsAnswerVisible(true)
    }


    function handleCardKeyDown(
        event: ReactKeyboardEvent<HTMLElement>,
    ) {
        if (
            event.altKey
            || event.ctrlKey
            || event.metaKey
            || event.repeat
            || isInteractiveTarget(
                event.target,
            )
        ) {
            return
        }

        if (
            !isAnswerVisible
            && (
                event.code === 'Space'
                || event.code === 'Enter'
            )
        ) {
            event.preventDefault()
            setIsAnswerVisible(true)
            return
        }

        if (
            isAnswerVisible
            && event.code === 'ArrowLeft'
        ) {
            event.preventDefault()
            answerCurrent(false)
            return
        }

        if (
            isAnswerVisible
            && event.code === 'ArrowRight'
        ) {
            event.preventDefault()
            answerCurrent(true)
        }
    }


    function handlePointerDown(
        event: ReactPointerEvent<HTMLElement>,
    ) {
        if (
            event.pointerType === 'mouse'
            || isInteractiveTarget(
                event.target,
            )
        ) {
            return
        }

        activeGesture.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            currentX: event.clientX,
            currentY: event.clientY,
            axis: 'pending',
        }
    }


    function handlePointerMove(
        event: ReactPointerEvent<HTMLElement>,
    ) {
        const gesture =
            activeGesture.current

        if (
            !gesture
            || gesture.pointerId
                !== event.pointerId
        ) {
            return
        }

        gesture.currentX = event.clientX
        gesture.currentY = event.clientY

        const dx =
            event.clientX - gesture.startX

        const dy =
            event.clientY - gesture.startY

        if (gesture.axis === 'pending') {
            if (
                Math.max(
                    Math.abs(dx),
                    Math.abs(dy),
                ) < GESTURE_LOCK_THRESHOLD
            ) {
                return
            }

            if (
                Math.abs(dy)
                >= Math.abs(dx)
            ) {
                activeGesture.current = null
                return
            }

            if (!isAnswerVisible) {
                activeGesture.current = null
                return
            }

            gesture.axis = 'horizontal'
            setIsDragging(true)

            try {
                event.currentTarget
                    .setPointerCapture(
                        event.pointerId,
                    )
            } catch {
                // Pointer capture не обязателен.
            }
        }

        if (
            gesture.axis !== 'horizontal'
        ) {
            return
        }

        event.preventDefault()

        const maxSwipe =
            Math.min(
                event.currentTarget
                    .offsetWidth * 0.42,
                210,
            )

        setSwipeX(
            Math.max(
                -maxSwipe,
                Math.min(
                    maxSwipe,
                    dx,
                ),
            ),
        )
    }


    function finishPointer(
        event: ReactPointerEvent<HTMLElement>,
        cancelled: boolean,
    ) {
        const gesture =
            activeGesture.current

        if (
            !gesture
            || gesture.pointerId
                !== event.pointerId
        ) {
            return
        }

        activeGesture.current = null

        try {
            if (
                event.currentTarget
                    .hasPointerCapture(
                        event.pointerId,
                    )
            ) {
                event.currentTarget
                    .releasePointerCapture(
                        event.pointerId,
                    )
            }
        } catch {
            // Захват мог завершиться сам.
        }

        const dx =
            gesture.currentX
            - gesture.startX

        const dy =
            gesture.currentY
            - gesture.startY

        const shouldCommit =
            !cancelled
            && gesture.axis === 'horizontal'
            && Math.abs(dx)
                >= SWIPE_THRESHOLD
            && Math.abs(dx)
                > Math.abs(dy) * 1.2

        setSwipeX(0)
        setIsDragging(false)

        if (shouldCommit) {
            answerCurrent(dx > 0)
        }
    }


    const categoryPicker = (
        <section className="blitz-deck-picker">
            <div className="blitz-deck-picker-header">
                <div>
                    <p className="blitz-card-kicker">
                        Выбор колоды
                    </p>

                    <h3>
                        Какие разделы учить?
                    </h3>
                </div>

                <div className="blitz-deck-picker-meta">
                    <strong>
                        {selectedFormulaCount}
                    </strong>
                    <span>карточек выбрано</span>
                </div>
            </div>

            <div className="blitz-deck-picker-actions">
                <button
                    className={
                        allCategoriesSelected
                            ? (
                                'blitz-filter-control '
                                + 'blitz-filter-control--active'
                            )
                            : 'blitz-filter-control'
                    }
                    onClick={() => {
                        setSelectedCategories(
                            [...blitzFormulaCategories],
                        )
                    }}
                    type="button"
                >
                    Все разделы
                </button>

                <button
                    className="blitz-filter-control"
                    onClick={() => {
                        setSelectedCategories([])
                    }}
                    type="button"
                >
                    Снять всё
                </button>
            </div>

            <div
                aria-label="Разделы формул"
                className="blitz-category-options"
                role="group"
            >
                {blitzFormulaCategories.map(
                    (category) => {
                        const selected =
                            selectedCategories.includes(
                                category,
                            )

                        return (
                            <button
                                aria-pressed={selected}
                                className={
                                    selected
                                        ? (
                                            'blitz-category-option '
                                            + 'blitz-category-option--active'
                                        )
                                        : 'blitz-category-option'
                                }
                                key={category}
                                onClick={() => {
                                    toggleSelectedCategory(
                                        category,
                                    )
                                }}
                                type="button"
                            >
                                <span>
                                    {category}
                                </span>

                                <strong>
                                    {
                                        categoryCounts.get(
                                            category,
                                        ) ?? 0
                                    }
                                </strong>
                            </button>
                        )
                    },
                )}
            </div>

            <button
                className="blitz-button blitz-button--primary blitz-start-selection"
                disabled={
                    selectedCategories.length === 0
                }
                onClick={startSelectedDeck}
                type="button"
            >
                Начать выбранную колоду
            </button>
        </section>
    )


    if (!currentFormula) {
        return (
            <section className="blitz-trainer">
                {categoryPicker}

                <div className="blitz-complete">
                    <p className="blitz-card-kicker">
                        Проход завершён
                    </p>

                    <h2>
                        Выбранная колода пройдена
                    </h2>

                    <p>
                        Все
                        {' '}
                        {activeFormulaCount}
                        {' '}
                        карточки выбранных разделов
                        отмечены как известные.
                    </p>

                    <button
                        className="blitz-button blitz-button--primary"
                        onClick={restartDeck}
                        type="button"
                    >
                        Начать заново
                    </button>
                </div>
            </section>
        )
    }


    const swipeClass =
        swipeX < -16
            ? ' blitz-swipe-left'
            : swipeX > 16
                ? ' blitz-swipe-right'
                : ''


    return (
        <section className="blitz-trainer">
            {categoryPicker}

            <div className="blitz-toolbar">
                <div className="blitz-stat">
                    <span>Осталось</span>
                    <strong>
                        {state.queue.length}
                    </strong>
                </div>

                <div className="blitz-stat">
                    <span>Знаю</span>
                    <strong>
                        {state.mastered.length}
                    </strong>
                </div>

                <div className="blitz-stat">
                    <span>В колоде</span>
                    <strong>
                        {activeFormulaCount}
                    </strong>
                </div>

                <div className="blitz-toolbar-actions">
                    <button
                        onClick={
                            reshuffleRemaining
                        }
                        type="button"
                    >
                        Перемешать
                    </button>

                    <button
                        onClick={restartDeck}
                        type="button"
                    >
                        Начать заново
                    </button>
                </div>
            </div>

            <p className="blitz-instructions">
                Клик или пробел — показать формулу.
                На обратной стороне: ← не знаю,
                → знаю. На телефоне можно свайпать.
            </p>

            <article
                aria-label={
                    isAnswerVisible
                        ? 'Формула и ответ'
                        : 'Показать формулу'
                }
                className={
                    'blitz-study-card'
                    + swipeClass
                    + (
                        isDragging
                            ? ' blitz-is-dragging'
                            : ''
                    )
                }
                onClick={handleCardClick}
                onKeyDown={handleCardKeyDown}
                onPointerCancel={(event) => {
                    finishPointer(
                        event,
                        true,
                    )
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={(event) => {
                    finishPointer(
                        event,
                        false,
                    )
                }}
                style={{
                    '--blitz-swipe-x':
                        `${swipeX}px`,
                    '--blitz-swipe-rotation':
                        `${swipeX / 30}deg`,
                } as CSSProperties}
                tabIndex={0}
            >
                {!isAnswerVisible ? (
                    <div className="blitz-question">
                        <p className="blitz-card-kicker">
                            {currentFormula.category}
                        </p>

                        <h2>
                            {currentFormula.title}
                        </h2>

                        <p className="blitz-question-hint">
                            Вспомни формулу и условия,
                            при которых её можно применять.
                        </p>

                        <button
                            className="blitz-button blitz-button--primary"
                            onClick={() => {
                                setIsAnswerVisible(true)
                            }}
                            type="button"
                        >
                            Показать формулу
                        </button>
                    </div>
                ) : (
                    <div className="blitz-answer">
                        <header className="blitz-answer-header">
                            <p className="blitz-card-kicker">
                                {currentFormula.category}
                            </p>

                            <h2>
                                {currentFormula.title}
                            </h2>
                        </header>

                        <div className="blitz-formula-list">
                            {currentFormula.formulas.map(
                                (formula, index) => (
                                    <div
                                        className="blitz-formula-panel"
                                        key={
                                            currentFormula.id
                                            + '-'
                                            + index
                                        }
                                    >
                                        {formula.label ? (
                                            <p className="blitz-formula-label">
                                                {formula.label}
                                            </p>
                                        ) : null}

                                        <MathFormula
                                            tex={formula.tex}
                                        />
                                    </div>
                                ),
                            )}
                        </div>

                        {currentFormula.note ? (
                            <p className="blitz-formula-note">
                                {currentFormula.note}
                            </p>
                        ) : null}

                        {currentFormula.details ? (
                            <ul className="blitz-formula-details">
                                {currentFormula.details.map(
                                    (detail) => (
                                        <li key={detail}>
                                            {detail}
                                        </li>
                                    ),
                                )}
                            </ul>
                        ) : null}

                        <div className="blitz-answer-actions">
                            <button
                                className="blitz-button blitz-button--wrong"
                                onClick={() => {
                                    answerCurrent(false)
                                }}
                                type="button"
                            >
                                Не знаю
                            </button>

                            <button
                                className="blitz-button blitz-button--correct"
                                onClick={() => {
                                    answerCurrent(true)
                                }}
                                type="button"
                            >
                                Знаю
                            </button>
                        </div>
                    </div>
                )}
            </article>
        </section>
    )
}


export default BlitzFormulaTrainer
