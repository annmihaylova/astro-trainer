import {
    NavLink,
    Outlet,
} from 'react-router'

import './skycharts-layout.css'


const skyChartModes = [
    {
        path: '/nabla/skycharts/hemisphere',
        title: 'Полушарие',
    },
    {
        path: '/nabla/skycharts/constellations',
        title: 'Созвездия',
    },
    {
        path: '/nabla/skycharts/messier',
        title: 'Мессье',
    },
] as const


function SkyChartsLayout() {
    return (
        <div className="skycharts-mode-layout">
            <nav
                className="skycharts-mode-navigation"
                aria-label="Режимы скайчартов"
            >
                {skyChartModes.map((mode) => (
                    <NavLink
                        key={mode.path}
                        to={mode.path}
                        className={({ isActive }: { isActive: boolean }) =>
                            isActive
                                ? (
                                    'skycharts-mode-navigation-link '
                                    + 'skycharts-mode-navigation-link--active'
                                )
                                : 'skycharts-mode-navigation-link'
                        }
                    >
                        {mode.title}
                    </NavLink>
                ))}
            </nav>

            <Outlet />
        </div>
    )
}


export default SkyChartsLayout
