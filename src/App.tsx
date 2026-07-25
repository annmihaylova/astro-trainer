import { Navigate, Route, Routes } from 'react-router'
import './App.css'
import HomePage from './pages/HomePage'
import SectionPlaceholderPage from './pages/SectionPlaceholderPage'
import NablaLayout from './pages/nabla/NablaLayout'
import NablaOverviewPage from './pages/nabla/NablaOverviewPage'
import StarsPage from './pages/nabla/StarsPage'
import MessierPage from './pages/nabla/MessierPage'
import TheoryPage from './pages/nabla/TheoryPage'
import SkyChartsPage from './pages/nabla/SkyChartsPage'

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
                path="/theory"
                element={
                    <SectionPlaceholderPage
                        title="Теоретический тур"
                        description="Здесь появятся решения старых квалификаций, конспекты и астрономический дивертисмент."
                    />
                }
            />

            <Route
                path="/practice"
                element={
                    <SectionPlaceholderPage
                        title="Практический тур"
                        description="Здесь появятся решения практических туров и справочник по Python-библиотекам."
                    />
                }
            />

            <Route
                path="/blitz"
                element={
                    <SectionPlaceholderPage
                        title="Блиц"
                        description="Здесь появятся карточки с формулами и быстрые задания."
                    />
                }
            />

            <Route path="/nabla" element={<NablaLayout />}>
                <Route index element={<NablaOverviewPage />} />
                <Route path="stars" element={<StarsPage />} />
                <Route path="messier" element={<MessierPage />} />
                <Route path="theory" element={<TheoryPage />} />
                <Route path="skycharts" element={<SkyChartsPage />} />
            </Route>

            <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
    )
}

export default App