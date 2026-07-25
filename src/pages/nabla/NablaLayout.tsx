import { Link, NavLink, Outlet } from 'react-router'
import { nablaSections } from '../../data/nablaSections'
import './nabla-page.css'

function NablaLayout() {
    return (
        <div className="nabla-shell">
            <header className="nabla-header">
                <div className="nabla-topbar">
                    <Link className="brand" to="/">
                        <span className="brand-mark" aria-hidden="true">
                            ✦
                        </span>
                        <span>Astro Trainer</span>
                    </Link>

                    <Link className="nabla-home-link" to="/">
                        ← Главная
                    </Link>
                </div>

                <div className="nabla-heading">
                    <p className="section-kicker">Раздел 03</p>
                    <h1>Наблюдательный тур</h1>
                    <p>
                        Карточки, краткая теория и тренажёр для работы с картой
                        неба.
                    </p>
                </div>

                <nav
                    className="nabla-navigation"
                    aria-label="Разделы наблюдательного тура"
                >
                    <NavLink
                        className={({ isActive }) =>
                            isActive
                                ? 'nabla-navigation-link nabla-navigation-link--active'
                                : 'nabla-navigation-link'
                        }
                        end
                        to="/nabla"
                    >
                        Обзор
                    </NavLink>

                    {nablaSections.map((section) => (
                        <NavLink
                            className={({ isActive }) =>
                                isActive
                                    ? 'nabla-navigation-link nabla-navigation-link--active'
                                    : 'nabla-navigation-link'
                            }
                            key={section.path}
                            to={section.path}
                        >
                            {section.shortTitle}
                        </NavLink>
                    ))}
                </nav>
            </header>

            <main className="nabla-main">
                <Outlet />
            </main>
        </div>
    )
}

export default NablaLayout