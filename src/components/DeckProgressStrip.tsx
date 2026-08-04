import './DeckProgressStrip.css'


type DeckProgressStripProps = {
    title: string
    description: string
    total: number
    learned: number
    inProgress: number
    notStarted: number
    totalLabel?: string
}


type ProgressSection = {
    key: 'learned' | 'in-progress' | 'not-started'
    label: string
    count: number
}


function DeckProgressStrip({
    title,
    description,
    total,
    learned,
    inProgress,
    notStarted,
    totalLabel = 'Всего объектов',
}: DeckProgressStripProps) {
    const learnedPercentage =
        total === 0
            ? 0
            : Math.round(
                  learned / total * 100,
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
