function MessierPage() {
    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <p className="module-kicker">Карточки</p>
                <h2>Объекты Мессье</h2>
                <p>
                    Здесь будут карточки с фотографией объекта, его номером,
                    типом и созвездием.
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
                    <h3>Каталог Мессье</h3>
                    <p>
                        После загрузки колоды здесь будет находиться изображение
                        случайного объекта.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default MessierPage