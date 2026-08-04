import {
    Link,
    NavLink,
    Outlet,
} from 'react-router'

import { nablaSections } from '../../data/nablaSections'
import './nabla-page.css'
import './nabla-cleanup.css'


function NablaLayout() {
    return (
        <div className="nabla-shell">
            <header className="nabla-header">
                <div className="nabla-topbar">
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
                        className="nabla-home-link"
                        to="/"
                    >
                        ← Главная
                    </Link>
                </div>

                <div className="nabla-heading">
                    <h1>Наблюдательный тур</h1>
                </div>

                <nav
                    aria-label="Разделы наблюдательного тура"
                    className="nabla-navigation"
                >
                    <NavLink
                        className={({ isActive }: { isActive: boolean }) =>
                            isActive
                                ? (
                                    'nabla-navigation-link '
                                    + 'nabla-navigation-link--active'
                                )
                                : 'nabla-navigation-link'
                        }
                        end
                        to="/nabla"
                    >
                        Обзор
                    </NavLink>

                    {nablaSections.map((section) => (
                        <NavLink
                            className={({ isActive }: { isActive: boolean }) =>
                                isActive
                                    ? (
                                        'nabla-navigation-link '
                                        + 'nabla-navigation-link--active'
                                    )
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
