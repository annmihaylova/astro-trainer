import './App.css'

const trainingSections = [
  {
        number: '01',
        title: 'Теоретический тур',
        subtitle: 'Задачи и повторение',
        description:
            'Сложная теория, решения старых квалов и материалы для повторения.',
        topics: [
            'Астрономический дивертисмент',
            'Краткие конспекты сложных тем',
            'Подборки по темам',
        ],
        theme: 'green',
    },
    {
        number: '02',
        title: 'Практический тур',
        subtitle: 'Python и анализ данных',
        description:
            'Разбор практических заданий и краткий справочник по библиотекам, которые постоянно используются на турах.',
        topics: [
            'Краткий справочник по Python',
            'Решения практических туров предыдущих годов',
        ],
        theme: 'orange',
    },
    {
        number: '03',
        title: 'Наблюдательный тур',
        subtitle: 'Небо и ориентирование',
        description:
            'Ускоренная подготовка к наблюдательному туру: объекты, звёзды, координаты и работа с картой неба.',
        topics: [
            'Объекты Мессье',
            'Основные звёзды',
            'Скайчарты',
            'Теоретическая часть'
        ],
        theme: 'violet',
    },
    {
        number: '04',
        title: 'Блиц',
        subtitle: 'Формулы и быстрые вопросы',
        description:
            'Карточки для быстрого повторения формул и прокачки мат аппарата перед отбором.',
        topics: [
            'Основные формулы',
            'Теоретическая часть',
        ],
        theme: 'blue',
    },
    
    
] as const

function App() {
    return (
        <div className="app-shell" id="top">
            <header className="site-header">
                <a className="brand" href="#top">
                    <span className="brand-mark" aria-hidden="true">
                        ✦
                    </span>
                    <span>Astro Trainer</span>
                </a>

                <nav className="main-navigation" aria-label="Основная навигация">
                    <a href="#sections">Разделы</a>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <div className="hero-content">
                        <p className="eyebrow">
                            Подготовка к отборам на международные олимпиады по астрономии и астрофизике
                        </p>

                        <h1>
                            Astro Trainer
                        </h1>

                        <p className="hero-description">
                            Сайт для подготовки и быстрого повторения перед отборами.
                        </p>

                        <div className="hero-actions">
                            <a
                                className="button button-primary"
                                href="#sections"
                            >
                                Начать подготовку
                            </a>

                        </div>

                        <div className="hero-note">
                            <span className="hero-note-dot" />
                            Проект находится в активной разработке
                        </div>
                    </div>
                </section>

                <section className="sections-block" id="sections">
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">Четыре направления</p>
                            <h2>Всё нужное для отбора</h2>
                        </div>

                        <p>
                            Каждый раздел решает отдельную задачу: быстро
                            вспомнить, отработать навык или подробно разобраться
                            в теме.
                        </p>
                    </div>

                    <div className="cards-grid">
                        {trainingSections.map((section) => (
                            <article
                                className={`training-card training-card--${section.theme}`}
                                key={section.title}
                            >
                                <div className="card-top">
                                    <span className="card-number">
                                        {section.number}
                                    </span>
                                </div>

                                <p className="card-subtitle">
                                    {section.subtitle}
                                </p>

                                <h3>{section.title}</h3>

                                <p className="card-description">
                                    {section.description}
                                </p>

                                <ul className="topics-list">
                                    {section.topics.map((topic) => (
                                        <li key={topic}>{topic}</li>
                                    ))}
                                </ul>

                                <div className="card-footer">
                                    <span>Перейти к разделу</span>
                                    <span aria-hidden="true">↗</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

            </main>

            <footer className="site-footer">
                <a className="brand footer-brand" href="#top">
                    <span className="brand-mark" aria-hidden="true">
                        ✦
                    </span>
                    <span>Astro Trainer</span>
                </a>

            </footer>
        </div>
    )
}

export default App