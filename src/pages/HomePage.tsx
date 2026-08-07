import { Link } from 'react-router'

import './HomePage.css'


const trainingSections = [
    {
        title: 'Теоретический тур',
        description:
            'Сложная теория, решения старых квалов и материалы для повторения.',
        path: '/theory',
        topics: [
            {
                title: 'Астрономический дивертисмент',
                path: '/theory',
            },
            {
                title: 'Краткие конспекты сложных тем',
                path: '/theory',
            },
            {
                title: 'Подборки по темам',
                path: '/theory',
            },
        ],
        theme: 'green',
    },
    {
        title: 'Практический тур',
        description:
            'Разбор практических заданий и краткий справочник по библиотекам, которые постоянно используются на турах.',
        path: '/practice',
        topics: [
            {
                title: 'Краткий справочник по Python',
                path: '/practice',
            },
            {
                title: 'Решения практических туров предыдущих годов',
                path: '/practice',
            },
        ],
        theme: 'orange',
    },
    {
        title: 'Наблюдательный тур',
        description:
            'Ускоренная подготовка к наблюдательному туру: объекты, звёзды, координаты и работа с картой неба.',
        path: '/nabla',
        topics: [
            {
                title: 'Объекты Мессье',
                path: '/nabla/messier',
            },
            {
                title: 'Основные звёзды',
                path: '/nabla/stars',
            },
            {
                title: 'Скайчарты',
                path: '/nabla/skycharts',
            },
            {
                title: 'Теоретическая часть',
                path: '/nabla/theory',
            },
        ],
        theme: 'violet',
    },
    {
        title: 'Блиц',
        description:
            'Карточки для быстрого повторения формул и прокачки мат аппарата перед отбором.',
        path: '/blitz',
        topics: [
            {
                title: 'Основные формулы',
                path: '/blitz',
            },
            {
                title: 'Теоретическая часть',
                path: '/blitz',
            },
        ],
        theme: 'blue',
    },
] as const


function HomePage() {
    return (
        <div className="app-shell" id="top">
            <header className="site-header">
                <a className="brand" href="#top">
                    <span
                        aria-hidden="true"
                        className="brand-mark"
                    >
                        ✦
                    </span>

                    <span>Astro Trainer</span>
                </a>

                <nav
                    aria-label="Основная навигация"
                    className="main-navigation"
                >
                    <a href="#sections">
                        Разделы
                    </a>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <div className="hero-content">
                        <p className="eyebrow">
                            Подготовка к отборам на международные олимпиады по
                            астрономии и астрофизике
                        </p>

                        <h1>Astro Trainer</h1>

                        <p className="hero-description">
                            Сайт для подготовки и быстрого повторения перед
                            отборами.
                        </p>

                        <div className="hero-actions">
                            <a
                                className="button button-primary"
                                href="#sections"
                            >
                                Начать подготовку
                            </a>
                        </div>
                    </div>
                </section>

                <section
                    className="sections-block"
                    id="sections"
                >
                    <div className="section-heading">
                        <div>
                            <p className="section-kicker">
                                Четыре направления
                            </p>

                            <h2>
                                Материалы для подготовки
                            </h2>
                        </div>

                        <p>
                            Каждый раздел отвечает за определённый тур отбора и
                            содержит материалы для подготовки и повторения.
                        </p>
                    </div>

                    <div className="cards-grid">
                        {trainingSections.map(
                            (section) => (
                                <article
                                    className={
                                        'training-card '
                                        + `training-card--${section.theme}`
                                    }
                                    key={section.path}
                                >
                                    <h3>{section.title}</h3>

                                    <p className="card-description">
                                        {section.description}
                                    </p>

                                    <ul className="topics-list">
                                        {section.topics.map(
                                            (topic) => (
                                                <li
                                                    key={
                                                        topic.path
                                                        + topic.title
                                                    }
                                                >
                                                    <Link to={topic.path}>
                                                        {topic.title}
                                                    </Link>
                                                </li>
                                            ),
                                        )}
                                    </ul>

                                    <Link
                                        className="card-footer"
                                        to={section.path}
                                    >
                                        <span>
                                            Перейти к разделу
                                        </span>

                                        <span aria-hidden="true">
                                            →
                                        </span>
                                    </Link>
                                </article>
                            ),
                        )}
                    </div>
                </section>
            </main>

            <footer className="site-footer">
                <a
                    className="brand footer-brand"
                    href="#top"
                >
                    <span
                        aria-hidden="true"
                        className="brand-mark"
                    >
                        ✦
                    </span>

                    <span>Astro Trainer</span>
                </a>
            </footer>
        </div>
    )
}


export default HomePage
