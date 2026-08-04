import {
    useEffect,
    useRef,
    useState,
} from 'react'

import { ApiError } from '../api/client'
import {
    clearStarsProgress,
    getStarsProgress,
    saveStarsProgress,
} from '../api/starsProgress'
import type {
    StarsProgressItem,
    StarsProgressRead,
    StarsStudyMode,
} from '../api/starsProgress'
import { useAuth } from '../auth/AuthContext'
import { getAccessToken } from '../auth/tokenStorage'
import {
    mainStars,
    stars,
    type Star,
} from '../data/stars'
import './StarsTrainer.css'


type PromptKind = 'name' | 'position'


type StarProgress = {
    streak: number
    correctAnswers: number
    wrongAnswers: number
    learned: boolean
    nextPromptKind: PromptKind
}


type ProgressMap = Record<
    string,
    StarProgress
>


type LegacyCardProgress = {
    streak: number
    correctAnswers: number
    wrongAnswers: number
    learned: boolean
}


type LegacyProgressMap = Record<
    string,
    LegacyCardProgress
>


const LEGACY_PROGRESS_STORAGE_KEY =
    'astro-trainer:stars-progress:v1'

const MODE_STORAGE_KEY =
    'astro-trainer:stars-mode:v1'

const REQUIRED_STREAK = 16

const REVIEW_GAPS = [
    5,
    7,
    10,
    15,
    20,
    30,
    40,
    50,
    80,
    120,
] as const


const starsById = new Map(
    stars.map((star) => [
        star.id,
        star,
    ]),
)


const starOrderById = new Map(
    stars.map((star, index) => [
        star.id,
        index,
    ]),
)


const starsByMode:
    Record<
        StarsStudyMode,
        readonly Star[]
    > = {
        main: mainStars,
        all: stars,
    }


function getStarsProgressStorageKey(
    userId: number,
): string {
    return (
        'astro-trainer:stars-progress:'
        + `user-${userId}:v1`
    )
}


function getDefaultPromptKind(
    starId: string,
): PromptKind {
    const starOrder =
        starOrderById.get(starId) ?? 0

    return starOrder % 2 === 0
        ? 'name'
        : 'position'
}


function getDefaultProgress(
    starId: string,
): StarProgress {
    return {
        streak: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        learned: false,
        nextPromptKind:
            getDefaultPromptKind(starId),
    }
}


function getOppositePromptKind(
    promptKind: PromptKind,
): PromptKind {
    return promptKind === 'name'
        ? 'position'
        : 'name'
}


function shuffle<T>(
    items: readonly T[],
): T[] {
    const result = [...items]

    for (
        let index = result.length - 1;
        index > 0;
        index -= 1
    ) {
        const randomIndex = Math.floor(
            Math.random() * (index + 1),
        )

        const temporary = result[index]

        result[index] =
            result[randomIndex]

        result[randomIndex] =
            temporary
    }

    return result
}


function loadStudyMode():
    StarsStudyMode {
    try {
        const savedMode =
            localStorage.getItem(
                MODE_STORAGE_KEY,
            )

        return savedMode === 'all'
            ? 'all'
            : 'main'
    } catch {
        return 'main'
    }
}


function loadLegacyProgress():
    LegacyProgressMap {
    try {
        const savedProgress =
            localStorage.getItem(
                LEGACY_PROGRESS_STORAGE_KEY,
            )

        if (!savedProgress) {
            return {}
        }

        return JSON.parse(
            savedProgress,
        ) as LegacyProgressMap
    } catch {
        return {}
    }
}


function migrateLegacyProgress(
    legacyProgress: LegacyProgressMap,
): ProgressMap {
    const migratedProgress:
        ProgressMap = {}

    for (const star of stars) {
        const nameProgress =
            legacyProgress[
                `${star.id}-name`
            ]

        const positionProgress =
            legacyProgress[
                `${star.id}-position`
            ]

        if (
            !nameProgress
            && !positionProgress
        ) {
            continue
        }

        const nameStreak =
            nameProgress?.streak ?? 0

        const positionStreak =
            positionProgress?.streak ?? 0

        const completedPairs = Math.min(
            nameStreak,
            positionStreak,
        )

        const hasExtraAnswer =
            nameStreak === positionStreak
                ? 0
                : 1

        const streak = Math.min(
            REQUIRED_STREAK,
            completedPairs * 2
                + hasExtraAnswer,
        )

        let nextPromptKind: PromptKind

        if (nameStreak < positionStreak) {
            nextPromptKind = 'name'
        } else if (
            positionStreak < nameStreak
        ) {
            nextPromptKind = 'position'
        } else {
            nextPromptKind =
                getDefaultPromptKind(
                    star.id,
                )
        }

        migratedProgress[star.id] = {
            streak,

            correctAnswers:
                (
                    nameProgress
                        ?.correctAnswers
                    ?? 0
                )
                + (
                    positionProgress
                        ?.correctAnswers
                    ?? 0
                ),

            wrongAnswers:
                (
                    nameProgress
                        ?.wrongAnswers
                    ?? 0
                )
                + (
                    positionProgress
                        ?.wrongAnswers
                    ?? 0
                ),

            learned:
                streak >= REQUIRED_STREAK,

            nextPromptKind,
        }
    }

    return migratedProgress
}


function buildQueue(
    mode: StarsStudyMode,
    progress: ProgressMap,
): string[] {
    const unlearnedStarIds =
        starsByMode[mode]
            .filter((star) => {
                return !progress[
                    star.id
                ]?.learned
            })
            .map((star) => star.id)

    return shuffle(unlearnedStarIds)
}


function restoreServerQueue(
    mode: StarsStudyMode,
    progress: ProgressMap,
    savedQueue: readonly string[],
): string[] {
    const unlearnedStarIds =
        starsByMode[mode]
            .filter((star) => {
                return !progress[
                    star.id
                ]?.learned
            })
            .map((star) => star.id)

    const allowedStarIds =
        new Set(unlearnedStarIds)

    const restoredQueue: string[] = []
    const restoredStarIds =
        new Set<string>()

    for (const starId of savedQueue) {
        if (
            !allowedStarIds.has(starId)
            || restoredStarIds.has(starId)
        ) {
            continue
        }

        restoredQueue.push(starId)
        restoredStarIds.add(starId)
    }

    const missingStarIds =
        unlearnedStarIds.filter(
            (starId) =>
                !restoredStarIds.has(
                    starId,
                ),
        )

    return [
        ...restoredQueue,
        ...shuffle(missingStarIds),
    ]
}


function serverItemsToProgressMap(
    items:
        readonly StarsProgressItem[],
): ProgressMap {
    const result: ProgressMap = {}

    for (const item of items) {
        result[item.item_id] = {
            streak: item.streak,

            correctAnswers:
                item.correct_answers,

            wrongAnswers:
                item.wrong_answers,

            learned:
                item.learned,

            nextPromptKind:
                item.next_prompt_kind,
        }
    }

    return result
}


function progressMapToServerItems(
    progress: ProgressMap,
): StarsProgressItem[] {
    return Object.entries(progress)
        .map(([
            itemId,
            itemProgress,
        ]) => ({
            item_id: itemId,

            streak:
                itemProgress.streak,

            correct_answers:
                itemProgress
                    .correctAnswers,

            wrong_answers:
                itemProgress
                    .wrongAnswers,

            learned:
                itemProgress.learned,

            next_prompt_kind:
                itemProgress
                    .nextPromptKind,
        }))
        .sort((
            firstItem,
            secondItem,
        ) => {
            const firstOrder =
                starOrderById.get(
                    firstItem.item_id,
                )
                ?? Number.MAX_SAFE_INTEGER

            const secondOrder =
                starOrderById.get(
                    secondItem.item_id,
                )
                ?? Number.MAX_SAFE_INTEGER

            return firstOrder - secondOrder
        })
}


function arraysAreEqual(
    first: readonly string[],
    second: readonly string[],
): boolean {
    return (
        first.length === second.length
        && first.every(
            (value, index) =>
                value === second[index],
        )
    )
}


function removeLegacyLocalProgress():
    void {
    localStorage.removeItem(
        LEGACY_PROGRESS_STORAGE_KEY,
    )
}


function cacheProgress(
    userId: number,
    progress: ProgressMap,
): void {
    try {
        localStorage.setItem(
            getStarsProgressStorageKey(
                userId,
            ),
            JSON.stringify(progress),
        )
    } catch {
        // Backend остаётся основной
        // версией прогресса.
    }
}


function getProgressErrorMessage(
    error: unknown,
): string {
    if (error instanceof ApiError) {
        return error.message
    }

    return (
        'Не удалось связаться с сервером. '
        + 'Проверь, запущен ли backend.'
    )
}


const initializationRequests =
    new Map<
        string,
        Promise<StarsProgressRead>
    >()


function initializeStarsProgress(
    token: string,
    mode: StarsStudyMode,
): Promise<StarsProgressRead> {
    const requestKey =
        `${token}:${mode}`

    const existingRequest =
        initializationRequests.get(
            requestKey,
        )

    if (existingRequest) {
        return existingRequest
    }

    const request = (
        async () => {
            const serverProgress =
                await getStarsProgress(
                    token,
                    mode,
                )

            if (
                !serverProgress
                    .has_saved_progress
            ) {
                const localProgress =
                    migrateLegacyProgress(
                        loadLegacyProgress(),
                    )

                const localQueue =
                    buildQueue(
                        mode,
                        localProgress,
                    )

                const migratedProgress =
                    await saveStarsProgress(
                        token,
                        mode,
                        {
                            items:
                                progressMapToServerItems(
                                    localProgress,
                                ),

                            queue:
                                localQueue,
                        },
                    )

                removeLegacyLocalProgress()

                return migratedProgress
            }

            removeLegacyLocalProgress()

            const progress =
                serverItemsToProgressMap(
                    serverProgress.items,
                )

            const restoredQueue =
                restoreServerQueue(
                    mode,
                    progress,
                    serverProgress.queue,
                )

            if (
                arraysAreEqual(
                    restoredQueue,
                    serverProgress.queue,
                )
            ) {
                return serverProgress
            }

            return saveStarsProgress(
                token,
                mode,
                {
                    items:
                        serverProgress.items,

                    queue:
                        restoredQueue,
                },
            )
        }
    )()

    initializationRequests.set(
        requestKey,
        request,
    )

    void request
        .finally(() => {
            if (
                initializationRequests.get(
                    requestKey,
                )
                === request
            ) {
                initializationRequests.delete(
                    requestKey,
                )
            }
        })
        .catch(() => undefined)

    return request
}


function getAssetUrl(
    path: string,
): string {
    return (
        `${import.meta.env.BASE_URL}${path}`
    )
}


function StarsTrainer() {
    const { user } = useAuth()

    const userId =
        user?.id ?? null

    const [
        studyMode,
        setStudyMode,
    ] = useState<StarsStudyMode>(
        () => loadStudyMode(),
    )

    const [
        progress,
        setProgress,
    ] = useState<ProgressMap>({})

    const [
        queue,
        setQueue,
    ] = useState<string[]>([])

    const [
        isAnswerVisible,
        setIsAnswerVisible,
    ] = useState(false)

    const [
        isProgressLoading,
        setIsProgressLoading,
    ] = useState(true)

    const [
        loadError,
        setLoadError,
    ] = useState('')

    const [
        saveError,
        setSaveError,
    ] = useState('')

    const saveChainRef =
        useRef<Promise<void>>(
            Promise.resolve(),
        )

    const isMountedRef =
        useRef(true)


    useEffect(() => {
        return () => {
            isMountedRef.current = false
        }
    }, [])


    useEffect(() => {
        try {
            localStorage.setItem(
                MODE_STORAGE_KEY,
                studyMode,
            )
        } catch {
            // Режим просто не сохранится
            // между открытиями страницы.
        }
    }, [studyMode])


    useEffect(() => {
        let isActive = true

        setIsProgressLoading(true)
        setLoadError('')
        setSaveError('')
        setIsAnswerVisible(false)

        async function loadAccountProgress() {
            if (userId === null) {
                if (isActive) {
                    setLoadError(
                        'Не удалось определить аккаунт.',
                    )

                    setIsProgressLoading(false)
                }

                return
            }

            const token =
                getAccessToken()

            if (!token) {
                if (isActive) {
                    setLoadError(
                        'Необходимо войти в аккаунт.',
                    )

                    setIsProgressLoading(false)
                }

                return
            }

            try {
                const serverProgress =
                    await initializeStarsProgress(
                        token,
                        studyMode,
                    )

                const restoredProgress =
                    serverItemsToProgressMap(
                        serverProgress.items,
                    )

                const restoredQueue =
                    restoreServerQueue(
                        studyMode,
                        restoredProgress,
                        serverProgress.queue,
                    )

                if (!isActive) {
                    return
                }

                setProgress(restoredProgress)
                setQueue(restoredQueue)

                cacheProgress(
                    userId,
                    restoredProgress,
                )
            } catch (error) {
                if (!isActive) {
                    return
                }

                setLoadError(
                    getProgressErrorMessage(
                        error,
                    ),
                )
            } finally {
                if (isActive) {
                    setIsProgressLoading(false)
                }
            }
        }

        void loadAccountProgress()

        return () => {
            isActive = false
        }
    }, [
        userId,
        studyMode,
    ])


    const activeStars =
        starsByMode[studyMode]

    const currentStarId =
        queue[0]

    const currentStar =
        currentStarId === undefined
            ? undefined
            : starsById.get(
                  currentStarId,
              )

    const currentProgress =
        currentStar
            ? (
                  progress[currentStar.id]
                  ?? getDefaultProgress(
                      currentStar.id,
                  )
              )
            : undefined

    const currentPromptKind =
        currentProgress?.nextPromptKind

    const learnedStarsCount =
        activeStars.filter((star) => {
            return progress[
                star.id
            ]?.learned
        }).length


    function persistState(
        mode: StarsStudyMode,
        nextProgress: ProgressMap,
        nextQueue: readonly string[],
    ): void {
        if (userId !== null) {
            cacheProgress(
                userId,
                nextProgress,
            )
        }

        const token =
            getAccessToken()

        if (!token) {
            setSaveError(
                'Не удалось сохранить: '
                + 'сессия завершена.',
            )

            return
        }

        const items =
            progressMapToServerItems(
                nextProgress,
            )

        const savedQueue = [
            ...nextQueue,
        ]

        saveChainRef.current =
            saveChainRef.current
                .catch(
                    () => undefined,
                )
                .then(async () => {
                    await saveStarsProgress(
                        token,
                        mode,
                        {
                            items,
                            queue:
                                savedQueue,
                        },
                    )

                    if (
                        isMountedRef.current
                    ) {
                        setSaveError('')
                    }
                })
                .catch((error) => {
                    if (
                        isMountedRef.current
                    ) {
                        setSaveError(
                            getProgressErrorMessage(
                                error,
                            ),
                        )
                    }
                })
    }


    async function changeStudyMode(
        nextMode: StarsStudyMode,
    ): Promise<void> {
        if (
            nextMode === studyMode
            || isProgressLoading
        ) {
            return
        }

        setIsProgressLoading(true)
        setIsAnswerVisible(false)

        await saveChainRef.current
            .catch(() => undefined)

        if (isMountedRef.current) {
            setStudyMode(nextMode)
        }
    }


    function answerCurrentStar(
        knowsAnswer: boolean,
    ): void {
        if (
            !currentStar
            || !currentProgress
            || !currentPromptKind
            || isProgressLoading
        ) {
            return
        }

        const nextStreak =
            knowsAnswer
                ? Math.min(
                      currentProgress.streak + 1,
                      REQUIRED_STREAK,
                  )
                : 0

        const learned =
            knowsAnswer
            && nextStreak
                >= REQUIRED_STREAK

        const nextStarProgress:
            StarProgress = {
            streak: nextStreak,

            correctAnswers:
                currentProgress
                    .correctAnswers
                + (knowsAnswer ? 1 : 0),

            wrongAnswers:
                currentProgress
                    .wrongAnswers
                + (knowsAnswer ? 0 : 1),

            learned,

            nextPromptKind:
                knowsAnswer
                    ? getOppositePromptKind(
                          currentPromptKind,
                      )
                    : currentPromptKind,
        }

        const nextProgress: ProgressMap = {
            ...progress,

            [currentStar.id]:
                nextStarProgress,
        }

        const nextQueue =
            queue.slice(1)

        if (!learned) {
            const gap = knowsAnswer
                ? REVIEW_GAPS[
                      Math.min(
                          nextStreak - 1,
                          REVIEW_GAPS.length - 1,
                      )
                  ]
                : 1

            const insertionIndex =
                Math.min(
                    gap,
                    nextQueue.length,
                )

            nextQueue.splice(
                insertionIndex,
                0,
                currentStar.id,
            )
        }

        setProgress(nextProgress)
        setQueue(nextQueue)
        setIsAnswerVisible(false)

        persistState(
            studyMode,
            nextProgress,
            nextQueue,
        )
    }


    async function resetProgress():
        Promise<void> {
        const modeLabel =
            studyMode === 'main'
                ? (
                      `${mainStars.length} `
                      + 'основным звёздам'
                  )
                : (
                      `всем ${stars.length} `
                      + 'звёздам'
                  )

        const extraWarning =
            studyMode === 'main'
                ? (
                      ' Их прогресс также '
                      + 'исчезнет в полной колоде.'
                  )
                : ''

        const shouldReset =
            window.confirm(
                `Сбросить прогресс по ${modeLabel}?`
                + extraWarning,
            )

        if (!shouldReset) {
            return
        }

        const token =
            getAccessToken()

        if (!token) {
            setSaveError(
                'Необходимо войти в аккаунт.',
            )

            return
        }

        const itemIds =
            activeStars.map(
                (star) => star.id,
            )

        const itemIdSet =
            new Set(itemIds)

        const nextProgress =
            Object.fromEntries(
                Object.entries(progress)
                    .filter(([starId]) => {
                        return !itemIdSet.has(
                            starId,
                        )
                    }),
            ) as ProgressMap

        const nextQueue =
            buildQueue(
                studyMode,
                nextProgress,
            )

        setIsProgressLoading(true)
        setIsAnswerVisible(false)

        try {
            await saveChainRef.current
                .catch(() => undefined)

            await clearStarsProgress(
                token,
                studyMode,
                itemIds,
            )

            await saveStarsProgress(
                token,
                studyMode,
                {
                    items:
                        progressMapToServerItems(
                            nextProgress,
                        ),

                    queue:
                        nextQueue,
                },
            )

            if (!isMountedRef.current) {
                return
            }

            setProgress(nextProgress)
            setQueue(nextQueue)

            if (userId !== null) {
                cacheProgress(
                    userId,
                    nextProgress,
                )
            }

            setSaveError('')
        } catch (error) {
            if (isMountedRef.current) {
                setSaveError(
                    getProgressErrorMessage(
                        error,
                    ),
                )
            }
        } finally {
            if (isMountedRef.current) {
                setIsProgressLoading(false)
            }
        }
    }


    function reshuffleRemainingStars():
        void {
        const nextQueue =
            shuffle(queue)

        setQueue(nextQueue)
        setIsAnswerVisible(false)

        persistState(
            studyMode,
            progress,
            nextQueue,
        )
    }


    const modePicker = (
        <div
            className="stars-mode-picker"
            aria-label="Выбор колоды"
        >
            <div className="stars-mode-copy">
                <p className="stars-card-kicker">
                    Режим повторения
                </p>

                <h3>
                    Какие звёзды изучать?
                </h3>
            </div>

            <div
                className="stars-mode-options"
                role="group"
            >
                <button
                    aria-pressed={
                        studyMode === 'main'
                    }
                    className={
                        studyMode === 'main'
                            ? (
                                  'stars-mode-option '
                                  + 'stars-mode-option--active'
                              )
                            : 'stars-mode-option'
                    }
                    disabled={isProgressLoading}
                    onClick={() => {
                        void changeStudyMode(
                            'main',
                        )
                    }}
                    type="button"
                >
                    <strong>
                        Только основные
                    </strong>

                    <span>
                        {mainStars.length} звёзд
                        {' · '}
                        общий прогресс
                    </span>
                </button>

                <button
                    aria-pressed={
                        studyMode === 'all'
                    }
                    className={
                        studyMode === 'all'
                            ? (
                                  'stars-mode-option '
                                  + 'stars-mode-option--active'
                              )
                            : 'stars-mode-option'
                    }
                    disabled={isProgressLoading}
                    onClick={() => {
                        void changeStudyMode(
                            'all',
                        )
                    }}
                    type="button"
                >
                    <strong>
                        Вся колода
                    </strong>

                    <span>
                        {stars.length} звёзд
                        {' · '}
                        включает основные
                    </span>
                </button>
            </div>
        </div>
    )


    if (isProgressLoading) {
        return (
            <section className="stars-trainer">
                {modePicker}

                <div className="stars-complete">
                    <p className="stars-card-kicker">
                        Синхронизация
                    </p>

                    <h3>
                        Загружаем прогресс
                    </h3>

                    <p>
                        Получаем звёзды и очередь
                        из твоего аккаунта.
                    </p>
                </div>
            </section>
        )
    }


    if (loadError) {
        return (
            <section className="stars-trainer">
                {modePicker}

                <div className="stars-complete">
                    <p className="stars-card-kicker">
                        Ошибка синхронизации
                    </p>

                    <h3>
                        Не удалось загрузить прогресс
                    </h3>

                    <p>
                        {loadError}
                    </p>

                    <button
                        className={
                            'stars-button '
                            + 'stars-button--secondary'
                        }
                        onClick={() => {
                            window.location.reload()
                        }}
                        type="button"
                    >
                        Попробовать снова
                    </button>
                </div>
            </section>
        )
    }


    if (
        !currentStar
        || !currentProgress
        || !currentPromptKind
    ) {
        return (
            <section className="stars-trainer">
                {modePicker}

                {saveError ? (
                    <p className="stars-source-note">
                        Ошибка сохранения:
                        {' '}
                        {saveError}
                    </p>
                ) : null}

                <div className="stars-complete">
                    <p className="stars-card-kicker">
                        Колода завершена
                    </p>

                    <h3>
                        Все звёзды этого режима
                        выучены
                    </h3>

                    <p>
                        У каждой из
                        {' '}
                        {activeStars.length}
                        {' '}
                        звёзд набрана серия из
                        {' '}
                        {REQUIRED_STREAK}
                        {' '}
                        правильных ответов подряд
                        с чередованием направлений.
                    </p>

                    <div className="stars-complete-actions">
                        {studyMode === 'main' ? (
                            <button
                                className={
                                    'stars-button '
                                    + 'stars-button--primary'
                                }
                                onClick={() => {
                                    void changeStudyMode(
                                        'all',
                                    )
                                }}
                                type="button"
                            >
                                Перейти ко всей колоде
                            </button>
                        ) : null}

                        <button
                            className={
                                'stars-button '
                                + 'stars-button--secondary'
                            }
                            onClick={() => {
                                void resetProgress()
                            }}
                            type="button"
                        >
                            Начать заново
                        </button>
                    </div>
                </div>
            </section>
        )
    }


    const positionImageUrl =
        getAssetUrl(
            currentStar.image,
        )


    return (
        <section className="stars-trainer">
            {modePicker}

            {saveError ? (
                <p className="stars-source-note">
                    Ошибка сохранения:
                    {' '}
                    {saveError}
                </p>
            ) : null}

            <div className="stars-toolbar">
                <div className="stars-stat">
                    <span>
                        В очереди
                    </span>

                    <strong>
                        {queue.length}
                    </strong>
                </div>

                <div className="stars-stat">
                    <span>
                        Выучено звёзд
                    </span>

                    <strong>
                        {learnedStarsCount}
                        /
                        {activeStars.length}
                    </strong>
                </div>

                <div className="stars-stat">
                    <span>
                        Серия текущей
                    </span>

                    <strong>
                        {currentProgress.streak}
                        /
                        {REQUIRED_STREAK}
                    </strong>
                </div>

                <div className="stars-stat">
                    <span>
                        Правильных всего
                    </span>

                    <strong>
                        {
                            currentProgress
                                .correctAnswers
                        }
                    </strong>
                </div>

                <div className="stars-toolbar-actions">
                    <button
                        onClick={
                            reshuffleRemainingStars
                        }
                        type="button"
                    >
                        Перемешать
                    </button>

                    <button
                        onClick={() => {
                            void resetProgress()
                        }}
                        type="button"
                    >
                        Сбросить прогресс
                    </button>
                </div>
            </div>

            <article className="stars-study-card">
                {!isAnswerVisible ? (
                    <div className="stars-question">
                        <p className="stars-card-kicker">
                            {
                                currentPromptKind
                                === 'name'
                                    ? (
                                          'Название → '
                                          + 'обозначение '
                                          + 'и положение'
                                      )
                                    : (
                                          'Положение → '
                                          + 'обозначение '
                                          + 'и название'
                                      )
                            }
                        </p>

                        {
                            currentPromptKind
                            === 'name'
                                ? (
                                      <h3>
                                          {
                                              currentStar
                                                  .name
                                          }
                                      </h3>
                                  )
                                : (
                                      <>
                                          <p className="stars-question-title">
                                              Как называется
                                              эта звезда?
                                          </p>

                                          <div className="stars-position-prompt">
                                              <img
                                                  src={
                                                      positionImageUrl
                                                  }
                                                  alt={
                                                      'Положение звезды '
                                                      + 'на карте неба'
                                                  }
                                              />
                                          </div>
                                      </>
                                  )
                        }

                        <button
                            className={
                                'stars-button '
                                + 'stars-button--primary'
                            }
                            onClick={() => {
                                setIsAnswerVisible(
                                    true,
                                )
                            }}
                            type="button"
                        >
                            Показать ответ
                        </button>
                    </div>
                ) : (
                    <div className="stars-answer">
                        <header className="stars-answer-header">
                            <div>
                                <p className="stars-card-kicker">
                                    Ответ
                                </p>

                                <h3>
                                    {currentStar.name}
                                </h3>
                            </div>

                            <span
                                className={
                                    currentStar.group
                                    === 'main'
                                        ? (
                                              'stars-group-badge '
                                              + 'stars-group-badge--main'
                                          )
                                        : 'stars-group-badge'
                                }
                            >
                                {
                                    currentStar.group
                                    === 'main'
                                        ? 'Основная'
                                        : 'Дополнительная'
                                }
                            </span>
                        </header>

                        <div className="stars-answer-content">
                            <figure className="stars-image-panel">
                                <figcaption>
                                    Положение на карте неба
                                </figcaption>

                                <img
                                    src={
                                        positionImageUrl
                                    }
                                    alt={
                                        `Положение звезды `
                                        + `${currentStar.name} `
                                        + 'на карте неба'
                                    }
                                />
                            </figure>

                            <dl className="stars-details">
                                <div>
                                    <dt>
                                        Название
                                    </dt>

                                    <dd>
                                        {currentStar.name}
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Обозначение
                                    </dt>

                                    <dd>
                                        {
                                            currentStar
                                                .designation
                                        }
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Вопросов в выборке
                                    </dt>

                                    <dd>
                                        {
                                            currentStar
                                                .questionCount
                                        }
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Разных тестов
                                    </dt>

                                    <dd>
                                        {
                                            currentStar
                                                .testCount
                                        }
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        <div className="stars-answer-actions">
                            <button
                                className={
                                    'stars-button '
                                    + 'stars-button--wrong'
                                }
                                onClick={() => {
                                    answerCurrentStar(
                                        false,
                                    )
                                }}
                                type="button"
                            >
                                Не знаю

                                <span>
                                    Серия обнулится,
                                    направление останется
                                </span>
                            </button>

                            <button
                                className={
                                    'stars-button '
                                    + 'stars-button--correct'
                                }
                                onClick={() => {
                                    answerCurrentStar(
                                        true,
                                    )
                                }}
                                type="button"
                            >
                                Знаю

                                <span>
                                    Серия станет
                                    {' '}
                                    {
                                        Math.min(
                                            currentProgress
                                                .streak
                                            + 1,
                                            REQUIRED_STREAK,
                                        )
                                    }
                                    /
                                    {REQUIRED_STREAK}
                                    , направление сменится
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </article>

            <p className="stars-source-note">
                В колоду вошли
                {' '}
                {stars.length}
                {' '}
                звёзд из выгруженной выборки
                тестов astroedu. Основные
                {' '}
                {mainStars.length}
                {' '}
                звёзд являются частью полной
                колоды, поэтому их прогресс
                общий для обоих режимов.
            </p>
        </section>
    )
}


export default StarsTrainer
