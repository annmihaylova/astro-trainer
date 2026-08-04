import './DeckProgressStrip.css'


type DeckProgressStripProps = {
    title: string
    description: string
    total: number
    learned: number
    inProgress: number
    notStarted: number
    requiredStreak: number
    inProgressStreakCounts:
        readonly number[]
    totalLabel?: string
}


type ProgressSection = {
    key:
        | 'learned'
        | 'in-progress'
        | 'not-started'
    label: string
    count: number
}


function getInProgressColor(
    streak: number,
    requiredStreak: number,
): string {
    const maximumStreak = Math.max(
        1,
        requiredStreak - 1,
    )

    const normalizedProgress =
        maximumStreak === 1
            ? 0
            : (
                Math.min(
                    maximumStreak,
                    Math.max(1, streak),
                ) - 1
            ) / (
                maximumStreak - 1
            )

    /*
     * 1/16 — светло-жёлтый.
     * 15/16 — тёмно-оранжевый.
     */
    const hue =
        51 - normalizedProgress * 26

    const saturation =
        96 - normalizedProgress * 8

    const lightness =
        80 - normalizedProgress * 34

    return (
        `hsl(${hue} `
        + `${saturation}% `
        + `${lightness}%)`
    )
}


function buildInProgressGradient(
    streakCounts: readonly number[],
    requiredStreak: number,
): string {
    const populatedStreaks =
        streakCounts
            .map((count, index) => ({
                streak: index + 1,
                count,
            }))
            .filter(
                (entry) =>
                    entry.count > 0,
            )

    const totalCount =
        populatedStreaks.reduce(
            (sum, entry) =>
                sum + entry.count,
            0,
        )

    if (
        totalCount === 0
        || populatedStreaks.length === 0
    ) {
        return (
            'linear-gradient('
            + '105deg, '
            + getInProgressColor(
                1,
                requiredStreak,
            )
            + ', '
            + getInProgressColor(
                requiredStreak - 1,
                requiredStreak,
            )
            + ')'
        )
    }

    let completedCount = 0
    const stops: string[] = []

    for (const entry of populatedStreaks) {
        const startPercentage =
            completedCount
            / totalCount
            * 100

        completedCount += entry.count

        const endPercentage =
            completedCount
            / totalCount
            * 100

        const color = getInProgressColor(
            entry.streak,
            requiredStreak,
        )

        /*
         * Две одинаковые точки создают
         * участок цвета, длина которого
         * равна числу объектов с таким streak.
         */
        stops.push(
            `${color} `
            + `${startPercentage.toFixed(2)}%`,
        )

        stops.push(
            `${color} `
            + `${endPercentage.toFixed(2)}%`,
        )
    }

    return (
        'linear-gradient('
        + '105deg, '
        + stops.join(', ')
        + ')'
    )
}


function DeckProgressStrip({
    title,
    description,
    total,
    learned,
    inProgress,
    notStarted,
    requiredStreak,
    inProgressStreakCounts,
    totalLabel = 'Всего объектов',
}: DeckProgressStripProps) {
    const learnedPercentage =
        total === 0
            ? 0
            : Math.round(
                  learned / total * 100,
              )

    const inProgressGradient =
        buildInProgressGradient(
            inProgressStreakCounts,
            requiredStreak,
        )

    const sections: ProgressSection[] = [
        {
            key: 'learned',
            label: 'Выучено',
            count: learned,
        },
        {
            key: 'in-progress',
            label: 'В процессе',
            count: inProgress,
        },
        {
            key: 'not-started',
            label: 'Не начато',
            count: notStarted,
        },
    ]


    return (
        <article className="deck-progress-card">
            <header className="deck-progress-heading">
                <div>
                    <p className="deck-progress-kicker">
                        Колода
                    </p>

                    <h3>{title}</h3>

                    <p>{description}</p>
                </div>

                <div className="deck-progress-percentage">
                    <strong>
                        {learnedPercentage}%
                    </strong>

                    <span>
                        полностью выучено
                    </span>
                </div>
            </header>


            <div
                aria-label={
                    `${title}: выучено ${learned} из ${total}, `
                    + `в процессе ${inProgress} из ${total}, `
                    + `не начато ${notStarted} из ${total}`
                }
                className="deck-progress-bar-shell"
                role="group"
            >
                <div className="deck-progress-bar">
                    {sections.map((section) => {
                        if (section.count === 0) {
                            return null
                        }

                        const tooltip =
                            `${section.label}: `
                            + `${section.count} из ${total}`

                        return (
                            <span
                                aria-label={tooltip}
                                className={
                                    'deck-progress-section '
                                    + `deck-progress-section--${section.key}`
                                }
                                key={section.key}
                                role="img"
                                style={{
                                    flexGrow:
                                        section.count,

                                    background:
                                        section.key
                                        === 'in-progress'
                                            ? inProgressGradient
                                            : undefined,
                                }}
                                tabIndex={0}
                                title={tooltip}
                            >
                                <span
                                    aria-hidden="true"
                                    className="deck-progress-tooltip"
                                >
                                    {section.label}:{' '}
                                    <strong>
                                        {section.count}
                                    </strong>{' '}
                                    из {total}
                                </span>
                            </span>
                        )
                    })}
                </div>
            </div>


            <div className="deck-progress-legend">
                <div className="deck-progress-legend-item">
                    <span
                        className="
                            deck-progress-legend-dot
                            deck-progress-legend-dot--learned
                        "
                    />

                    <div>
                        <span>Выучено</span>
                        <strong>{learned}</strong>
                    </div>
                </div>


                <div className="deck-progress-legend-item">
                    <span
                        className="
                            deck-progress-legend-dot
                            deck-progress-legend-dot--progress
                        "
                    />

                    <div>
                        <span>В процессе</span>
                        <strong>{inProgress}</strong>
                    </div>
                </div>


                <div className="deck-progress-legend-item">
                    <span
                        className="
                            deck-progress-legend-dot
                            deck-progress-legend-dot--empty
                        "
                    />

                    <div>
                        <span>Не начато</span>
                        <strong>{notStarted}</strong>
                    </div>
                </div>


                <div className="deck-progress-total">
                    {totalLabel}: {total}
                </div>
            </div>
        </article>
    )
}


export default DeckProgressStrip
