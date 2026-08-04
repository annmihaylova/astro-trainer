import type {
    ProgressStatus,
    ProgressStripItem,
} from '../progress/messierProgress'
import './DeckProgressStrip.css'


type DeckProgressStripProps = {
    title: string
    description: string
    total: number
    learned: number
    inProgress: number
    notStarted: number
    requiredStreak: number
    items: ProgressStripItem[]
    totalLabel?: string
}


function getInProgressColor(
    ratio: number,
): string {
    const hue =
        38 + ratio * 10

    const saturation =
        68 + ratio * 24

    const lightness =
        43 + ratio * 14

    return (
        `hsl(${hue} `
        + `${saturation}% `
        + `${lightness}%)`
    )
}


function getSegmentColor(
    item: ProgressStripItem,
): string {
    if (item.status === 'learned') {
        return '#5ed49a'
    }

    if (
        item.status === 'in-progress'
    ) {
        return getInProgressColor(
            item.ratio,
        )
    }

    return 'rgba(255, 255, 255, 0.11)'
}


function getStatusLabel(
    status: ProgressStatus,
): string {
    if (status === 'learned') {
        return 'Выучено'
    }

    if (status === 'in-progress') {
        return 'В процессе'
    }

    return 'Не начато'
}


function DeckProgressStrip({
    title,
    description,
    total,
    learned,
    inProgress,
    notStarted,
    requiredStreak,
    items,
    totalLabel = 'Всего объектов',
}: DeckProgressStripProps) {
    const learnedPercentage =
        total === 0
            ? 0
            : Math.round(
                  learned / total * 100,
              )


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


            <div className="deck-progress-bar-viewport">
                <div
                    aria-label={
                        `${title}: выучено ${learned}, `
                        + `в процессе ${inProgress}, `
                        + `не начато ${notStarted}`
                    }
                    className="deck-progress-bar"
                    role="img"
                    style={{
                        gridTemplateColumns:
                            `repeat(${items.length}, `
                            + 'minmax(4px, 1fr))',
                    }}
                >
                    {items.map((item) => {
                        const tooltip =
                            item.status
                            === 'not-started'
                                ? (
                                    `${item.label}: `
                                    + 'не начато'
                                )
                                : (
                                    `${item.label}: `
                                    + `${getStatusLabel(
                                        item.status,
                                    )}, `
                                    + `серия `
                                    + `${item.streak}`
                                    + `/${requiredStreak}`
                                )

                        return (
                            <span
                                aria-label={tooltip}
                                className={
                                    'deck-progress-segment '
                                    + `deck-progress-segment--${item.status}`
                                }
                                key={item.id}
                                style={{
                                    backgroundColor:
                                        getSegmentColor(
                                            item,
                                        ),
                                }}
                                title={tooltip}
                            />
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
