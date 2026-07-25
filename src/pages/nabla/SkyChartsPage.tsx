function SkyChartsPage() {
    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <p className="module-kicker">Тренажёр</p>
                <h2>Скайчарты</h2>
                <p>
                    Здесь будет генерироваться карта видимой части неба для
                    случайной широты и случайного звёздного времени.
                </p>
            </div>

            <div className="skychart-workspace">
                <aside className="skychart-controls">
                    <h3>Параметры карты</h3>

                    <div className="skychart-parameter">
                        <span>Широта</span>
                        <strong>Случайная</strong>
                    </div>

                    <div className="skychart-parameter">
                        <span>Звёздное время</span>
                        <strong>Случайное</strong>
                    </div>

                    <div className="skychart-parameter">
                        <span>Предельная величина</span>
                        <strong>6.5ᵐ</strong>
                    </div>

                    <button className="button button-primary" type="button">
                        Создать новую карту
                    </button>
                </aside>

                <div className="skychart-preview">
                    <div className="skychart-circle">
                        <span>Здесь появится карта неба</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SkyChartsPage