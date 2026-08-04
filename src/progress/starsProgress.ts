import type {
    StarsProgressItem,
} from '../api/starsProgress'
import {
    mainStars,
    stars,
    type Star,
} from '../data/stars'


export type StarsProgressOverview = {
    total: number
    learned: number
    inProgress: number
    notStarted: number
    requiredStreak: number
    inProgressStreakCounts:
        number[]
}


export type StarsProgressOverviews = {
    main: StarsProgressOverview
    all: StarsProgressOverview
}


const REQUIRED_STREAK = 16


function buildStarsOverview(
    deckStars: readonly Star[],
    progressByItemId:
        ReadonlyMap<
            string,
            StarsProgressItem
        >,
): StarsProgressOverview {
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

    for (const star of deckStars) {
        const progress =
            progressByItemId.get(
                star.id,
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
             * Начатый объект со streak 0
             * отображается самым светлым
             * оттенком уровня 1/16.
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

    const total = deckStars.length

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


export function getStarsProgressOverviews(
    items: readonly StarsProgressItem[],
): StarsProgressOverviews {
    const progressByItemId = new Map(
        items.map((item) => [
            item.item_id,
            item,
        ]),
    )

    return {
        main: buildStarsOverview(
            mainStars,
            progressByItemId,
        ),

        all: buildStarsOverview(
            stars,
            progressByItemId,
        ),
    }
}
