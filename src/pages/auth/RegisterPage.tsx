import { useState } from 'react'
import type { FormEvent } from 'react'
import {
    Link,
    useNavigate,
} from 'react-router'

import { ApiError } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import './AuthPage.css'


function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [firstName, setFirstName] =
        useState('')
    const [lastName, setLastName] =
        useState('')
    const [email, setEmail] =
        useState('')
    const [login, setLogin] =
        useState('')
    const [password, setPassword] =
        useState('')
    const [passwordRepeat, setPasswordRepeat] =
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

        if (password !== passwordRepeat) {
            setErrorMessage(
                'Пароли не совпадают',
            )
            return
        }

        setIsSubmitting(true)

        try {
            await register({
                first_name: firstName,
                last_name: lastName,
                email,
                login,
                password,
                password_repeat: passwordRepeat,
            })

            navigate(
                '/',
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

                    <h1>Создание аккаунта</h1>

                    <p>
                        Аккаунт нужен, чтобы сохранять
                        выученные карточки и результаты
                        тренажёров.
                    </p>
                </header>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="auth-name-row">
                        <label className="auth-field">
                            <span>Имя</span>

                            <input
                                autoComplete="given-name"
                                maxLength={100}
                                name="firstName"
                                onChange={(event) =>
                                    setFirstName(
                                        event.target.value,
                                    )
                                }
                                placeholder="Имя"
                                required
                                type="text"
                                value={firstName}
                            />
                        </label>

                        <label className="auth-field">
                            <span>Фамилия</span>

                            <input
                                autoComplete="family-name"
                                maxLength={100}
                                name="lastName"
                                onChange={(event) =>
                                    setLastName(
                                        event.target.value,
                                    )
                                }
                                placeholder="Фамилия"
                                required
                                type="text"
                                value={lastName}
                            />
                        </label>
                    </div>

                    <label className="auth-field">
                        <span>Электронная почта</span>

                        <input
                            autoComplete="email"
                            maxLength={320}
                            name="email"
                            onChange={(event) =>
                                setEmail(
                                    event.target.value,
                                )
                            }
                            placeholder="email@example.com"
                            required
                            type="email"
                            value={email}
                        />
                    </label>

                    <label className="auth-field">
                        <span>Логин</span>

                        <input
                            autoComplete="username"
                            maxLength={32}
                            minLength={3}
                            name="login"
                            onChange={(event) =>
                                setLogin(
                                    event.target.value,
                                )
                            }
                            placeholder="login"
                            required
                            type="text"
                            value={login}
                        />

                        <p className="auth-hint">
                            От 3 до 32 символов:
                            латинские буквы, цифры и
                            специальные знаки без пробелов.
                        </p>
                    </label>

                    <label className="auth-field">
                        <span>Пароль</span>

                        <input
                            autoComplete="new-password"
                            maxLength={128}
                            minLength={8}
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

                        <p className="auth-hint">
                            Минимум 8 символов.
                        </p>
                    </label>

                    <label className="auth-field">
                        <span>Повторите пароль</span>

                        <input
                            autoComplete="new-password"
                            maxLength={128}
                            minLength={8}
                            name="passwordRepeat"
                            onChange={(event) =>
                                setPasswordRepeat(
                                    event.target.value,
                                )
                            }
                            required
                            type="password"
                            value={passwordRepeat}
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
                            ? 'Создаём аккаунт...'
                            : 'Создать аккаунт'}
                    </button>
                </form>

                <Link
                    className="auth-back-link"
                    to="/"
                >
                    ← Вернуться на главную
                </Link>
            </section>
        </main>
    )
}


export default RegisterPage