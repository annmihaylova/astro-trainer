import {
    Navigate,
    Outlet,
    useLocation,
} from 'react-router'

import { useAuth } from './AuthContext'

import AccountMenu from '../components/AccountMenu'

function ProtectedRoute() {
    const {
        user,
        isLoading,
    } = useAuth()

    const location = useLocation()


    if (isLoading) {
        return (
            <main
                style={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    background: '#090b14',
                    color: '#ffffff',
                }}
            >
                <p>Проверяем аккаунт...</p>
            </main>
        )
    }


    if (!user) {
        const returnPath = (
            location.pathname
            + location.search
            + location.hash
        )

        return (
            <Navigate
                replace
                state={{
                    returnPath,
                }}
                to="/login"
            />
        )
    }


    return (
        <>
            <AccountMenu />
            <Outlet />
        </>
    )
}


export default ProtectedRoute