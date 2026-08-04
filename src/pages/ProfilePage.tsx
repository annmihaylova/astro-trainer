import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import { Link } from 'react-router'

import { ApiError } from '../api/client'
import {
    getMessierProgress,
} from '../api/messierProgress'
import type {
    MessierProgressItem,
} from '../api/messierProgress'
import {
    getStarsProgress,
} from '../api/starsProgress'
import type {
    StarsProgressItem,
} from '../api/starsProgress'
import { useAuth } from '../auth/AuthContext'
import {
    getAccessToken,
} from '../auth/tokenStorage'
import DeckProgressStrip from '../components/DeckProgressStrip'
import {
    getMessierProgressOverview,
} from '../progress/messierProgress'
import {
    getStarsProgressOverviews,
} from '../progress/starsProgress'
import './ProfilePage.css'


function getProgressErrorMessage(
    error: unknown,
): string {
    if (error instanceof ApiError) {
        return error.message
    }

    return (
        'Не удалось загрузить прогресс '
        + 'с сервера.'
    )
}


function ProfilePage() {
    const {
        user,
        requestVerificationEmail,
    } = useAuth()


    const [
        messierItems,
        setMessierItems,
    ] = useState<
        MessierProgressItem[]
    >([])

    const [
        starsItems,
        setStarsItems,
    ] = useState<
        StarsProgressItem[]
    >([])

    const [
        isProgressLoading,
        setIsProgressLoading,
    ] = useState(true)

    const [
        progressError,
        setProgressError,
    ] = useState('')

    const [
        progressRequestVersion,
        setProgressRequestVersion,
    ] = useState(0)


    const messierProgress = useMemo(
        () =>
            getMessierProgressOverview(
                messierItems,
            ),
        [messierItems],
    )

    const starsProgress = useMemo(
        () =>
            getStarsProgressOverviews(
                starsItems,
            ),
        [starsItems],
    )


    const [
        isSendingVerification,
        setIsSendingVerification,
    ] = useState(false)

    const [
        verificationMessage,
        setVerificationMessage,
    ] = useState('')

    const [
        verificationError,
        setVerificationError,
    ] = useState(false)


    useEffect(() => {
        let isActive = true

        async function loadProgress() {
            if (!user) {
                return
            }

            const token =
                getAccessToken()

            if (!token) {
                if (isActive) {
                    setProgressError(
                        'Необходимо войти '
                        + 'в аккаунт.',
                    )
                    setIsProgressLoading(
                        false,
                    )
                }

                return
            }

            setIsProgressLoading(true)
            setProgressError('')

            try {
                const [
                    messierResponse,
                    starsResponse,
                ] = await Promise.all([
                    getMessierProgress(
                        token,
                    ),
                    getStarsProgress(
                        token,
                        'all',
                    ),
                ])

                if (!isActive) {
                    return
                }

                setMessierItems(
                    messierResponse.items,
                )

                setStarsItems(
                    starsResponse.items,
                )
            } catch (error) {
                if (!isActive) {
                    return
                }

                setProgressError(
                    getProgressErrorMessage(
                        error,
                    ),
                )
            } finally {
                if (isActive) {
                    setIsProgressLoading(
                        false,
                    )
                }
            }
        }

        void loadProgress()

        return () => {
            isActive = false
        }
    }, [
        user,
        progressRequestVersion,
    ])


    if (!user) {
        return null
    }


    const registrationDate =
        new Intl.DateTimeFormat(
            'ru-RU',
            {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            },
        ).format(
            new Date(
                user.created_at,
            ),
        )


    async function handleSendVerification() {
        setIsSendingVerification(true)
        setVerificationMessage('')
        setVerificationError(false)

        try {
            const responseMessage =
                await requestVerificationEmail()

            setVerificationMessage(
                responseMessage
                + '. В локальном режиме '
                + 'ссылка показана в терминале backend.',
            )
        } catch (error) {
            setVerificationError(true)

            if (error instanceof ApiError) {
                setVerificationMessage(
                    error.message,
                )
            } else {
                setVerificationMessage(
                    'Не удалось создать '
                    + 'ссылку подтверждения.',
                )
            }
        } finally {
            setIsSendingVerification(false)
        }
    }


    return (
        <main className="profile-page">
            <section className="profile-card">
                <Link
                    className="profile-home-link"
                    to="/"
                >
                    ← На главную
                </Link>


                <div className="profile-heading">
                    <p className="profile-kicker">
                        Личный кабинет
                    </p>

                    <h1>
                        {user.first_name}{' '}
                        {user.last_name}
                    </h1>

                    <p>
                        Здесь хранится информация
                        об аккаунте и прогрессе
                        обучения.
                    </p>
                </div>


                <dl className="profile-details">
                    <div>
                        <dt>Логин</dt>
                        <dd>@{user.login}</dd>
                    </div>

                    <div>
                        <dt>
                            Электронная почта
                        </dt>
                        <dd>{user.email}</dd>
                    </div>

                    <div>
                        <dt>
                            Подтверждение почты
                        </dt>

                        <dd>
                            <span
                                className={
                                    user.email_verified
                                        ? (
                                            'profile-email-status '
                                            + 'profile-email-status--verified'
                                        )
                                        : (
                                            'profile-email-status '
                                            + 'profile-email-status--pending'
                                        )
                                }
                            >
                                {user.email_verified
                                    ? 'Подтверждена'
                                    : 'Пока не подтверждена'}
                            </span>


                            {!user.email_verified ? (
                                <div className="profile-email-actions">
                                    <button
                                        className="profile-email-button"
                                        disabled={
                                            isSendingVerification
                                        }
                                        onClick={
                                            handleSendVerification
                                        }
                                        type="button"
                                    >
                                        {isSendingVerification
                                            ? 'Создаём ссылку...'
                                            : 'Отправить ссылку ещё раз'}
                                    </button>


                                    {verificationMessage ? (
                                        <p
                                            className={
                                                verificationError
                                                    ? (
                                                        'profile-email-message '
                                                        + 'profile-email-message--error'
                                                    )
                                                    : 'profile-email-message'
                                            }
                                        >
                                            {verificationMessage}
                                        </p>
                                    ) : null}
                                </div>
                            ) : null}
                        </dd>
                    </div>

                    <div>
                        <dt>
                            Дата регистрации
                        </dt>
                        <dd>
                            {registrationDate}
                        </dd>
                    </div>
                </dl>


                <section className="profile-progress">
                    <div className="profile-progress-heading">
                        <h2>Прогресс</h2>

                        <p>
                            Полоса показывает долю
                            выученных объектов, объектов
                            в процессе и ещё не начатых.
                            Наведи курсор на цветную часть,
                            чтобы увидеть точное количество.
                        </p>
                    </div>


                    {isProgressLoading ? (
                        <div className="profile-progress-state">
                            Загружаем прогресс
                            с сервера…
                        </div>
                    ) : progressError ? (
                        <div
                            className="
                                profile-progress-state
                                profile-progress-state--error
                            "
                        >
                            <p>{progressError}</p>

                            <button
                                onClick={() => {
                                    setProgressRequestVersion(
                                        (version) =>
                                            version + 1,
                                    )
                                }}
                                type="button"
                            >
                                Попробовать снова
                            </button>
                        </div>
                    ) : (
                        <div className="profile-progress-list">
                            <DeckProgressStrip
                                description={
                                    'Общий streak одного объекта '
                                    + 'с чередованием двух '
                                    + 'направлений.'
                                }
                                inProgress={
                                    messierProgress
                                        .inProgress
                                }
                                learned={
                                    messierProgress
                                        .learned
                                }
                                notStarted={
                                    messierProgress
                                        .notStarted
                                }
                                title="Объекты Мессье"
                                total={
                                    messierProgress
                                        .total
                                }
                            />

                            <div className="profile-progress-stars-grid">
                                <DeckProgressStrip
                                    description={
                                        'Самые часто встречающиеся '
                                        + 'звёзды. Прогресс общий '
                                        + 'с полной колодой.'
                                    }
                                    inProgress={
                                        starsProgress
                                            .main
                                            .inProgress
                                    }
                                    learned={
                                        starsProgress
                                            .main
                                            .learned
                                    }
                                    notStarted={
                                        starsProgress
                                            .main
                                            .notStarted
                                    }
                                    title="Основные звёзды"
                                    total={
                                        starsProgress
                                            .main
                                            .total
                                    }
                                    totalLabel="Всего звёзд"
                                />

                                <DeckProgressStrip
                                    description={
                                        'Все звёзды из выборки. '
                                        + 'Выученные основные уже '
                                        + 'учитываются здесь.'
                                    }
                                    inProgress={
                                        starsProgress
                                            .all
                                            .inProgress
                                    }
                                    learned={
                                        starsProgress
                                            .all
                                            .learned
                                    }
                                    notStarted={
                                        starsProgress
                                            .all
                                            .notStarted
                                    }
                                    title="Вся колода звёзд"
                                    total={
                                        starsProgress
                                            .all
                                            .total
                                    }
                                    totalLabel="Всего звёзд"
                                />
                            </div>
                        </div>
                    )}
                </section>
            </section>
        </main>
    )
}


export default ProfilePage
