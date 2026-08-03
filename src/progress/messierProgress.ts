import type {
    MessierProgressItem,
} from '../api/messierProgress'
import { messierObjects } from '../data/messierObjects'


export type ProgressStatus =
    | 'learned'
    | 'in-progress'
    | 'not-started'


type StoredObjectProgress = {
    streak: number
    correctAnswers: number
    wrongAnswers: number
    learned: boolean
}


type StoredProgressMap = Record<
    string,
    StoredObjectProgress
>


export type ProgressStripItem = {
    id: string
    label: string
    order: number
    status: ProgressStatus
    streak: number
    ratio: number
}


export type MessierProgressOverview = {
    total: number
    learned: number
    inProgress: number
    notStarted: number
    requiredStreak: number
    items: ProgressStripItem[]
}


const REQUIRED_STREAK = 16


export function getMessierProgressStorageKey(
    userId: number,
): string {
    return (
        'astro-trainer:messier-progress:'
        + `user-${userId}:v1`
    )
}


function getProgressKey(
    objectNumber: number,
): string {
    return `m${objectNumber}`
}


function loadStoredProgress(
    userId: number | null,
): StoredProgressMap {
    if (userId === null) {
        return {}
    }

    try {
        const storedValue =
            localStorage.getItem(
                getMessierProgressStorageKey(
                    userId,
                ),
            )

        if (!storedValue) {
            return {}
        }

        return JSON.parse(
            storedValue,
        ) as StoredProgressMap
    } catch {
        return {}
    }
}


function clamp(
    value: number,
    minimum: number,
    maximum: number,
): number {
    return Math.min(
        maximum,
        Math.max(minimum, value),
    )
}


export function getMessierProgressOverview(
    userId: number | null,
): MessierProgressOverview {
    const storedProgress =
        loadStoredProgress(userId)

    const items: ProgressStripItem[] =
        messierObjects.map((object) => {
            const progress =
                storedProgress[
                    getProgressKey(
                        object.number,
                    )
                ]

            const streak =
                progress?.streak ?? 0

            const hasStarted = Boolean(
                progress
                && (
                    progress.correctAnswers > 0
                    || progress.wrongAnswers > 0
                    || progress.streak > 0
                    || progress.learned
                ),
            )

            let status: ProgressStatus

            if (
                progress?.learned
                || streak >= REQUIRED_STREAK
            ) {
                status = 'learned'
            } else if (hasStarted) {
                status = 'in-progress'
            } else {
                status = 'not-started'
            }

            return {
                id: getProgressKey(
                    object.number,
                ),
                label: object.title,
                order: object.number,
                status,
                streak,
                ratio: clamp(
                    streak / REQUIRED_STREAK,
                    0,
                    1,
                ),
            }
        })


    const statusOrder:
        Record<ProgressStatus, number> = {
        learned: 0,
        'in-progress': 1,
        'not-started': 2,
    }


    items.sort((firstItem, secondItem) => {
        const statusDifference =
            statusOrder[firstItem.status]
            - statusOrder[secondItem.status]

        if (statusDifference !== 0) {
            return statusDifference
        }

        if (
            firstItem.status
            === 'in-progress'
        ) {
            return (
                secondItem.ratio
                - firstItem.ratio
            )
        }

        return (
            firstItem.order
            - secondItem.order
        )
    })


    const learned = items.filter(
        (item) =>
            item.status === 'learned',
    ).length

    const inProgress = items.filter(
        (item) =>
            item.status === 'in-progress',
    ).length

    const total = items.length

    return {
        total,
        learned,
        inProgress,
        notStarted:
            total
            - learned
            - inProgress,
        requiredStreak:
            REQUIRED_STREAK,
        items,
    }
}


export function messierItemsToStoredProgress(
    items: readonly MessierProgressItem[],
): StoredProgressMap {
    const progress: StoredProgressMap = {}

    for (const item of items) {
        progress[item.item_id] = {
            streak: item.streak,
            correctAnswers:
                item.correct_answers,
            wrongAnswers:
                item.wrong_answers,
            learned: item.learned,
        }
    }

    return progress
}