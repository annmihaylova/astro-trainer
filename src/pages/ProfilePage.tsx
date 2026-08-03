import {
    useMemo,
    useState,
} from 'react'
import { Link } from 'react-router'
import { ApiError } from '../api/client'

import { useAuth } from '../auth/AuthContext'
import DeckProgressStrip from '../components/DeckProgressStrip'
import {
    getMessierProgressOverview,
} from '../progress/messierProgress'
import './ProfilePage.css'


function ProfilePage() {
    const {
        user,
        requestVerificationEmail,
    } = useAuth()


    const messierProgress = useMemo(
        () =>
            getMessierProgressOverview(),
        [],
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
                    'Не удалось создать ссылку подтверждения.',
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
                            Каждый маленький сегмент
                            соответствует одному объекту.
                            Наведи курсор, чтобы увидеть
                            название и текущую серию.
                        </p>
                    </div>


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
                            items={
                                messierProgress.items
                            }
                            learned={
                                messierProgress.learned
                            }
                            notStarted={
                                messierProgress
                                    .notStarted
                            }
                            requiredStreak={
                                messierProgress
                                    .requiredStreak
                            }
                            title="Объекты Мессье"
                            total={
                                messierProgress.total
                            }
                        />
                    </div>
                </section>
            </section>
        </main>
    )
}


export default ProfilePage