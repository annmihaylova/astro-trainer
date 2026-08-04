import type {
    MessierProgressItem,
} from '../api/messierProgress'
import { messierObjects } from '../data/messierObjects'


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


export type MessierProgressOverview = {
    total: number
    learned: number
    inProgress: number
    notStarted: number
    requiredStreak: number
    inProgressStreakCounts:
        number[]
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


export function getMessierProgressOverview(
    items: readonly MessierProgressItem[],
): MessierProgressOverview {
    const progressByItemId = new Map(
        items.map((item) => [
            item.item_id,
            item,
        ]),
    )

    const inProgressStreakCounts =
        Array.from(
            {
                length:
                    REQUIRED_STREAK - 1,
            },
            () => 0,
        )

    let learned = 0
    let inProgress = 0

    for (const object of messierObjects) {
        const progress =
            progressByItemId.get(
                getProgressKey(
                    object.number,
                ),
            )

        if (
            progress?.learned
            || (
                progress?.streak
                ?? 0
            ) >= REQUIRED_STREAK
        ) {
            learned += 1
            continue
        }

        if (
            progress
            && (
                progress.correct_answers > 0
                || progress.wrong_answers > 0
                || progress.streak > 0
            )
        ) {
            inProgress += 1

            /*
             * После ошибки streak может быть 0,
             * но объект уже начат. В полосе
             * показываем его как самый светлый
             * уровень 1/16.
             */
            const visualStreak = Math.min(
                REQUIRED_STREAK - 1,
                Math.max(
                    1,
                    progress.streak,
                ),
            )

            inProgressStreakCounts[
                visualStreak - 1
            ] += 1
        }
    }

    const total = messierObjects.length

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

        inProgressStreakCounts,
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
