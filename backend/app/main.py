from datetime import datetime, timedelta, timezone
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
from sqlalchemy import (
    delete,
    inspect,
    select,
    text,
    update,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import (
    Base,
    engine,
    get_database_session,
)
from app.models import (
    EmailVerificationToken,
    LearningProgress,
    TrainingState,
    User,
)
from app.schemas import (
    AuthResponse,
    EmailVerificationConfirm,
    EmailVerificationResponse,
    UserLogin,
    UserRead,
    UserRegistration,
)
from app.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password_safely,
    generate_email_verification_token,
    hash_email_verification_token,
)

from app.schemas import (
    AuthResponse,
    EmailVerificationConfirm,
    EmailVerificationResponse,
    MessierProgressItem,
    MessierProgressRead,
    MessierProgressWrite,
    ProgressResetResponse,
    UserLogin,
    UserRead,
    UserRegistration,
)

from app.config import (
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS,
    FRONTEND_URL,
)
from app.email_service import (
    send_verification_email_dev,
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

MESSIER_DECK = "messier"

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

def learning_progress_to_messier_item(
    progress: LearningProgress,
) -> MessierProgressItem:
    if progress.next_prompt_kind not in {
        "name",
        "position",
    }:
        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "В базе сохранён некорректный "
                "тип карточки"
            ),
        )

    return MessierProgressItem(
        item_id=progress.item_id,
        streak=progress.streak,
        correct_answers=(
            progress.correct_answers
        ),
        wrong_answers=(
            progress.wrong_answers
        ),
        learned=progress.learned,
        next_prompt_kind=(
            progress.next_prompt_kind
        ),
    )

def utc_now() -> datetime:
    return datetime.now(
        timezone.utc,
    ).replace(
        tzinfo=None,
    )


def create_email_verification_record(
    user_id: int,
    database: DatabaseSession,
) -> str:
    database.execute(
        delete(
            EmailVerificationToken,
        ).where(
            EmailVerificationToken.user_id
            == user_id,
        ),
    )

    raw_token = (
        generate_email_verification_token()
    )

    token_record = EmailVerificationToken(
        user_id=user_id,
        token_hash=(
            hash_email_verification_token(
                raw_token,
            )
        ),
        expires_at=(
            utc_now()
            + timedelta(
                hours=(
                    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS
                ),
            )
        ),
    )

    database.add(
        token_record,
    )

    return raw_token


def build_email_verification_url(
    token: str,
) -> str:
    return (
        f"{FRONTEND_URL}"
        f"/verify-email?token={token}"
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
        database.flush()

        raw_verification_token = (
            create_email_verification_record(
                user.id,
                database,
            )
        )

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

    send_verification_email_dev(
        email=user.email,
        verification_url=(
            build_email_verification_url(
                raw_verification_token,
            )
        ),
    )

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

@app.post(
    "/email-verification/request",
    response_model=EmailVerificationResponse,
)
def request_email_verification(
    current_user: CurrentUser,
    database: DatabaseSession,
) -> EmailVerificationResponse:
    if (
        current_user.email_verified_at
        is not None
    ):
        return EmailVerificationResponse(
            message=(
                "Электронная почта "
                "уже подтверждена"
            ),
            email_verified=True,
        )

    raw_token = (
        create_email_verification_record(
            current_user.id,
            database,
        )
    )

    database.commit()

    send_verification_email_dev(
        email=current_user.email,
        verification_url=(
            build_email_verification_url(
                raw_token,
            )
        ),
    )

    return EmailVerificationResponse(
        message=(
            "Новая ссылка подтверждения создана"
        ),
        email_verified=False,
    )

@app.post(
    "/email-verification/confirm",
    response_model=EmailVerificationResponse,
)
def confirm_email_verification(
    confirmation: EmailVerificationConfirm,
    database: DatabaseSession,
) -> EmailVerificationResponse:
    now = utc_now()

    token_hash = (
        hash_email_verification_token(
            confirmation.token,
        )
    )

    token_record = database.scalar(
        select(
            EmailVerificationToken,
        ).where(
            EmailVerificationToken.token_hash
            == token_hash,

            EmailVerificationToken.used_at
            .is_(None),
        ),
    )

    if (
        token_record is None
        or token_record.expires_at <= now
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Ссылка подтверждения "
                "недействительна или истекла"
            ),
        )

    user = database.get(
        User,
        token_record.user_id,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Аккаунт для этой ссылки "
                "не найден"
            ),
        )

    if user.email_verified_at is None:
        user.email_verified_at = now

    database.execute(
        update(
            EmailVerificationToken,
        )
        .where(
            EmailVerificationToken.user_id
            == user.id,

            EmailVerificationToken.used_at
            .is_(None),
        )
        .values(
            used_at=now,
        ),
    )

    database.commit()

    return EmailVerificationResponse(
        message=(
            "Электронная почта подтверждена"
        ),
        email_verified=True,
    )


@app.get(
    "/progress/messier",
    response_model=MessierProgressRead,
)
def get_messier_progress(
    current_user: CurrentUser,
    database: DatabaseSession,
) -> MessierProgressRead:
    progress_rows = list(
        database.scalars(
            select(
                LearningProgress,
            ).where(
                LearningProgress.user_id
                == current_user.id,

                LearningProgress.deck
                == MESSIER_DECK,
            ),
        ).all(),
    )

    progress_rows.sort(
        key=lambda progress:
            int(progress.item_id[1:]),
    )

    training_state = database.scalar(
        select(
            TrainingState,
        ).where(
            TrainingState.user_id
            == current_user.id,

            TrainingState.deck
            == MESSIER_DECK,
        ),
    )

    return MessierProgressRead(
        items=[
            learning_progress_to_messier_item(
                progress,
            )
            for progress in progress_rows
        ],
        queue=(
            list(training_state.queue)
            if training_state is not None
            else []
        ),
        has_saved_progress=(
            bool(progress_rows)
            or training_state is not None
        ),
    )

@app.put(
    "/progress/messier",
    response_model=MessierProgressRead,
)
def save_messier_progress(
    saved_progress: MessierProgressWrite,
    current_user: CurrentUser,
    database: DatabaseSession,
) -> MessierProgressRead:
    database.execute(
        delete(
            LearningProgress,
        ).where(
            LearningProgress.user_id
            == current_user.id,

            LearningProgress.deck
            == MESSIER_DECK,
        ),
    )

    for item in saved_progress.items:
        database.add(
            LearningProgress(
                user_id=current_user.id,
                deck=MESSIER_DECK,
                item_id=item.item_id,
                streak=item.streak,
                correct_answers=(
                    item.correct_answers
                ),
                wrong_answers=(
                    item.wrong_answers
                ),
                learned=item.learned,
                next_prompt_kind=(
                    item.next_prompt_kind
                ),
            ),
        )

    training_state = database.scalar(
        select(
            TrainingState,
        ).where(
            TrainingState.user_id
            == current_user.id,

            TrainingState.deck
            == MESSIER_DECK,
        ),
    )

    if training_state is None:
        training_state = TrainingState(
            user_id=current_user.id,
            deck=MESSIER_DECK,
            queue=list(
                saved_progress.queue,
            ),
        )

        database.add(
            training_state,
        )
    else:
        training_state.queue = list(
            saved_progress.queue,
        )

    try:
        database.commit()
    except IntegrityError as error:
        database.rollback()

        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Не удалось сохранить прогресс "
                "из-за конфликта данных"
            ),
        ) from error

    return MessierProgressRead(
        items=saved_progress.items,
        queue=saved_progress.queue,
        has_saved_progress=True,
    )

@app.delete(
    "/progress/messier",
    response_model=ProgressResetResponse,
)
def reset_messier_progress(
    current_user: CurrentUser,
    database: DatabaseSession,
) -> ProgressResetResponse:
    database.execute(
        delete(
            LearningProgress,
        ).where(
            LearningProgress.user_id
            == current_user.id,

            LearningProgress.deck
            == MESSIER_DECK,
        ),
    )

    database.execute(
        delete(
            TrainingState,
        ).where(
            TrainingState.user_id
            == current_user.id,

            TrainingState.deck
            == MESSIER_DECK,
        ),
    )

    database.commit()

    return ProgressResetResponse(
        message=(
            "Прогресс по объектам Мессье "
            "сброшен"
        ),
    )