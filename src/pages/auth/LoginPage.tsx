import { useState } from 'react'
import type {
    FormEvent,
} from 'react'
import {
    Link,
    useLocation,
    useNavigate,
} from 'react-router'
import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import './AuthPage.css'

type LoginLocationState = {
    returnPath?: string
}

function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const locationState =
        location.state as LoginLocationState | null

    const returnPath =
        locationState?.returnPath ?? '/'

    const [loginValue, setLoginValue] =
        useState('')

    const [password, setPassword] =
        useState('')

    const [errorMessage, setErrorMessage] =
        useState('')

    const [isSubmitting, setIsSubmitting] =
        useState(false)


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()
        setErrorMessage('')
        setIsSubmitting(true)

        try {
            await login({
                login: loginValue,
                password,
            })

            navigate(
                returnPath,
                {
                    replace: true,
                },
            )
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(
                    error.message,
                )
            } else {
                setErrorMessage(
                    'Не удалось связаться с сервером',
                )
            }
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <main className="auth-page">
            <section className="auth-card">
                <header className="auth-heading">
                    <p className="auth-kicker">
                        Astro Trainer
                    </p>

                    <h1>Вход в аккаунт</h1>

                    <p>
                        Войдите, чтобы продолжить обучение
                        и открыть сохранённый прогресс.
                    </p>
                </header>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <label className="auth-field">
                        <span>Логин</span>

                        <input
                            autoComplete="username"
                            maxLength={32}
                            minLength={3}
                            name="login"
                            onChange={(event) =>
                                setLoginValue(
                                    event.target.value,
                                )
                            }
                            placeholder="astro#2026"
                            required
                            type="text"
                            value={loginValue}
                        />
                    </label>

                    <label className="auth-field">
                        <span>Пароль</span>

                        <input
                            autoComplete="current-password"
                            maxLength={128}
                            name="password"
                            onChange={(event) =>
                                setPassword(
                                    event.target.value,
                                )
                            }
                            required
                            type="password"
                            value={password}
                        />
                    </label>

                    {errorMessage ? (
                        <p
                            className="auth-error"
                            role="alert"
                        >
                            {errorMessage}
                        </p>
                    ) : null}

                    <button
                        className="auth-submit"
                        disabled={isSubmitting}
                        type="submit"
                    >
                        {isSubmitting
                            ? 'Входим...'
                            : 'Войти'}
                    </button>
                </form>

                <Link
                    className="auth-back-link"
                    to="/register"
                >
                    Нет аккаунта? Создать
                </Link>
            </section>
        </main>
    )
}


export default LoginPage