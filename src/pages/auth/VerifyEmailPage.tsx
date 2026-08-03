import {
    useEffect,
    useState,
} from 'react'
import {
    Link,
    useSearchParams,
} from 'react-router'

import {
    confirmEmailVerification,
} from '../../api/auth'
import type {
    EmailVerificationResponse,
} from '../../api/auth'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import './AuthPage.css'


type VerificationState =
    | 'checking'
    | 'success'
    | 'error'


/*
 * React StrictMode может дважды запускать
 * useEffect в режиме разработки.
 *
 * Эта Map гарантирует, что один токен
 * отправится на backend только один раз.
 */
const confirmationRequests =
    new Map<
        string,
        Promise<EmailVerificationResponse>
    >()


function confirmTokenOnce(
    token: string,
): Promise<EmailVerificationResponse> {
    const existingRequest =
        confirmationRequests.get(token)

    if (existingRequest) {
        return existingRequest
    }

    const request =
        confirmEmailVerification(token)

    confirmationRequests.set(
        token,
        request,
    )

    return request
}


function VerifyEmailPage() {
    const [searchParams] =
        useSearchParams()

    const {
        user,
        refreshUser,
    } = useAuth()

    const [
        verificationState,
        setVerificationState,
    ] = useState<VerificationState>(
        'checking',
    )

    const [message, setMessage] =
        useState(
            'Проверяем ссылку подтверждения...',
        )


    const token =
        searchParams.get('token')


    useEffect(() => {
        let isActive = true

        if (!token) {
            setVerificationState('error')
            setMessage(
                'В ссылке отсутствует токен подтверждения.',
            )

            return
        }

        /*
        * После проверки TypeScript точно знает,
        * что verificationToken — строка, а не null.
        */
        const verificationToken = token


        async function verifyEmail() {
            try {
                const response =
                    await confirmTokenOnce(
                        verificationToken,
                    )

                /*
                * Если пользователь уже вошёл
                * в этом браузере, обновляем
                * email_verified внутри AuthContext.
                */
                try {
                    await refreshUser()
                } catch {
                    /*
                    * Подтверждение уже прошло успешно.
                    * Ошибка обновления сессии не должна
                    * превращать результат в ошибку.
                    */
                }

                if (!isActive) {
                    return
                }

                setVerificationState(
                    'success',
                )

                setMessage(
                    response.message,
                )
            } catch (error) {
                if (!isActive) {
                    return
                }

                setVerificationState(
                    'error',
                )

                if (error instanceof ApiError) {
                    setMessage(
                        error.message,
                    )
                } else {
                    setMessage(
                        'Не удалось связаться с сервером.',
                    )
                }
            }
        }


        void verifyEmail()


        return () => {
            isActive = false
        }
    }, [token, refreshUser])

    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-heading">
                    <p className="auth-kicker">
                        Astro Trainer
                    </p>

                    <h1>
                        Подтверждение почты
                    </h1>

                    <p>
                        Проверяем одноразовую
                        ссылку подтверждения.
                    </p>
                </header>


                <div
                    className={
                        'auth-status '
                        + `auth-status--${verificationState}`
                    }
                >
                    <span
                        aria-hidden="true"
                        className="auth-status-icon"
                    >
                        {verificationState
                            === 'checking'
                            ? '…'
                            : verificationState
                                === 'success'
                                ? '✓'
                                : '!'}
                    </span>

                    <p>{message}</p>
                </div>


                <div className="auth-page-actions">
                    {verificationState
                        === 'success' ? (
                        <Link
                            className="
                                auth-submit
                                auth-submit--link
                            "
                            to={
                                user
                                    ? '/profile'
                                    : '/login'
                            }
                        >
                            {user
                                ? 'Перейти в профиль'
                                : 'Войти в аккаунт'}
                        </Link>
                    ) : null}


                    {verificationState
                        === 'error' ? (
                        <Link
                            className="auth-secondary-link"
                            to={
                                user
                                    ? '/profile'
                                    : '/login'
                            }
                        >
                            {user
                                ? 'Вернуться в профиль'
                                : 'Перейти ко входу'}
                        </Link>
                    ) : null}
                </div>
            </section>
        </main>
    )
}


export default VerifyEmailPage