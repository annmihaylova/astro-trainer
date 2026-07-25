const theoryTopics = [
    {
        title: 'Небесные координаты',
        description:
            'Высота, азимут, склонение, прямое восхождение и часовой угол.',
    },
    {
        title: 'Звёздное время',
        description:
            'Связь местного звёздного времени, прямого восхождения и часового угла.',
    },
    {
        title: 'Чтение скайчартов',
        description:
            'Направления, горизонт, зенит, движение неба и видимость объектов.',
    },
]

function TheoryPage() {
    return (
        <section className="nabla-content-page">
            <div className="nabla-intro">
                <p className="module-kicker">Конспекты</p>
                <h2>Теоретическая часть</h2>
                <p>
                    Краткие материалы, которые можно быстро повторить перед
                    наблюдательным туром.
                </p>
            </div>

            <div className="theory-list">
                {theoryTopics.map((topic, index) => (
                    <article className="theory-topic" key={topic.title}>
                        <span>0{index + 1}</span>

                        <div>
                            <h3>{topic.title}</h3>
                            <p>{topic.description}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default TheoryPage