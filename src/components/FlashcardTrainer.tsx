import {
    useEffect,
    useRef,
    useState,
} from 'react'
import type { ReactNode } from 'react'

import './FlashcardTrainer.css'


type FlashcardKind =
    | 'messier'
    | 'stars'


type FlashcardTrainerProps = {
    kind: FlashcardKind
    children: ReactNode
}


type FlashcardSelectors = {
    card: string
    question: string
    answer: string
    revealButton: string
    wrongButton: string
    correctButton: string
}


type GestureAxis =
    | 'pending'
    | 'horizontal'


type ActiveGesture = {
    pointerId: number
    card: HTMLElement
    startX: number
    startY: number
    currentX: number
    currentY: number
    axis: GestureAxis
}


const SWIPE_THRESHOLD = 72
const GESTURE_LOCK_THRESHOLD = 10
const CLICK_MOVEMENT_LIMIT = 12
const SWIPE_ANIMATION_DURATION = 170


const selectorsByKind:
    Record<FlashcardKind, FlashcardSelectors> = {
        messier: {
            card: '.messier-study-card',
            question: '.messier-question',
            answer: '.messier-answer',
            revealButton:
                '.messier-question '
                + '.messier-button--primary',
            wrongButton:
                '.messier-answer-actions '
                + '.messier-button--wrong',
            correctButton:
                '.messier-answer-actions '
                + '.messier-button--correct',
        },

        stars: {
            card: '.stars-study-card',
            question: '.stars-question',
            answer: '.stars-answer',
            revealButton:
                '.stars-question '
                + '.stars-button--primary',
            wrongButton:
                '.stars-answer-actions '
                + '.stars-button--wrong',
            correctButton:
                '.stars-answer-actions '
                + '.stars-button--correct',
        },
    }


function detectTouchLayout(): boolean {
    if (
        typeof window === 'undefined'
        || typeof navigator === 'undefined'
    ) {
        return false
    }

    const compactViewport =
        window.matchMedia(
            '(max-width: 900px)',
        ).matches

    const coarsePointer =
        window.matchMedia(
            '(pointer: coarse)',
        ).matches

    return (
        coarsePointer
        || (
            compactViewport
            && navigator.maxTouchPoints > 0
        )
    )
}


function isInteractiveTarget(
    target: EventTarget | null,
): boolean {
    if (!(target instanceof Element)) {
        return false
    }

    return Boolean(
        target.closest(
            'button, a, input, textarea, '
            + 'select, [contenteditable="true"]',
        ),
    )
}


function FlashcardTrainer({
    kind,
    children,
}: FlashcardTrainerProps) {
    const rootRef =
        useRef<HTMLDivElement | null>(null)

    const [
        isTouchDevice,
        setIsTouchDevice,
    ] = useState(
        () => detectTouchLayout(),
    )

    const isTouchDeviceRef =
        useRef(isTouchDevice)


    useEffect(() => {
        isTouchDeviceRef.current =
            isTouchDevice
    }, [isTouchDevice])


    useEffect(() => {
        const compactViewport =
            window.matchMedia(
                '(max-width: 900px)',
            )

        const coarsePointer =
            window.matchMedia(
                '(pointer: coarse)',
            )

        function updateInputMode() {
            setIsTouchDevice(
                detectTouchLayout(),
            )
        }

        updateInputMode()

        compactViewport.addEventListener(
            'change',
            updateInputMode,
        )

        coarsePointer.addEventListener(
            'change',
            updateInputMode,
        )

        window.addEventListener(
            'resize',
            updateInputMode,
        )

        return () => {
            compactViewport.removeEventListener(
                'change',
                updateInputMode,
            )

            coarsePointer.removeEventListener(
                'change',
                updateInputMode,
            )

            window.removeEventListener(
                'resize',
                updateInputMode,
            )
        }
    }, [])


    useEffect(() => {
        const root = rootRef.current

        if (!root) {
            return
        }

        const rootElement = root

        const selectors =
            selectorsByKind[kind]

        let activeGesture:
            ActiveGesture | null = null

        let suppressClickUntil = 0
        let isCommittingSwipe = false
        let swipeTimer: number | null = null


        function getCard():
            HTMLElement | null {
            return rootElement.querySelector<HTMLElement>(
                selectors.card,
            )
        }


        function hasQuestion(
            card: HTMLElement,
        ): boolean {
            return Boolean(
                card.querySelector(
                    selectors.question,
                ),
            )
        }


        function hasAnswer(
            card: HTMLElement,
        ): boolean {
            return Boolean(
                card.querySelector(
                    selectors.answer,
                ),
            )
        }


        function updateCardAccessibility() {
            const card = getCard()

            if (!card) {
                return
            }

            card.tabIndex = 0
            card.setAttribute(
                'role',
                'button',
            )

            if (hasQuestion(card)) {
                card.setAttribute(
                    'aria-label',
                    'Показать ответ',
                )
            } else {
                card.setAttribute(
                    'aria-label',
                    isTouchDeviceRef.current
                        ? (
                            'Смахни влево, если не знаешь, '
                            + 'или вправо, если знаешь'
                        )
                        : (
                            'Стрелка влево — не знаю, '
                            + 'стрелка вправо — знаю'
                        ),
                )
            }
        }


        function keepCardPosition(
            topBeforeAction: number,
        ) {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    const nextCard = getCard()

                    if (!nextCard) {
                        return
                    }

                    const topAfterAction =
                        nextCard
                            .getBoundingClientRect()
                            .top

                    const pageShift =
                        topAfterAction
                        - topBeforeAction

                    if (
                        Math.abs(pageShift) > 1
                    ) {
                        window.scrollBy({
                            top: pageShift,
                            left: 0,
                            behavior: 'auto',
                        })
                    }

                    const cardRectangle =
                        nextCard
                            .getBoundingClientRect()

                    if (
                        cardRectangle.top < 8
                        || cardRectangle.bottom
                            > window.innerHeight - 8
                    ) {
                        nextCard.scrollIntoView({
                            block: 'nearest',
                            behavior: 'auto',
                        })
                    }

                    updateCardAccessibility()
                })
            })
        }


        function activateButton(
            selector: string,
        ): boolean {
            const card = getCard()

            const button =
                rootElement.querySelector<
                    HTMLButtonElement
                >(selector)

            if (
                !card
                || !button
                || button.disabled
            ) {
                return false
            }

            const topBeforeAction =
                card.getBoundingClientRect().top

            button.click()

            keepCardPosition(
                topBeforeAction,
            )

            return true
        }


        function revealAnswer(): boolean {
            const card = getCard()

            if (
                !card
                || !hasQuestion(card)
            ) {
                return false
            }

            return activateButton(
                selectors.revealButton,
            )
        }


        function answerCard(
            knowsAnswer: boolean,
        ): boolean {
            const card = getCard()

            if (
                !card
                || !hasAnswer(card)
            ) {
                return false
            }

            return activateButton(
                knowsAnswer
                    ? selectors.correctButton
                    : selectors.wrongButton,
            )
        }


        function clearSwipeClasses(
            card: HTMLElement,
        ) {
            card.classList.remove(
                'flashcard-is-dragging',
                'flashcard-swipe-left',
                'flashcard-swipe-right',
                'flashcard-swipe-committing',
            )
        }


        function resetCardPosition(
            card: HTMLElement,
        ) {
            clearSwipeClasses(card)

            card.style.setProperty(
                '--flashcard-swipe-x',
                '0px',
            )

            card.style.setProperty(
                '--flashcard-swipe-rotation',
                '0deg',
            )
        }


        function updateSwipePosition(
            card: HTMLElement,
            horizontalMovement: number,
        ) {
            const maximumMovement =
                Math.min(
                    card.offsetWidth * 0.42,
                    210,
                )

            const limitedMovement =
                Math.max(
                    -maximumMovement,
                    Math.min(
                        maximumMovement,
                        horizontalMovement,
                    ),
                )

            card.style.setProperty(
                '--flashcard-swipe-x',
                `${limitedMovement}px`,
            )

            card.style.setProperty(
                '--flashcard-swipe-rotation',
                `${limitedMovement / 30}deg`,
            )

            card.classList.toggle(
                'flashcard-swipe-left',
                limitedMovement < -16,
            )

            card.classList.toggle(
                'flashcard-swipe-right',
                limitedMovement > 16,
            )
        }


        function commitSwipe(
            card: HTMLElement,
            knowsAnswer: boolean,
        ) {
            if (isCommittingSwipe) {
                return
            }

            isCommittingSwipe = true
            suppressClickUntil =
                Date.now() + 450

            card.classList.remove(
                'flashcard-is-dragging',
            )

            card.classList.add(
                'flashcard-swipe-committing',
                knowsAnswer
                    ? 'flashcard-swipe-right'
                    : 'flashcard-swipe-left',
            )

            const exitDistance =
                Math.max(
                    window.innerWidth,
                    card.offsetWidth,
                ) * 1.15

            card.style.setProperty(
                '--flashcard-swipe-x',
                `${
                    knowsAnswer
                        ? exitDistance
                        : -exitDistance
                }px`,
            )

            card.style.setProperty(
                '--flashcard-swipe-rotation',
                knowsAnswer
                    ? '12deg'
                    : '-12deg',
            )

            swipeTimer = window.setTimeout(
                () => {
                    resetCardPosition(card)
                    answerCard(knowsAnswer)
                    isCommittingSwipe = false
                    swipeTimer = null
                },
                SWIPE_ANIMATION_DURATION,
            )
        }


        function handleClick(
            event: MouseEvent,
        ) {
            if (
                Date.now()
                < suppressClickUntil
            ) {
                event.preventDefault()
                return
            }

            if (isInteractiveTarget(event.target)) {
                return
            }

            if (!(event.target instanceof Element)) {
                return
            }

            const card =
                event.target.closest<HTMLElement>(
                    selectors.card,
                )

            if (
                !card
                || !rootElement.contains(card)
                || !hasQuestion(card)
            ) {
                return
            }

            event.preventDefault()
            revealAnswer()
        }


        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (
                event.repeat
                || event.altKey
                || event.ctrlKey
                || event.metaKey
                || isInteractiveTarget(
                    event.target,
                )
            ) {
                return
            }

            if (
                event.code === 'Space'
                || event.code === 'Enter'
            ) {
                if (revealAnswer()) {
                    event.preventDefault()
                }

                return
            }

            if (
                event.code === 'ArrowLeft'
            ) {
                if (answerCard(false)) {
                    event.preventDefault()
                }

                return
            }

            if (
                event.code === 'ArrowRight'
                && answerCard(true)
            ) {
                event.preventDefault()
            }
        }


        function handlePointerDown(
            event: PointerEvent,
        ) {
            if (
                !isTouchDeviceRef.current
                || event.pointerType === 'mouse'
                || isInteractiveTarget(
                    event.target,
                )
                || isCommittingSwipe
                || !(event.target instanceof Element)
            ) {
                return
            }

            const card =
                event.target.closest<HTMLElement>(
                    selectors.card,
                )

            if (
                !card
                || !rootElement.contains(card)
            ) {
                return
            }

            activeGesture = {
                pointerId: event.pointerId,
                card,
                startX: event.clientX,
                startY: event.clientY,
                currentX: event.clientX,
                currentY: event.clientY,
                axis: 'pending',
            }

            /*
             * Не захватываем pointer сразу.
             * Иначе Chrome на Android может
             * не передать вертикальный жест
             * прокрутке страницы. Захватим его
             * только после явного движения
             * по горизонтали.
             */
        }


        function handlePointerMove(
            event: PointerEvent,
        ) {
            if (
                !activeGesture
                || activeGesture.pointerId
                    !== event.pointerId
            ) {
                return
            }

            activeGesture.currentX =
                event.clientX

            activeGesture.currentY =
                event.clientY

            const horizontalMovement =
                event.clientX
                - activeGesture.startX

            const verticalMovement =
                event.clientY
                - activeGesture.startY

            const absoluteHorizontalMovement =
                Math.abs(horizontalMovement)

            const absoluteVerticalMovement =
                Math.abs(verticalMovement)

            if (
                activeGesture.axis
                === 'pending'
            ) {
                if (
                    Math.max(
                        absoluteHorizontalMovement,
                        absoluteVerticalMovement,
                    ) < GESTURE_LOCK_THRESHOLD
                ) {
                    return
                }

                /*
                 * Вертикальное движение целиком
                 * отдаём браузеру. Никакого
                 * preventDefault и pointer capture:
                 * страница нормально прокручивается,
                 * даже если палец начал жест прямо
                 * на карточке.
                 */
                if (
                    absoluteVerticalMovement
                    >= absoluteHorizontalMovement
                ) {
                    resetCardPosition(
                        activeGesture.card,
                    )

                    activeGesture = null
                    return
                }

                /*
                 * Свайп оценивает ответ только
                 * после открытия обратной стороны.
                 * На стороне вопроса горизонтальный
                 * жест ничего не блокирует.
                 */
                if (
                    !hasAnswer(
                        activeGesture.card,
                    )
                ) {
                    activeGesture = null
                    return
                }

                activeGesture.axis =
                    'horizontal'

                activeGesture.card.classList.add(
                    'flashcard-is-dragging',
                )

                try {
                    activeGesture.card
                        .setPointerCapture(
                            event.pointerId,
                        )
                } catch {
                    // Не все мобильные браузеры
                    // поддерживают pointer capture.
                }
            }

            if (
                activeGesture.axis
                !== 'horizontal'
            ) {
                return
            }

            event.preventDefault()

            updateSwipePosition(
                activeGesture.card,
                horizontalMovement,
            )
        }


        function finishPointerGesture(
            event: PointerEvent,
            wasCancelled: boolean,
        ) {
            if (
                !activeGesture
                || activeGesture.pointerId
                    !== event.pointerId
            ) {
                return
            }

            const gesture = activeGesture
            activeGesture = null

            try {
                if (
                    gesture.card.hasPointerCapture(
                        event.pointerId,
                    )
                ) {
                    gesture.card.releasePointerCapture(
                        event.pointerId,
                    )
                }
            } catch {
                // Захват мог уже завершиться
                // после pointercancel.
            }

            const horizontalMovement =
                gesture.currentX
                - gesture.startX

            const verticalMovement =
                gesture.currentY
                - gesture.startY

            const movedDistance =
                Math.hypot(
                    horizontalMovement,
                    verticalMovement,
                )

            const isHorizontalSwipe =
                gesture.axis === 'horizontal'
                && !wasCancelled
                && Math.abs(horizontalMovement)
                    >= SWIPE_THRESHOLD
                && Math.abs(horizontalMovement)
                    > Math.abs(verticalMovement) * 1.2

            if (
                isHorizontalSwipe
                && hasAnswer(gesture.card)
            ) {
                commitSwipe(
                    gesture.card,
                    horizontalMovement > 0,
                )

                return
            }

            if (
                movedDistance
                > CLICK_MOVEMENT_LIMIT
            ) {
                suppressClickUntil =
                    Date.now() + 320
            }

            resetCardPosition(
                gesture.card,
            )
        }


        function handlePointerUp(
            event: PointerEvent,
        ) {
            finishPointerGesture(
                event,
                false,
            )
        }


        function handlePointerCancel(
            event: PointerEvent,
        ) {
            finishPointerGesture(
                event,
                true,
            )
        }


        const observer =
            new MutationObserver(
                updateCardAccessibility,
            )

        observer.observe(
            rootElement,
            {
                childList: true,
                subtree: true,
            },
        )

        updateCardAccessibility()

        rootElement.addEventListener(
            'click',
            handleClick,
        )

        rootElement.addEventListener(
            'pointerdown',
            handlePointerDown,
        )

        rootElement.addEventListener(
            'pointermove',
            handlePointerMove,
        )

        rootElement.addEventListener(
            'pointerup',
            handlePointerUp,
        )

        rootElement.addEventListener(
            'pointercancel',
            handlePointerCancel,
        )

        window.addEventListener(
            'keydown',
            handleKeyDown,
        )


        return () => {
            observer.disconnect()

            rootElement.removeEventListener(
                'click',
                handleClick,
            )

            rootElement.removeEventListener(
                'pointerdown',
                handlePointerDown,
            )

            rootElement.removeEventListener(
                'pointermove',
                handlePointerMove,
            )

            rootElement.removeEventListener(
                'pointerup',
                handlePointerUp,
            )

            rootElement.removeEventListener(
                'pointercancel',
                handlePointerCancel,
            )

            window.removeEventListener(
                'keydown',
                handleKeyDown,
            )

            if (swipeTimer !== null) {
                window.clearTimeout(
                    swipeTimer,
                )
            }
        }
    }, [kind])


    return (
        <div
            className={
                'flashcard-controller '
                + `flashcard-controller--${kind} `
                + (
                    isTouchDevice
                        ? 'flashcard-controller--touch'
                        : 'flashcard-controller--desktop'
                )
            }
            ref={rootRef}
        >
            <div
                className="flashcard-instructions"
                role="note"
            >
                {isTouchDevice ? (
                    <>
                        <span className="flashcard-instruction-main">
                            Коснись карточки —
                            показать ответ
                        </span>

                        <span className="flashcard-instruction-action">
                            <span aria-hidden="true">
                                ←
                            </span>
                            Не знаю
                        </span>

                        <span className="flashcard-instruction-action">
                            Знаю
                            <span aria-hidden="true">
                                →
                            </span>
                        </span>
                    </>
                ) : (
                    <>
                        <span className="flashcard-instruction-main">
                            Клик по карточке или
                            {' '}
                            <kbd>Пробел</kbd>
                            {' '}— показать ответ
                        </span>

                        <span className="flashcard-instruction-action">
                            <kbd>←</kbd>
                            Не знаю
                        </span>

                        <span className="flashcard-instruction-action">
                            <kbd>→</kbd>
                            Знаю
                        </span>
                    </>
                )}
            </div>

            {children}
        </div>
    )
}


export default FlashcardTrainer
