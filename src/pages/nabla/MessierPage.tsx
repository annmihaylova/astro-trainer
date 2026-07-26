import MessierTrainer from '../../components/MessierTrainer'

function MessierPage() {
    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <p className="module-kicker">Карточки</p>
                <h2>Объекты Мессье</h2>
                <p>
                    Два направления повторения: название → объект и положение,
                    а также положение на карте → название. 
                </p>
            </div>

            <MessierTrainer />
        </section>
    )
}

export default MessierPage
