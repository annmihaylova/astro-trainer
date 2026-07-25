function StarsPage() {
    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <p className="module-kicker">Карточки</p>
                <h2>Основные звёзды</h2>
                <p>
                    Здесь будет система интервального повторения основных
                    звёзд. Позже сюда загрузим твои карточки из Anki.
                </p>
            </div>

            <div className="study-workspace">
                <div className="study-toolbar">
                    <span>Новых карточек: 0</span>
                    <span>На повторении: 0</span>
                    <span>Выучено: 0</span>
                </div>

                <div className="study-card-preview">
                    <p className="study-card-label">
                        Карточки ещё не загружены
                    </p>
                    <h3>Основные звёзды</h3>
                    <p>
                        После загрузки колоды здесь будет показываться передняя
                        сторона текущей карточки.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default StarsPage