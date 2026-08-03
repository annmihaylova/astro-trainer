import {
    Navigate,
    Route,
    Routes,
} from 'react-router'

import './App.css'

import ProtectedRoute from './auth/ProtectedRoute'

import HomePage from './pages/HomePage'
import SectionPlaceholderPage from './pages/SectionPlaceholderPage'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import NablaLayout from './pages/nabla/NablaLayout'
import NablaOverviewPage from './pages/nabla/NablaOverviewPage'
import StarsPage from './pages/nabla/StarsPage'
import MessierPage from './pages/nabla/MessierPage'
import TheoryPage from './pages/nabla/TheoryPage'
import SkyChartsPage from './pages/nabla/SkyChartsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
    return (
        <Routes>
            <Route
                path="/login"
                element={<LoginPage />}
            />

            <Route
                path="/register"
                element={<RegisterPage />}
            />


            <Route element={<ProtectedRoute />}>
                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/profile"
                    element={<ProfilePage />}
                />

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

                <Route
                    path="/nabla"
                    element={<NablaLayout />}
                >
                    <Route
                        index
                        element={<NablaOverviewPage />}
                    />

                    <Route
                        path="stars"
                        element={<StarsPage />}
                    />

                    <Route
                        path="messier"
                        element={<MessierPage />}
                    />

                    <Route
                        path="theory"
                        element={<TheoryPage />}
                    />

                    <Route
                        path="skycharts"
                        element={<SkyChartsPage />}
                    />
                </Route>
            </Route>


            <Route
                path="*"
                element={
                    <Navigate
                        replace
                        to="/"
                    />
                }
            />
        </Routes>
    )
}


export default App