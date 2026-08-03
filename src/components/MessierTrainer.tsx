import {
    useEffect,
    useRef,
    useState,
} from 'react'

import { ApiError } from '../api/client'
import {
    clearMessierProgress,
    getMessierProgress,
    saveMessierProgress,
} from '../api/messierProgress'
import type {
    MessierProgressItem,
    MessierProgressRead,
} from '../api/messierProgress'
import { useAuth } from '../auth/AuthContext'
import {
    getAccessToken,
} from '../auth/tokenStorage'
import { messierObjects } from '../data/messierObjects'
import {
    getMessierProgressStorageKey,
} from '../progress/messierProgress'
import './MessierTrainer.css'


type PromptKind = 'name' | 'position'


type ObjectProgress = {
    streak: number
    correctAnswers: number
    wrongAnswers: number
    learned: boolean
    nextPromptKind: PromptKind
}


type ProgressMap = Record<
    string,
    ObjectProgress
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


const STORAGE_KEY =
    'astro-trainer:messier-progress:v4'

const QUEUE_STORAGE_KEY =
    'astro-trainer:messier-queue:v1'

const LEGACY_STORAGE_KEY =
    'astro-trainer:messier-progress:v3'


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


const objectsByNumber = new Map(
    messierObjects.map((object) => [
        object.number,
        object,
    ]),
)


function getProgressKey(
    objectNumber: number,
): string {
    return `m${objectNumber}`
}


function getDefaultPromptKind(
    objectNumber: number,
): PromptKind {
    return objectNumber % 2 === 0
        ? 'position'
        : 'name'
}


function getDefaultProgress(
    objectNumber: number,
): ObjectProgress {
    return {
        streak: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        learned: false,
        nextPromptKind:
            getDefaultPromptKind(
                objectNumber,
            ),
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


function migrateLegacyProgress(
    legacyProgress: LegacyProgressMap,
): ProgressMap {
    const migratedProgress: ProgressMap = {}

    for (const object of messierObjects) {
        const nameProgress =
            legacyProgress[
                `m${object.number}-name`
            ]

        const positionProgress =
            legacyProgress[
                `m${object.number}-position`
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

        /*
         * Считаем максимально возможную
         * чередующуюся серию из старых
         * независимых серий.
         *
         * Например:
         * name = 8, position = 8 → 16
         * name = 10, position = 0 → 1
         * name = 7, position = 6 → 13
         */
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
                    object.number,
                )
        }

        migratedProgress[
            getProgressKey(
                object.number,
            )
        ] = {
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


function loadProgress(): ProgressMap {
    try {
        const savedProgress =
            localStorage.getItem(
                STORAGE_KEY,
            )

        if (savedProgress) {
            return JSON.parse(
                savedProgress,
            ) as ProgressMap
        }

        const legacySavedProgress =
            localStorage.getItem(
                LEGACY_STORAGE_KEY,
            )

        if (!legacySavedProgress) {
            return {}
        }

        const migratedProgress =
            migrateLegacyProgress(
                JSON.parse(
                    legacySavedProgress,
                ) as LegacyProgressMap,
            )

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                migratedProgress,
            ),
        )

        return migratedProgress
    } catch {
        return {}
    }
}


function buildQueue(
    progress: ProgressMap,
): number[] {
    const unlearnedObjectNumbers =
        messierObjects
            .filter((object) => {
                const objectProgress =
                    progress[
                        getProgressKey(
                            object.number,
                        )
                    ]

                return !objectProgress?.learned
            })
            .map(
                (object) =>
                    object.number,
            )

    return shuffle(
        unlearnedObjectNumbers,
    )
}

function loadQueue(
    progress: ProgressMap,
): number[] {
    const unlearnedObjectNumbers =
        messierObjects
            .filter((object) => {
                const objectProgress =
                    progress[
                        getProgressKey(
                            object.number,
                        )
                    ]

                return !objectProgress?.learned
            })
            .map(
                (object) =>
                    object.number,
            )

    const unlearnedObjectNumbersSet =
        new Set(
            unlearnedObjectNumbers,
        )

    try {
        const savedQueue =
            localStorage.getItem(
                QUEUE_STORAGE_KEY,
            )

        if (!savedQueue) {
            return shuffle(
                unlearnedObjectNumbers,
            )
        }

        const parsedQueue: unknown =
            JSON.parse(savedQueue)

        if (!Array.isArray(parsedQueue)) {
            return shuffle(
                unlearnedObjectNumbers,
            )
        }

        const restoredQueue: number[] = []
        const restoredNumbers =
            new Set<number>()

        for (const value of parsedQueue) {
            if (
                typeof value !== 'number'
                || !Number.isInteger(value)
                || !unlearnedObjectNumbersSet
                    .has(value)
                || restoredNumbers.has(value)
            ) {
                continue
            }

            restoredQueue.push(value)
            restoredNumbers.add(value)
        }

        const missingObjectNumbers =
            unlearnedObjectNumbers.filter(
                (objectNumber) =>
                    !restoredNumbers.has(
                        objectNumber,
                    ),
            )

        return [
            ...restoredQueue,
            ...shuffle(
                missingObjectNumbers,
            ),
        ]
    } catch {
        return shuffle(
            unlearnedObjectNumbers,
        )
    }
}

function serverItemsToProgressMap(
    items: readonly MessierProgressItem[],
): ProgressMap {
    const result: ProgressMap = {}

    for (const item of items) {
        result[item.item_id] = {
            streak: item.streak,
            correctAnswers:
                item.correct_answers,
            wrongAnswers:
                item.wrong_answers,
            learned: item.learned,
            nextPromptKind:
                item.next_prompt_kind,
        }
    }

    return result
}


function progressMapToServerItems(
    progress: ProgressMap,
): MessierProgressItem[] {
    return Object.entries(progress)
        .map((
            [itemId, itemProgress],
        ) => ({
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
        .sort((firstItem, secondItem) => {
            return (
                Number(
                    firstItem.item_id.slice(1),
                )
                - Number(
                    secondItem.item_id.slice(1),
                )
            )
        })
}


function restoreServerQueue(
    progress: ProgressMap,
    savedQueue: readonly string[],
): number[] {
    const unlearnedNumbers =
        messierObjects
            .filter((object) => {
                return !progress[
                    getProgressKey(
                        object.number,
                    )
                ]?.learned
            })
            .map(
                (object) =>
                    object.number,
            )

    const allowedNumbers =
        new Set(unlearnedNumbers)

    const restoredQueue: number[] = []
    const restoredNumbers =
        new Set<number>()

    for (const itemId of savedQueue) {
        const objectNumber =
            Number(itemId.slice(1))

        if (
            !Number.isInteger(objectNumber)
            || !allowedNumbers.has(
                objectNumber,
            )
            || restoredNumbers.has(
                objectNumber,
            )
        ) {
            continue
        }

        restoredQueue.push(
            objectNumber,
        )

        restoredNumbers.add(
            objectNumber,
        )
    }

    const missingNumbers =
        unlearnedNumbers.filter(
            (objectNumber) =>
                !restoredNumbers.has(
                    objectNumber,
                ),
        )

    return [
        ...restoredQueue,
        ...shuffle(missingNumbers),
    ]
}


function removeLegacyLocalProgress(): void {
    localStorage.removeItem(
        STORAGE_KEY,
    )

    localStorage.removeItem(
        QUEUE_STORAGE_KEY,
    )

    localStorage.removeItem(
        LEGACY_STORAGE_KEY,
    )
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


/*
 * В React StrictMode компонент может
 * инициализироваться дважды.
 *
 * Map не позволяет двум одинаковым запросам
 * одновременно перенести localStorage
 * и перезаписать друг друга.
 */
const initializationRequests =
    new Map<
        string,
        Promise<MessierProgressRead>
    >()


function initializeMessierProgress(
    token: string,
): Promise<MessierProgressRead> {
    const existingRequest =
        initializationRequests.get(token)

    if (existingRequest) {
        return existingRequest
    }

    const request = (
        async () => {
            const serverProgress =
                await getMessierProgress(
                    token,
                )

            if (
                serverProgress
                    .has_saved_progress
            ) {
                removeLegacyLocalProgress()

                return serverProgress
            }

            const localProgress =
                loadProgress()

            const localQueue =
                loadQueue(localProgress)

            const migratedProgress =
                await saveMessierProgress(
                    token,
                    {
                        items:
                            progressMapToServerItems(
                                localProgress,
                            ),

                        queue:
                            localQueue.map(
                                getProgressKey,
                            ),
                    },
                )

            removeLegacyLocalProgress()

            return migratedProgress
        }
    )()

    initializationRequests.set(
        token,
        request,
    )

    void request
        .finally(() => {
            if (
                initializationRequests
                    .get(token)
                === request
            ) {
                initializationRequests.delete(
                    token,
                )
            }
        })
        .catch(() => undefined)

    return request
}

function getAssetUrl(
    path: string | null,
): string | null {
    if (!path) {
        return null
    }

    return `${import.meta.env.BASE_URL}${path}`
}


function MessierTrainer() {
    const { user } = useAuth()

    const userId =
        user?.id ?? null


    const [progress, setProgress] =
        useState<ProgressMap>({})

    const [queue, setQueue] =
        useState<number[]>([])

    const [
        isAnswerVisible,
        setIsAnswerVisible,
    ] = useState(false)

    const [
        isProgressLoading,
        setIsProgressLoading,
    ] = useState(true)

    const [
        hasLoadedServerProgress,
        setHasLoadedServerProgress,
    ] = useState(false)

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
        let isActive = true

        setIsProgressLoading(true)
        setHasLoadedServerProgress(false)
        setLoadError('')
        setSaveError('')


        async function loadAccountProgress() {
            if (userId === null) {
                if (isActive) {
                    setLoadError(
                        'Не удалось определить аккаунт.',
                    )

                    setIsProgressLoading(
                        false,
                    )
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

                    setIsProgressLoading(
                        false,
                    )
                }

                return
            }

            try {
                const serverProgress =
                    await initializeMessierProgress(
                        token,
                    )

                const restoredProgress =
                    serverItemsToProgressMap(
                        serverProgress.items,
                    )

                const restoredQueue =
                    restoreServerQueue(
                        restoredProgress,
                        serverProgress.queue,
                    )

                if (!isActive) {
                    return
                }

                setProgress(
                    restoredProgress,
                )

                setQueue(
                    restoredQueue,
                )

                localStorage.setItem(
                    getMessierProgressStorageKey(
                        userId,
                    ),
                    JSON.stringify(
                        restoredProgress,
                    ),
                )

                setHasLoadedServerProgress(
                    true,
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
                    setIsProgressLoading(
                        false,
                    )
                }
            }
        }


        void loadAccountProgress()


        return () => {
            isActive = false
        }
    }, [userId])


    useEffect(() => {
        if (
            !hasLoadedServerProgress
            || userId === null
        ) {
            return
        }

        /*
         * Локальный кэш нужен пока для
         * полоски в профиле.
         *
         * Главная версия всё равно
         * сохраняется на backend.
         */
        localStorage.setItem(
            getMessierProgressStorageKey(
                userId,
            ),
            JSON.stringify(progress),
        )


        const saveTimeout =
            window.setTimeout(() => {
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
                        progress,
                    )

                const savedQueue =
                    queue.map(
                        getProgressKey,
                    )


                saveChainRef.current =
                    saveChainRef.current
                        .catch(
                            () => undefined,
                        )
                        .then(async () => {
                            await saveMessierProgress(
                                token,
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
            }, 350)


        return () => {
            window.clearTimeout(
                saveTimeout,
            )
        }
    }, [
        progress,
        queue,
        hasLoadedServerProgress,
        userId,
    ])


    const currentObjectNumber =
        queue[0]


    const currentObject =
        currentObjectNumber === undefined
            ? undefined
            : objectsByNumber.get(
                  currentObjectNumber,
              )


    const currentProgress =
        currentObject
            ? (
                  progress[
                      getProgressKey(
                          currentObject.number,
                      )
                  ]
                  ?? getDefaultProgress(
                      currentObject.number,
                  )
              )
            : undefined


    const currentPromptKind =
        currentProgress?.nextPromptKind


    const learnedObjectsCount =
        messierObjects.filter(
            (object) =>
                progress[
                    getProgressKey(
                        object.number,
                    )
                ]?.learned,
        ).length


    function answerCurrentObject(
        knowsAnswer: boolean,
    ) {
        
        if (isProgressLoading) {
            return (
                <section className="messier-complete">
                    <p className="messier-card-kicker">
                        Синхронизация
                    </p>

                    <h3>
                        Загружаем прогресс
                    </h3>

                    <p>
                        Получаем карточки и очередь
                        из твоего аккаунта.
                    </p>
                </section>
            )
        }


        if (loadError) {
            return (
                <section className="messier-complete">
                    <p className="messier-card-kicker">
                        Ошибка синхронизации
                    </p>

                    <h3>
                        Не удалось загрузить прогресс
                    </h3>

                    <p>
                        {loadError}
                    </p>

                    <button
                        className="
                            messier-button
                            messier-button--secondary
                        "
                        onClick={() => {
                            window.location.reload()
                        }}
                        type="button"
                    >
                        Попробовать снова
                    </button>
                </section>
            )
        }
        
        if (
            !currentObject
            || !currentProgress
            || !currentPromptKind
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

        const nextObjectProgress:
            ObjectProgress = {
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

            /*
             * После правильного ответа
             * направление меняется.
             *
             * После ошибки остаётся прежним,
             * чтобы пользователь повторил
             * именно невыученное направление.
             */
            nextPromptKind:
                knowsAnswer
                    ? getOppositePromptKind(
                          currentPromptKind,
                      )
                    : currentPromptKind,
        }

        setProgress(
            (previousProgress) => ({
                ...previousProgress,

                [
                    getProgressKey(
                        currentObject.number,
                    )
                ]: nextObjectProgress,
            }),
        )

        const remainingQueue =
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
                    remainingQueue.length,
                )

            remainingQueue.splice(
                insertionIndex,
                0,
                currentObject.number,
            )
        }

        setQueue(
            remainingQueue,
        )

        setIsAnswerVisible(
            false,
        )
    }


    async function resetProgress() {
        const shouldReset =
            window.confirm(
                'Сбросить весь прогресс по объектам Мессье?',
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

        try {
            /*
            * Ждём завершения предыдущего
            * сохранения, чтобы старый PUT
            * не восстановил данные после DELETE.
            */
            await saveChainRef.current
                .catch(() => undefined)

            await clearMessierProgress(
                token,
            )

            if (userId !== null) {
                localStorage.removeItem(
                    getMessierProgressStorageKey(
                        userId,
                    ),
                )
            }

            setProgress({})

            setQueue(
                buildQueue({}),
            )

            setIsAnswerVisible(
                false,
            )

            setSaveError('')
        } catch (error) {
            setSaveError(
                getProgressErrorMessage(
                    error,
                ),
            )
        }
    }


    function reshuffleRemainingObjects() {
        setQueue(
            (previousQueue) =>
                shuffle(
                    previousQueue,
                ),
        )

        setIsAnswerVisible(
            false,
        )
    }


    if (
        !currentObject
        || !currentProgress
        || !currentPromptKind
    ) {
        return (
            <section className="messier-complete">
                <p className="messier-card-kicker">
                    Колода завершена
                </p>

                <h3>
                    Все объекты выучены
                </h3>

                <p>
                    У каждого из{' '}
                    {messierObjects.length}{' '}
                    объектов набрана серия
                    из {REQUIRED_STREAK}{' '}
                    правильных ответов подряд
                    с чередованием двух
                    направлений.
                </p>

                <button
                    className="
                        messier-button
                        messier-button--secondary
                    "
                    onClick={resetProgress}
                    type="button"
                >
                    Начать заново
                </button>
            </section>
        )
    }


    const objectImageUrl =
        getAssetUrl(
            currentObject.objectImage,
        )

    const positionImageUrl =
        getAssetUrl(
            currentObject.positionImage,
        )


    return (
        <section className="messier-trainer">
            <div className="messier-toolbar">
                <div className="messier-stat">
                    <span>
                        Объектов в очереди
                    </span>

                    <strong>
                        {queue.length}
                    </strong>
                </div>


                <div className="messier-stat">
                    <span>
                        Выучено объектов
                    </span>

                    <strong>
                        {learnedObjectsCount}
                        /{messierObjects.length}
                    </strong>
                </div>


                <div className="messier-stat">
                    <span>
                        Серия объекта
                    </span>

                    <strong>
                        {currentProgress.streak}
                        /{REQUIRED_STREAK}
                    </strong>
                </div>


                <div className="messier-toolbar-actions">
                    <button
                        onClick={
                            reshuffleRemainingObjects
                        }
                        type="button"
                    >
                        Перемешать
                    </button>

                    <button
                        onClick={
                            resetProgress
                        }
                        type="button"
                    >
                        Сбросить прогресс
                    </button>
                </div>
            </div>


            <p className="messier-training-note">
                Направления чередуются
                автоматически. Объект считается
                выученным после серии из{' '}
                {REQUIRED_STREAK} правильных
                ответов подряд.
            </p>

            {saveError ? (
                <p className="messier-training-note">
                    Ошибка сохранения: {saveError}
                </p>
            ) : null}


            <article className="messier-study-card">
                {!isAnswerVisible ? (
                    <div className="messier-question">
                        <p className="messier-card-kicker">
                            {currentPromptKind
                                === 'name'
                                ? (
                                    'Название → объект и положение'
                                )
                                : (
                                    'Положение на карте → название'
                                )}
                        </p>


                        {currentPromptKind
                            === 'name' ? (
                            <>
                                <h3>
                                    {currentObject.title}
                                </h3>

                                <p className="messier-question-hint">
                                    Вспомни внешний вид
                                    объекта и его положение
                                    на карте неба.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="messier-question-title">
                                    Какой это объект
                                    Мессье?
                                </p>

                                {positionImageUrl ? (
                                    <img
                                        alt="
                                            Положение объекта
                                            Мессье на карте неба
                                        "
                                        className="
                                            messier-position-prompt
                                        "
                                        src={
                                            positionImageUrl
                                        }
                                    />
                                ) : (
                                    <p className="messier-question-hint">
                                        Карта положения
                                        отсутствует.
                                    </p>
                                )}
                            </>
                        )}


                        <button
                            className="
                                messier-button
                                messier-button--primary
                            "
                            onClick={() =>
                                setIsAnswerVisible(
                                    true,
                                )
                            }
                            type="button"
                        >
                            Показать ответ
                        </button>
                    </div>
                ) : (
                    <div className="messier-answer">
                        <header className="messier-answer-header">
                            <div>
                                <p className="messier-card-kicker">
                                    Ответ
                                </p>

                                <h3>
                                    {currentObject.title}
                                </h3>
                            </div>
                        </header>


                        <div className="messier-answer-content">
                            <div className="messier-visuals">
                                <figure className="messier-image-panel">
                                    <figcaption>
                                        Изображение объекта
                                    </figcaption>

                                    {objectImageUrl ? (
                                        <img
                                            alt={
                                                `Объект ${currentObject.title}`
                                            }
                                            src={
                                                objectImageUrl
                                            }
                                        />
                                    ) : (
                                        <div className="messier-missing-image">
                                            В исходной колоде
                                            нет фотографии
                                            объекта M40
                                        </div>
                                    )}
                                </figure>


                                <figure className="messier-image-panel">
                                    <figcaption>
                                        Положение на карте
                                        неба
                                    </figcaption>

                                    {positionImageUrl ? (
                                        <img
                                            alt={
                                                `Положение ${currentObject.title} на карте неба`
                                            }
                                            src={
                                                positionImageUrl
                                            }
                                        />
                                    ) : (
                                        <div className="messier-missing-image">
                                            Карта положения
                                            отсутствует
                                        </div>
                                    )}
                                </figure>
                            </div>


                            <dl className="messier-details">
                                <div>
                                    <dt>
                                        Созвездие
                                    </dt>

                                    <dd>
                                        {
                                            currentObject
                                                .constellation
                                        }
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Прямое восхождение
                                    </dt>

                                    <dd>
                                        {
                                            currentObject
                                                .rightAscension
                                        }
                                    </dd>
                                </div>

                                <div>
                                    <dt>
                                        Склонение
                                    </dt>

                                    <dd>
                                        {
                                            currentObject
                                                .declination
                                        }
                                    </dd>
                                </div>
                            </dl>
                        </div>


                        <div className="messier-answer-actions">
                            <button
                                className="
                                    messier-button
                                    messier-button--wrong
                                "
                                onClick={() =>
                                    answerCurrentObject(
                                        false,
                                    )
                                }
                                type="button"
                            >
                                Не знаю

                                <span>
                                    Серия обнулится
                                </span>
                            </button>


                            <button
                                className="
                                    messier-button
                                    messier-button--correct
                                "
                                onClick={() =>
                                    answerCurrentObject(
                                        true,
                                    )
                                }
                                type="button"
                            >
                                Знаю

                                <span>
                                    Серия станет{' '}
                                    {Math.min(
                                        currentProgress
                                            .streak + 1,
                                        REQUIRED_STREAK,
                                    )}
                                    /{REQUIRED_STREAK}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </article>


            <p className="messier-source-note">
                Карточки сделаны Сашей лапочкой
            </p>
        </section>
    )
}


export default MessierTrainer