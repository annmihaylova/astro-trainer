import { useEffect, useMemo, useState } from 'react'
import { messierObjects } from '../data/messierObjects'
import './MessierTrainer.css'

type PromptKind = 'name' | 'position'

type TrainingCard = {
    id: string
    objectNumber: number
    promptKind: PromptKind
}

type CardProgress = {
    streak: number
    correctAnswers: number
    wrongAnswers: number
    learned: boolean
}

type ProgressMap = Record<string, CardProgress>

const STORAGE_KEY = 'astro-trainer:messier-progress:v3'

// Поменяй 10 на 5, если решишь, что пяти правильных ответов подряд достаточно.
const REQUIRED_STREAK = 10

// Сколько других карточек должно пройти до следующего показа.
// Чем длиннее серия «Знаю», тем позже карточка вернётся.
const REVIEW_GAPS = [5, 7, 10, 15, 20, 30, 40, 50, 80, 120] as const

const allTrainingCards: TrainingCard[] = messierObjects.flatMap((object) => {
    const cards: TrainingCard[] = [
        {
            id: `m${object.number}-name`,
            objectNumber: object.number,
            promptKind: 'name',
        },
    ]

    if (object.positionImage) {
        cards.push({
            id: `m${object.number}-position`,
            objectNumber: object.number,
            promptKind: 'position',
        })
    }

    return cards
})

const objectsByNumber = new Map(
    messierObjects.map((object) => [object.number, object]),
)

const cardIdsByObject = new Map(
    messierObjects.map((object) => [
        object.number,
        allTrainingCards
            .filter((card) => card.objectNumber === object.number)
            .map((card) => card.id),
    ]),
)

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
        const savedProgress = localStorage.getItem(STORAGE_KEY)

        if (!savedProgress) {
            return {}
        }

        return JSON.parse(savedProgress) as ProgressMap
    } catch {
        return {}
    }
}

function buildQueue(progress: ProgressMap): string[] {
    const unlearnedCardIds = allTrainingCards
        .filter((card) => !progress[card.id]?.learned)
        .map((card) => card.id)

    return shuffle(unlearnedCardIds)
}

function getAssetUrl(path: string | null): string | null {
    if (!path) {
        return null
    }

    return `${import.meta.env.BASE_URL}${path}`
}

function MessierTrainer() {
    const initialProgress = useMemo(() => loadProgress(), [])

    const [progress, setProgress] = useState<ProgressMap>(initialProgress)
    const [queue, setQueue] = useState<string[]>(() =>
        buildQueue(initialProgress),
    )
    const [isAnswerVisible, setIsAnswerVisible] = useState(false)

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }, [progress])

    const currentCard = useMemo(() => {
        const currentCardId = queue[0]

        return allTrainingCards.find((card) => card.id === currentCardId)
    }, [queue])

    const currentObject = currentCard
        ? objectsByNumber.get(currentCard.objectNumber)
        : undefined

    const learnedCardsCount = allTrainingCards.filter(
        (card) => progress[card.id]?.learned,
    ).length

    const learnedObjectsCount = messierObjects.filter((object) => {
        const objectCardIds = cardIdsByObject.get(object.number) ?? []

        return objectCardIds.every((cardId) => progress[cardId]?.learned)
    }).length

    const currentProgress = currentCard
        ? progress[currentCard.id] ?? {
              streak: 0,
              correctAnswers: 0,
              wrongAnswers: 0,
              learned: false,
          }
        : undefined

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
        const shouldReset = window.confirm(
            'Сбросить весь прогресс по объектам Мессье?',
        )

        if (!shouldReset) {
            return
        }

        localStorage.removeItem(STORAGE_KEY)
        setProgress({})
        setQueue(buildQueue({}))
        setIsAnswerVisible(false)
    }

    function reshuffleRemainingCards() {
        setQueue((previousQueue) => shuffle(previousQueue))
        setIsAnswerVisible(false)
    }

    if (!currentCard || !currentObject || !currentProgress) {
        return (
            <section className="messier-complete">
                <p className="messier-card-kicker">Колода завершена</p>
                <h3>Все карточки выучены</h3>
                <p>
                    У каждой из {allTrainingCards.length} карточек набрана серия
                    из {REQUIRED_STREAK} правильных ответов подряд.
                </p>

                <button
                    className="messier-button messier-button--secondary"
                    onClick={resetProgress}
                    type="button"
                >
                    Начать заново
                </button>
            </section>
        )
    }

    const objectImageUrl = getAssetUrl(currentObject.objectImage)
    const positionImageUrl = getAssetUrl(currentObject.positionImage)

    return (
        <section className="messier-trainer">
            <div className="messier-toolbar">
                <div className="messier-stat">
                    <span>В очереди</span>
                    <strong>{queue.length}</strong>
                </div>

                <div className="messier-stat">
                    <span>Выучено карточек</span>
                    <strong>
                        {learnedCardsCount}/{allTrainingCards.length}
                    </strong>
                </div>

                <div className="messier-stat">
                    <span>Выучено объектов</span>
                    <strong>
                        {learnedObjectsCount}/{messierObjects.length}
                    </strong>
                </div>

                <div className="messier-stat">
                    <span>Серия текущей</span>
                    <strong>
                        {currentProgress.streak}/{REQUIRED_STREAK}
                    </strong>
                </div>

                <div className="messier-toolbar-actions">
                    <button onClick={reshuffleRemainingCards} type="button">
                        Перемешать
                    </button>

                    <button onClick={resetProgress} type="button">
                        Сбросить прогресс
                    </button>
                </div>
            </div>

            <article className="messier-study-card">
                {!isAnswerVisible ? (
                    <div className="messier-question">
                        <p className="messier-card-kicker">
                            {currentCard.promptKind === 'name'
                                ? 'Название → объект и положение'
                                : 'Положение на карте → название'}
                        </p>

                        {currentCard.promptKind === 'name' ? (
                            <>
                                <h3>{currentObject.title}</h3>
                                <p className="messier-question-hint">
                                    Вспомни внешний вид объекта и его положение
                                    на карте неба.
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="messier-question-title">
                                    Какой это объект Мессье?
                                </p>

                                {positionImageUrl ? (
                                    <img
                                        className="messier-position-prompt"
                                        src={positionImageUrl}
                                        alt="Положение объекта Мессье на карте неба"
                                    />
                                ) : (
                                    <p className="messier-question-hint">
                                        Карта положения отсутствует.
                                    </p>
                                )}
                            </>
                        )}

                        <button
                            className="messier-button messier-button--primary"
                            onClick={() => setIsAnswerVisible(true)}
                            type="button"
                        >
                            Показать ответ
                        </button>
                    </div>
                ) : (
                    <div className="messier-answer">
                        <header className="messier-answer-header">
                            <div>
                                <p className="messier-card-kicker">Ответ</p>
                                <h3>{currentObject.title}</h3>
                            </div>
                        </header>

                        <div className="messier-answer-content">
                            <div className="messier-visuals">
                                <figure className="messier-image-panel">
                                    <figcaption>Изображение объекта</figcaption>

                                    {objectImageUrl ? (
                                        <img
                                            src={objectImageUrl}
                                            alt={`Объект ${currentObject.title}`}
                                        />
                                    ) : (
                                        <div className="messier-missing-image">
                                            В исходной колоде нет фотографии
                                            объекта M40
                                        </div>
                                    )}
                                </figure>

                                <figure className="messier-image-panel">
                                    <figcaption>
                                        Положение на карте неба
                                    </figcaption>

                                    {positionImageUrl ? (
                                        <img
                                            src={positionImageUrl}
                                            alt={`Положение ${currentObject.title} на карте неба`}
                                        />
                                    ) : (
                                        <div className="messier-missing-image">
                                            Карта положения отсутствует
                                        </div>
                                    )}
                                </figure>
                            </div>

                            <dl className="messier-details">
                                <div>
                                    <dt>Созвездие</dt>
                                    <dd>{currentObject.constellation}</dd>
                                </div>

                                <div>
                                    <dt>Прямое восхождение</dt>
                                    <dd>{currentObject.rightAscension}</dd>
                                </div>

                                <div>
                                    <dt>Склонение</dt>
                                    <dd>{currentObject.declination}</dd>
                                </div>

                            </dl>
                        </div>

                        <div className="messier-answer-actions">
                            <button
                                className="messier-button messier-button--wrong"
                                onClick={() => answerCurrentCard(false)}
                                type="button"
                            >
                                Не знаю
                                <span>Серия обнулится</span>
                            </button>

                            <button
                                className="messier-button messier-button--correct"
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

            <p className="messier-source-note">
                Карточки сделаны Сашей лапочкой
            </p>
        </section>
    )
}

export default MessierTrainer
