import {
    mainStars,
    stars,
    type Star,
} from '../data/stars'

import type {
    ProgressStatus,
    ProgressStripItem,
} from './messierProgress'


type StoredStarProgress = {
    streak: number
    correctAnswers: number
    wrongAnswers: number
    learned: boolean
}


type StoredProgressMap = Record<
    string,
    StoredStarProgress
>


export type StarsProgressOverview = {
    total: number
    learned: number
    inProgress: number
    notStarted: number
    requiredStreak: number
    items: ProgressStripItem[]
}


export type StarsProgressOverviews = {
    main: StarsProgressOverview
    all: StarsProgressOverview
}


const REQUIRED_STREAK = 16


function getStarsProgressStorageKey(
    userId: number,
): string {
    return (
        'astro-trainer:stars-progress:'
        + `user-${userId}:v1`
    )
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
                getStarsProgressStorageKey(
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


function buildStarsOverview(
    deckStars: readonly Star[],
    storedProgress: StoredProgressMap,
): StarsProgressOverview {
    const items: ProgressStripItem[] =
        deckStars.map((star, index) => {
            const progress =
                storedProgress[star.id]

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
                id: star.id,

                label:
                    `${star.name} · `
                    + star.designation,

                order: index,

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


export function getStarsProgressOverviews(
    userId: number | null,
): StarsProgressOverviews {
    const storedProgress =
        loadStoredProgress(userId)

    return {
        main: buildStarsOverview(
            mainStars,
            storedProgress,
        ),

        all: buildStarsOverview(
            stars,
            storedProgress,
        ),
    }
}