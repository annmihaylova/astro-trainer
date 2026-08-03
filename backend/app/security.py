from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

from app.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET,
)


password_hasher = PasswordHash.recommended()

DUMMY_PASSWORD_HASH = password_hasher.hash(
    "astro-trainer-dummy-password",
)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(
    password: str,
    password_hash: str,
) -> bool:
    return password_hasher.verify(
        password,
        password_hash,
    )


def verify_password_safely(
    password: str,
    password_hash: str | None,
) -> bool:
    hash_to_verify = (
        password_hash
        if password_hash is not None
        else DUMMY_PASSWORD_HASH
    )

    password_is_valid = verify_password(
        password,
        hash_to_verify,
    )

    return (
        password_hash is not None
        and password_is_valid
    )


def create_access_token(user_id: int) -> str:
    issued_at = datetime.now(
        timezone.utc,
    )

    expires_at = issued_at + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES,
    )

    payload = {
        "sub": str(user_id),
        "type": "access",
        "iat": issued_at,
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def decode_access_token(
    token: str,
) -> int | None:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={
                "require": [
                    "sub",
                    "iat",
                    "exp",
                ],
            },
        )
    except InvalidTokenError:
        return None

    if payload.get("type") != "access":
        return None

    subject = payload.get("sub")

    if (
        not isinstance(subject, str)
        or not subject.isdigit()
    ):
        return None

    return int(subject)