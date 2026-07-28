import { useEffect, useMemo, useState } from 'react'
import { mainStars, stars, type Star } from '../data/stars'
import './StarsTrainer.css'

type StudyMode = 'main' | 'all'
type PromptKind = 'name' | 'position'

type TrainingCard = {
    id: string
    starId: string
    promptKind: PromptKind
}

type CardProgress = {
    streak: number
    correctAnswers: number
    wrongAnswers: number
    learned: boolean
}

type ProgressMap = Record<string, CardProgress>

const PROGRESS_STORAGE_KEY = 'astro-trainer:stars-progress:v1'
const MODE_STORAGE_KEY = 'astro-trainer:stars-mode:v1'

// Карточка считается выученной после десяти правильных ответов подряд.
const REQUIRED_STREAK = 10

// Через сколько других карточек снова показать текущую карточку.
// При каждом следующем правильном ответе интервал становится длиннее.
const REVIEW_GAPS = [5, 7, 10, 15, 20, 30, 40, 50, 80, 120] as const

const allTrainingCards: TrainingCard[] = stars.flatMap((star) => [
    {
        id: `${star.id}-name`,
        starId: star.id,
        promptKind: 'name' as const,
    },
    {
        id: `${star.id}-position`,
        starId: star.id,
        promptKind: 'position' as const,
    },
])

const starsById = new Map(stars.map((star) => [star.id, star]))
const trainingCardsById = new Map(
    allTrainingCards.map((card) => [card.id, card]),
)

const cardIdsByStar = new Map(
    stars.map((star) => [
        star.id,
        allTrainingCards
            .filter((card) => card.starId === star.id)
            .map((card) => card.id),
    ]),
)

const mainStarIds = new Set(mainStars.map((star) => star.id))

const trainingCardsByMode: Record<StudyMode, readonly TrainingCard[]> = {
    main: allTrainingCards.filter((card) => mainStarIds.has(card.starId)),
    all: allTrainingCards,
}

const starsByMode: Record<StudyMode, readonly Star[]> = {
    main: mainStars,
    all: stars,
}

function shuffle<T>(items: readonly T[]): T[] {
    const result = [...items]

    for (let index = result.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1))
        const temporary = result[index]

        result[index] = result[randomIndex]
        result[randomIndex] = temporary
    }

    return result
}

function loadProgress(): ProgressMap {
    try {
        const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY)

        if (!savedProgress) {
            return {}
        }

        return JSON.parse(savedProgress) as ProgressMap
    } catch {
        return {}
    }
}

function loadStudyMode(): StudyMode {
    try {
        const savedMode = localStorage.getItem(MODE_STORAGE_KEY)

        return savedMode === 'all' ? 'all' : 'main'
    } catch {
        return 'main'
    }
}

function buildQueue(
    trainingCards: readonly TrainingCard[],
    progress: ProgressMap,
): string[] {
    const unlearnedCardIds = trainingCards
        .filter((card) => !progress[card.id]?.learned)
        .map((card) => card.id)

    return shuffle(unlearnedCardIds)
}

function getAssetUrl(path: string): string {
    return `${import.meta.env.BASE_URL}${path}`
}

function StarsTrainer() {
    const initialProgress = useMemo(() => loadProgress(), [])
    const initialStudyMode = useMemo(() => loadStudyMode(), [])

    const [progress, setProgress] = useState<ProgressMap>(initialProgress)
    const [studyMode, setStudyMode] =
        useState<StudyMode>(initialStudyMode)
    const [queue, setQueue] = useState<string[]>(() =>
        buildQueue(trainingCardsByMode[initialStudyMode], initialProgress),
    )
    const [isAnswerVisible, setIsAnswerVisible] = useState(false)

    useEffect(() => {
        localStorage.setItem(
            PROGRESS_STORAGE_KEY,
            JSON.stringify(progress),
        )
    }, [progress])

    useEffect(() => {
        localStorage.setItem(MODE_STORAGE_KEY, studyMode)
    }, [studyMode])

    const activeStars = starsByMode[studyMode]
    const activeTrainingCards = trainingCardsByMode[studyMode]

    const currentCard = queue[0]
        ? trainingCardsById.get(queue[0])
        : undefined
    const currentStar = currentCard
        ? starsById.get(currentCard.starId)
        : undefined

    const learnedCardsCount = activeTrainingCards.filter(
        (card) => progress[card.id]?.learned,
    ).length

    const learnedStarsCount = activeStars.filter((star) => {
        const starCardIds = cardIdsByStar.get(star.id) ?? []

        return starCardIds.every((cardId) => progress[cardId]?.learned)
    }).length

    const currentProgress = currentCard
        ? progress[currentCard.id] ?? {
              streak: 0,
              correctAnswers: 0,
              wrongAnswers: 0,
              learned: false,
          }
        : undefined

    function changeStudyMode(nextMode: StudyMode) {
        if (nextMode === studyMode) {
            return
        }

        setStudyMode(nextMode)
        setQueue(buildQueue(trainingCardsByMode[nextMode], progress))
        setIsAnswerVisible(false)
    }

    function answerCurrentCard(knowsAnswer: boolean) {
        if (!currentCard || !currentProgress) {
            return
        }

        const nextStreak = knowsAnswer ? currentProgress.streak + 1 : 0
        const learned = knowsAnswer && nextStreak >= REQUIRED_STREAK

        const nextCardProgress: CardProgress = {
            streak: nextStreak,
            correctAnswers:
                currentProgress.correctAnswers + (knowsAnswer ? 1 : 0),
            wrongAnswers:
                currentProgress.wrongAnswers + (knowsAnswer ? 0 : 1),
            learned,
        }

        setProgress((previousProgress) => ({
            ...previousProgress,
            [currentCard.id]: nextCardProgress,
        }))

        const remainingQueue = queue.slice(1)

        if (!learned) {
            const gap = knowsAnswer
                ? REVIEW_GAPS[
                      Math.min(nextStreak - 1, REVIEW_GAPS.length - 1)
                  ]
                : 1
            const insertionIndex = Math.min(gap, remainingQueue.length)

            remainingQueue.splice(insertionIndex, 0, currentCard.id)
        }

        setQueue(remainingQueue)
        setIsAnswerVisible(false)
    }

    function resetProgress() {
        const modeLabel =
            studyMode === 'main' ? 'основным звёздам' : 'всей колоде'
        const shouldReset = window.confirm(
            `Сбросить прогресс по ${modeLabel}?`,
        )

        if (!shouldReset) {
            return
        }

        const activeCardIds = new Set(
            activeTrainingCards.map((card) => card.id),
        )
        const nextProgress = Object.fromEntries(
            Object.entries(progress).filter(
                ([cardId]) => !activeCardIds.has(cardId),
            ),
        ) as ProgressMap

        setProgress(nextProgress)
        setQueue(buildQueue(activeTrainingCards, nextProgress))
        setIsAnswerVisible(false)
    }

    function reshuffleRemainingCards() {
        setQueue((previousQueue) => shuffle(previousQueue))
        setIsAnswerVisible(false)
    }

    const modePicker = (
        <div className="stars-mode-picker" aria-label="Выбор колоды">
            <div className="stars-mode-copy">
                <p className="stars-card-kicker">Режим повторения</p>
                <h3>Какие звёзды изучать?</h3>
            </div>

            <div className="stars-mode-options" role="group">
                <button
                    aria-pressed={studyMode === 'main'}
                    className={
                        studyMode === 'main'
                            ? 'stars-mode-option stars-mode-option--active'
                            : 'stars-mode-option'
                    }
                    onClick={() => changeStudyMode('main')}
                    type="button"
                >
                    <strong>Только основные</strong>
                    <span>{mainStars.length} звёзд · {mainStars.length * 2} карточки</span>
                </button>

                <button
                    aria-pressed={studyMode === 'all'}
                    className={
                        studyMode === 'all'
                            ? 'stars-mode-option stars-mode-option--active'
                            : 'stars-mode-option'
                    }
                    onClick={() => changeStudyMode('all')}
                    type="button"
                >
                    <strong>Вся колода</strong>
                    <span>{stars.length} звёзд · {stars.length * 2} карточек</span>
                </button>
            </div>
        </div>
    )

    if (!currentCard || !currentStar || !currentProgress) {
        return (
            <section className="stars-trainer">
                {modePicker}

                <div className="stars-complete">
                    <p className="stars-card-kicker">Колода завершена</p>
                    <h3>Все карточки этого режима выучены</h3>
                    <p>
                        У каждой из {activeTrainingCards.length} карточек набрана
                        серия из {REQUIRED_STREAK} правильных ответов подряд.
                    </p>

                    <div className="stars-complete-actions">
                        {studyMode === 'main' ? (
                            <button
                                className="stars-button stars-button--primary"
                                onClick={() => changeStudyMode('all')}
                                type="button"
                            >
                                Перейти ко всей колоде
                            </button>
                        ) : null}

                        <button
                            className="stars-button stars-button--secondary"
                            onClick={resetProgress}
                            type="button"
                        >
                            Начать заново
                        </button>
                    </div>
                </div>
            </section>
        )
    }

    const positionImageUrl = getAssetUrl(currentStar.image)

    return (
        <section className="stars-trainer">
            {modePicker}

            <div className="stars-toolbar">
                <div className="stars-stat">
                    <span>В очереди</span>
                    <strong>{queue.length}</strong>
                </div>

                <div className="stars-stat">
                    <span>Выучено карточек</span>
                    <strong>
                        {learnedCardsCount}/{activeTrainingCards.length}
                    </strong>
                </div>

                <div className="stars-stat">
                    <span>Выучено звёзд</span>
                    <strong>
                        {learnedStarsCount}/{activeStars.length}
                    </strong>
                </div>

                <div className="stars-stat">
                    <span>Серия текущей</span>
                    <strong>
                        {currentProgress.streak}/{REQUIRED_STREAK}
                    </strong>
                </div>

                <div className="stars-toolbar-actions">
                    <button onClick={reshuffleRemainingCards} type="button">
                        Перемешать
                    </button>

                    <button onClick={resetProgress} type="button">
                        Сбросить прогресс
                    </button>
                </div>
            </div>

            <article className="stars-study-card">
                {!isAnswerVisible ? (
                    <div className="stars-question">
                        <p className="stars-card-kicker">
                            {currentCard.promptKind === 'name'
                                ? 'Название → обозначение и положение'
                                : 'Обозначение и положение → название'}
                        </p>

                        {currentCard.promptKind === 'name' ? (
                            <>
                                <h3>{currentStar.name}</h3>
                                <p className="stars-question-hint">
                                    Вспомни обозначение звезды и найди её на
                                    карте неба.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="stars-question-title">
                                    Как называется эта звезда?
                                </p>

                                <div className="stars-position-prompt">
                                    <strong>{currentStar.designation}</strong>
                                    <img
                                        src={positionImageUrl}
                                        alt="Положение звезды на карте неба"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            className="stars-button stars-button--primary"
                            onClick={() => setIsAnswerVisible(true)}
                            type="button"
                        >
                            Показать ответ
                        </button>
                    </div>
                ) : (
                    <div className="stars-answer">
                        <header className="stars-answer-header">
                            <div>
                                <p className="stars-card-kicker">Ответ</p>
                                <h3>{currentStar.name}</h3>
                            </div>

                            <span
                                className={
                                    currentStar.group === 'main'
                                        ? 'stars-group-badge stars-group-badge--main'
                                        : 'stars-group-badge'
                                }
                            >
                                {currentStar.group === 'main'
                                    ? 'Основная'
                                    : 'Дополнительная'}
                            </span>
                        </header>

                        <div className="stars-answer-content">
                            <figure className="stars-image-panel">
                                <figcaption>Положение на карте неба</figcaption>
                                <img
                                    src={positionImageUrl}
                                    alt={`Положение звезды ${currentStar.name} на карте неба`}
                                />
                            </figure>

                            <dl className="stars-details">
                                <div>
                                    <dt>Название</dt>
                                    <dd>{currentStar.name}</dd>
                                </div>

                                <div>
                                    <dt>Обозначение</dt>
                                    <dd>{currentStar.designation}</dd>
                                </div>

                                <div>
                                    <dt>Вопросов в выборке</dt>
                                    <dd>{currentStar.questionCount}</dd>
                                </div>

                                <div>
                                    <dt>Разных тестов</dt>
                                    <dd>{currentStar.testCount}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="stars-answer-actions">
                            <button
                                className="stars-button stars-button--wrong"
                                onClick={() => answerCurrentCard(false)}
                                type="button"
                            >
                                Не знаю
                                <span>Серия обнулится</span>
                            </button>

                            <button
                                className="stars-button stars-button--correct"
                                onClick={() => answerCurrentCard(true)}
                                type="button"
                            >
                                Знаю
                                <span>
                                    Серия станет{' '}
                                    {Math.min(
                                        currentProgress.streak + 1,
                                        REQUIRED_STREAK,
                                    )}
                                    /{REQUIRED_STREAK}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </article>

            <p className="stars-source-note">
                В колоду вошли 229 звёзд, встретившихся в выгруженной выборке
                тестов astroedu. Основными считаются 117 звёзд с частотой не ниже 15
                вопросов.
            </p>
        </section>
    )
}

export default StarsTrainer
