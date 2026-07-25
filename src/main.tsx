import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useLocation } from 'react-router'
import './index.css'
import App from './App'

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

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Не найден HTML-элемент с id="root"')
}

createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <ScrollToTop />
            <App />
        </BrowserRouter>
    </StrictMode>,
)