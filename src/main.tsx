import {
    StrictMode,
    useEffect,
} from 'react'
import { createRoot } from 'react-dom/client'
import {
    BrowserRouter,
    useLocation,
} from 'react-router'

import App from './App'
import { AuthProvider } from './auth/AuthContext'
import './index.css'


function ScrollToTop() {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant',
        })
    }, [pathname])

    return null
}


const rootElement =
    document.getElementById('root')

if (!rootElement) {
    throw new Error(
        'Не найден HTML-элемент с id="root"',
    )
}


createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ScrollToTop />
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)