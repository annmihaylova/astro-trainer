import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import type {
    ReactNode,
} from 'react'

import {
    getCurrentUser,
    loginUser,
    registerUser,
    requestEmailVerification,
} from '../api/auth'
import type {
    AuthUser,
    LoginUserRequest,
    RegisterUserRequest,
} from '../api/auth'
import {
    clearAccessToken,
    getAccessToken,
    setAccessToken,
} from './tokenStorage'


type AuthContextValue = {
    user: AuthUser | null
    isLoading: boolean
    login: (
        credentials: LoginUserRequest,
    ) => Promise<void>
    register: (
        registration: RegisterUserRequest,
    ) => Promise<void>
    refreshUser: () => Promise<void>
    requestVerificationEmail: () => Promise<string>
    logout: () => void
}


const AuthContext = createContext<AuthContextValue | null>(
    null,
)


type AuthProviderProps = {
    children: ReactNode
}


export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] =
        useState<AuthUser | null>(null)

    const [isLoading, setIsLoading] =
        useState(true)


    useEffect(() => {
        let isActive = true

        async function restoreSession() {
            const token = getAccessToken()

            if (!token) {
                if (isActive) {
                    setIsLoading(false)
                }

                return
            }

            try {
                const currentUser =
                    await getCurrentUser(token)

                if (isActive) {
                    setUser(currentUser)
                }
            } catch {
                clearAccessToken()

                if (isActive) {
                    setUser(null)
                }
            } finally {
                if (isActive) {
                    setIsLoading(false)
                }
            }
        }

        void restoreSession()

        return () => {
            isActive = false
        }
    }, [])

    const refreshUser = useCallback(
        async (): Promise<void> => {
            const token = getAccessToken()

            if (!token) {
                setUser(null)
                return
            }

            try {
                const currentUser =
                    await getCurrentUser(token)

                setUser(currentUser)
            } catch (error) {
                clearAccessToken()
                setUser(null)

                throw error
            }
        },
        [],
    )


    const requestVerificationEmail =
        useCallback(
            async (): Promise<string> => {
                const token =
                    getAccessToken()

                if (!token) {
                    throw new Error(
                        'Необходимо войти в аккаунт',
                    )
                }

                const response =
                    await requestEmailVerification(
                        token,
                    )

                if (response.email_verified) {
                    await refreshUser()
                }

                return response.message
            },
            [refreshUser],
        )

    async function login(
        credentials: LoginUserRequest,
    ): Promise<void> {
        const response =
            await loginUser(credentials)

        setAccessToken(
            response.access_token,
        )

        setUser(response.user)
    }


    async function register(
        registration: RegisterUserRequest,
    ): Promise<void> {
        const response =
            await registerUser(registration)

        setAccessToken(
            response.access_token,
        )

        setUser(response.user)
    }


    function logout(): void {
        clearAccessToken()
        setUser(null)
    }


    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                register,
                refreshUser,
                requestVerificationEmail,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error(
            'useAuth должен использоваться внутри AuthProvider',
        )
    }

    return context
}