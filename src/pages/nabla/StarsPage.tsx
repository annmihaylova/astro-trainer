import StarsTrainer from '../../components/StarsTrainer'

function StarsPage() {
    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <p className="module-kicker">Карточки</p>
                <h2>Звёзды</h2>
                <p>
                    Два направления повторения: название → обозначение и
                    положение, а также обозначение и положение → название.
                    Можно изучать только 117 основных звёзд или всю колоду из
                    229 звёзд.
                </p>
            </div>

            <StarsTrainer />
        </section>
    )
}

export default StarsPage
