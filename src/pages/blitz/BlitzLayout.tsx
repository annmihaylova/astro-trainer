import {
    Link,
    NavLink,
    Outlet,
} from 'react-router'

import './blitz-page.css'


function BlitzLayout() {
    return (
        <div className="blitz-shell">
            <header className="blitz-header">
                <div className="blitz-topbar">
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
                        className="blitz-home-link"
                        to="/"
                    >
                        ← Главная
                    </Link>
                </div>

                <div className="blitz-heading">
                    <h1>Блиц</h1>
                </div>

                <nav
                    aria-label="Разделы блица"
                    className="blitz-navigation"
                >
                    <NavLink
                        className={({ isActive }: { isActive: boolean }) =>
                            isActive
                                ? (
                                    'blitz-navigation-link '
                                    + 'blitz-navigation-link--active'
                                )
                                : 'blitz-navigation-link'
                        }
                        end
                        to="/blitz"
                    >
                        Формулы
                    </NavLink>

                    <NavLink
                        className={({ isActive }: { isActive: boolean }) =>
                            isActive
                                ? (
                                    'blitz-navigation-link '
                                    + 'blitz-navigation-link--active'
                                )
                                : 'blitz-navigation-link'
                        }
                        to="/blitz/theory"
                    >
                        Теория
                    </NavLink>
                </nav>
            </header>

            <main className="blitz-main">
                <Outlet />
            </main>
        </div>
    )
}


export default BlitzLayout
