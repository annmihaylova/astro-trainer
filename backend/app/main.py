from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from sqlalchemy import inspect, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import (
    Base,
    engine,
    get_database_session,
)
from app.models import User
from app.schemas import (
    AuthResponse,
    UserLogin,
    UserRead,
    UserRegistration,
)
from app.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password_safely,
)


@asynccontextmanager
async def lifespan(
    _app: FastAPI,
) -> AsyncIterator[None]:
    Base.metadata.create_all(
        bind=engine,
    )

    yield


app = FastAPI(
    title="Astro Trainer API",
    description="Backend для сайта подготовки по астрономии",
    version="0.1.0",
    lifespan=lifespan,
)


frontend_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DatabaseSession = Annotated[
    Session,
    Depends(get_database_session),
]


bearer_scheme = HTTPBearer(
    auto_error=False,
)


BearerCredentials = Annotated[
    HTTPAuthorizationCredentials | None,
    Depends(bearer_scheme),
]


def create_authentication_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Необходимо войти в аккаунт",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )


def get_current_user(
    credentials: BearerCredentials,
    database: DatabaseSession,
) -> User:
    if (
        credentials is None
        or credentials.scheme.lower() != "bearer"
    ):
        raise create_authentication_error()

    user_id = decode_access_token(
        credentials.credentials,
    )

    if user_id is None:
        raise create_authentication_error()

    user = database.get(
        User,
        user_id,
    )

    if user is None:
        raise create_authentication_error()

    return user


CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


def user_to_read(
    user: User,
) -> UserRead:
    return UserRead(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        login=user.login,
        email_verified=(
            user.email_verified_at is not None
        ),
        created_at=user.created_at,
    )


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "Astro Trainer API работает",
    }


@app.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "ok",
    }


@app.get("/database-check")
def database_check(
    database: DatabaseSession,
) -> dict[str, str]:
    database.execute(
        text("SELECT 1"),
    )

    return {
        "database": "ok",
    }


@app.get("/database-tables")
def database_tables() -> dict[str, list[str]]:
    inspector = inspect(engine)

    return {
        "tables": inspector.get_table_names(),
    }


@app.get("/database-columns")
def database_columns() -> dict[str, list[str]]:
    inspector = inspect(engine)

    columns = inspector.get_columns(
        "users",
    )

    return {
        "users": [
            column["name"]
            for column in columns
        ],
    }


@app.get("/users")
def list_users(
    database: DatabaseSession,
) -> list[dict[str, int | str | bool]]:
    users = database.scalars(
        select(User).order_by(User.id),
    ).all()

    return [
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "login": user.login,
            "email_verified": (
                user.email_verified_at is not None
            ),
        }
        for user in users
    ]


@app.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register_user(
    registration: UserRegistration,
    database: DatabaseSession,
) -> AuthResponse:
    email = str(registration.email)
    email_normalized = email.casefold()

    login = registration.login
    login_normalized = login.casefold()

    user_with_same_email = database.scalar(
        select(User).where(
            User.email_normalized
            == email_normalized,
        ),
    )

    if user_with_same_email is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Аккаунт с такой электронной "
                "почтой уже существует"
            ),
        )

    user_with_same_login = database.scalar(
        select(User).where(
            User.login_normalized
            == login_normalized,
        ),
    )

    if user_with_same_login is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Этот логин уже занят",
        )

    user = User(
        first_name=registration.first_name,
        last_name=registration.last_name,
        email=email,
        email_normalized=email_normalized,
        login=login,
        login_normalized=login_normalized,
        password_hash=hash_password(
            registration.password,
        ),
    )

    database.add(user)

    try:
        database.commit()
    except IntegrityError as error:
        database.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Электронная почта или логин "
                "уже заняты"
            ),
        ) from error

    database.refresh(user)

    return AuthResponse(
        access_token=create_access_token(
            user.id,
        ),
        user=user_to_read(user),
    )


@app.post(
    "/login",
    response_model=AuthResponse,
)
def login_user(
    credentials: UserLogin,
    database: DatabaseSession,
) -> AuthResponse:
    login_normalized = (
        credentials.login.casefold()
    )

    user = database.scalar(
        select(User).where(
            User.login_normalized
            == login_normalized,
        ),
    )

    password_is_valid = verify_password_safely(
        credentials.password,
        (
            user.password_hash
            if user is not None
            else None
        ),
    )

    if user is None or not password_is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
        )

    return AuthResponse(
        access_token=create_access_token(
            user.id,
        ),
        user=user_to_read(user),
    )


@app.get(
    "/me",
    response_model=UserRead,
)
def get_my_account(
    current_user: CurrentUser,
) -> UserRead:
    return user_to_read(
        current_user,
    )