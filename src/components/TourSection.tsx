import {
    Link,
    NavLink,
    Outlet,
} from 'react-router'

import './tour-section.css'


type TourSectionItem = {
    number: string
    title: string
    shortTitle: string
    path: string
    type: string
    description: string
}


type TourLayoutProps = {
    title: string
    basePath: string
    theme: 'violet' | 'blue' | 'orange' | 'green'
    sections: readonly TourSectionItem[]
}


type TourOverviewPageProps = {
    sections: readonly TourSectionItem[]
}


type TourPlaceholderPageProps = {
    title: string
}


export function TourLayout({
    title,
    basePath,
    theme,
    sections,
}: TourLayoutProps) {
    return (
        <div className={`tour-shell tour-shell--${theme}`}>
            <header className="tour-header">
                <div className="tour-topbar">
                    <Link className="brand" to="/">
                        <span
                            aria-hidden="true"
                            className="brand-mark"
                        >
                            ✦
                        </span>

                        <span>Astro Trainer</span>
                    </Link>

                    <Link
                        className="tour-home-link"
                        to="/"
                    >
                        ← Главная
                    </Link>
                </div>

                <div className="tour-heading">
                    <h1>{title}</h1>
                </div>

                <nav
                    aria-label={`Разделы: ${title}`}
                    className="tour-navigation"
                >
                    <NavLink
                        className={({ isActive }: { isActive: boolean }) =>
                            isActive
                                ? (
                                    'tour-navigation-link '
                                    + 'tour-navigation-link--active'
                                )
                                : 'tour-navigation-link'
                        }
                        end
                        to={basePath}
                    >
                        Обзор
                    </NavLink>

                    {sections.map((section) => (
                        <NavLink
                            className={({ isActive }: { isActive: boolean }) =>
                                isActive
                                    ? (
                                        'tour-navigation-link '
                                        + 'tour-navigation-link--active'
                                    )
                                    : 'tour-navigation-link'
                            }
                            key={section.path}
                            to={section.path}
                        >
                            {section.shortTitle}
                        </NavLink>
                    ))}
                </nav>
            </header>

            <main className="tour-main">
                <Outlet />
            </main>
        </div>
    )
}


export function TourOverviewPage({
    sections,
}: TourOverviewPageProps) {
    return (
        <section className="tour-overview">
            <div className="tour-intro">
                <h2>Выбери режим подготовки</h2>
            </div>

            <div className="tour-grid">
                {sections.map((section) => (
                    <Link
                        className="tour-module-card"
                        key={section.path}
                        to={section.path}
                    >
                        <div className="tour-module-top">
                            <span>{section.number}</span>
                            <span>{section.type}</span>
                        </div>

                        <h3>{section.title}</h3>
                        <p>{section.description}</p>

                        <span className="tour-module-arrow">
                            Открыть →
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    )
}


export function TourPlaceholderPage({
    title,
}: TourPlaceholderPageProps) {
    return (
        <section className="tour-content-page">
            <div className="tour-intro">
                <h2>{title}</h2>
            </div>
        </section>
    )
}
