from datetime import datetime
from string import ascii_letters, digits, punctuation
from typing import Any, Self
from unicodedata import category, normalize

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)


ALLOWED_LOGIN_CHARACTERS = frozenset(
    ascii_letters
    + digits
    + punctuation
)

ALLOWED_NAME_SEPARATORS = frozenset({
    " ",
    "-",
    "'",
    "’",
})


def normalize_person_name(value: Any) -> Any:
    if not isinstance(value, str):
        return value

    if any(character in value for character in "\r\n\t"):
        raise ValueError(
            "Имя и фамилия не могут содержать табуляцию "
            "или переносы строк",
        )

    normalized_value = normalize(
        "NFC",
        " ".join(value.strip().split()),
    )

    if not normalized_value:
        raise ValueError(
            "Имя и фамилия не могут быть пустыми",
        )

    if (
        not normalized_value[0].isalpha()
        or not normalized_value[-1].isalpha()
    ):
        raise ValueError(
            "Имя и фамилия должны начинаться "
            "и заканчиваться буквой",
        )

    for character in normalized_value:
        character_category = category(character)

        is_letter = character_category.startswith("L")
        is_letter_mark = character_category.startswith("M")
        is_separator = character in ALLOWED_NAME_SEPARATORS

        if is_letter or is_letter_mark or is_separator:
            continue

        raise ValueError(
            "Имя и фамилия могут содержать только буквы, "
            "пробелы, дефисы и апострофы",
        )

    return normalized_value


def validate_login_value(value: str) -> str:
    for character in value:
        if character not in ALLOWED_LOGIN_CHARACTERS:
            raise ValueError(
                "Логин может содержать только латинские "
                "буквы, цифры и специальные знаки "
                "без пробелов",
            )

    return value


class UserRegistration(BaseModel):
    first_name: str = Field(
        min_length=1,
        max_length=100,
    )

    last_name: str = Field(
        min_length=1,
        max_length=100,
    )

    email: EmailStr = Field(
        max_length=320,
    )

    login: str = Field(
        min_length=3,
        max_length=32,
    )

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    password_repeat: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator(
        "first_name",
        "last_name",
        mode="before",
    )
    @classmethod
    def validate_person_name(
        cls,
        value: Any,
    ) -> Any:
        return normalize_person_name(value)

    @field_validator(
        "email",
        mode="before",
    )
    @classmethod
    def normalize_email_input(
        cls,
        value: Any,
    ) -> Any:
        if isinstance(value, str):
            return value.strip()

        return value

    @field_validator("login")
    @classmethod
    def validate_login(
        cls,
        value: str,
    ) -> str:
        return validate_login_value(value)

    @model_validator(mode="after")
    def validate_password_repeat(self) -> Self:
        if self.password != self.password_repeat:
            raise ValueError(
                "Пароли не совпадают",
            )

        return self


class UserLogin(BaseModel):
    login: str = Field(
        min_length=3,
        max_length=32,
    )

    password: str = Field(
        min_length=1,
        max_length=128,
    )

    @field_validator("login")
    @classmethod
    def validate_login(
        cls,
        value: str,
    ) -> str:
        return validate_login_value(value)


class UserRead(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    login: str
    email_verified: bool
    created_at: datetime

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead

class EmailVerificationConfirm(BaseModel):
    token: str = Field(
        min_length=32,
        max_length=512,
    )


class EmailVerificationResponse(BaseModel):
    message: str
    email_verified: bool