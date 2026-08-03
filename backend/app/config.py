from os import getenv
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIRECTORY = Path(__file__).resolve().parent.parent

load_dotenv(
    BACKEND_DIRECTORY / ".env",
)


JWT_SECRET = getenv("JWT_SECRET")

if JWT_SECRET is None or len(JWT_SECRET) < 64:
    raise RuntimeError(
        "В backend/.env отсутствует нормальный JWT_SECRET",
    )


JWT_ALGORITHM = "HS256"


access_token_expire_raw = getenv(
    "ACCESS_TOKEN_EXPIRE_MINUTES",
    "1440",
)

try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        access_token_expire_raw,
    )
except ValueError as error:
    raise RuntimeError(
        "ACCESS_TOKEN_EXPIRE_MINUTES должен быть целым числом",
    ) from error


if ACCESS_TOKEN_EXPIRE_MINUTES <= 0:
    raise RuntimeError(
        "ACCESS_TOKEN_EXPIRE_MINUTES должен быть больше нуля",
    )

FRONTEND_URL = getenv(
    "FRONTEND_URL",
    "http://localhost:5173",
).rstrip("/")


email_verification_expire_raw = getenv(
    "EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS",
    "8",
)

try:
    EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS = int(
        email_verification_expire_raw,
    )
except ValueError as error:
    raise RuntimeError(
        "EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS "
        "должен быть целым числом",
    ) from error


if EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS <= 0:
    raise RuntimeError(
        "EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS "
        "должен быть больше нуля",
    )