import {
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    Link,
    useNavigate,
} from 'react-router'

import { useAuth } from '../auth/AuthContext'
import './AccountMenu.css'


function getFirstCharacter(
    value: string,
): string {
    return Array.from(
        value.trim(),
    )[0] ?? ''
}


function AccountMenu() {
    const {
        user,
        logout,
    } = useAuth()

    const navigate = useNavigate()

    const [isOpen, setIsOpen] =
        useState(false)

    const menuRef =
        useRef<HTMLDivElement>(null)


    useEffect(() => {
        function handlePointerDown(
            event: MouseEvent,
        ) {
            const menuElement =
                menuRef.current

            if (
                menuElement
                && event.target instanceof Node
                && !menuElement.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }


        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }


        document.addEventListener(
            'mousedown',
            handlePointerDown,
        )

        document.addEventListener(
            'keydown',
            handleKeyDown,
        )


        return () => {
            document.removeEventListener(
                'mousedown',
                handlePointerDown,
            )

            document.removeEventListener(
                'keydown',
                handleKeyDown,
            )
        }
    }, [])


    if (!user) {
        return null
    }


    const initials = (
        getFirstCharacter(user.first_name)
        + getFirstCharacter(user.last_name)
    ).toLocaleUpperCase()


    function handleLogout() {
        setIsOpen(false)
        logout()

        navigate(
            '/login',
            {
                replace: true,
            },
        )
    }


    return (
        <div
            className="account-menu"
            ref={menuRef}
        >
            <button
                aria-expanded={isOpen}
                aria-haspopup="menu"
                aria-label="Открыть меню профиля"
                className="account-menu-trigger"
                onClick={() =>
                    setIsOpen(
                        (previousValue) =>
                            !previousValue,
                    )
                }
                type="button"
            >
                <span
                    aria-hidden="true"
                    className="account-menu-avatar"
                >
                    {initials}
                </span>
            </button>


            {isOpen ? (
                <div
                    className="account-menu-dropdown"
                    role="menu"
                >
                    <div className="account-menu-user">
                        <span className="account-menu-user-name">
                            {user.first_name}{' '}
                            {user.last_name}
                        </span>

                        <span className="account-menu-login">
                            @{user.login}
                        </span>
                    </div>


                    <div className="account-menu-divider" />


                    <Link
                        className="account-menu-item"
                        onClick={() =>
                            setIsOpen(false)
                        }
                        role="menuitem"
                        to="/profile"
                    >
                        Личный кабинет
                    </Link>


                    <button
                        className="
                            account-menu-item
                            account-menu-item--logout
                        "
                        onClick={handleLogout}
                        role="menuitem"
                        type="button"
                    >
                        Выйти
                    </button>
                </div>
            ) : null}
        </div>
    )
}


export default AccountMenu