from datetime import datetime
from string import ascii_letters, digits, punctuation
from typing import Any, Literal, Self
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


MESSIER_REQUIRED_STREAK = 16
MESSIER_OBJECTS_COUNT = 110


def validate_messier_item_id(
    value: str,
) -> str:
    if not value.startswith("m"):
        raise ValueError(
            "Идентификатор объекта должен "
            "начинаться с буквы m",
        )

    number_text = value[1:]

    if not number_text.isdigit():
        raise ValueError(
            "После буквы m должен находиться "
            "номер объекта",
        )

    object_number = int(number_text)

    if not (
        1
        <= object_number
        <= MESSIER_OBJECTS_COUNT
    ):
        raise ValueError(
            "Номер объекта Мессье должен "
            "находиться от 1 до 110",
        )

    expected_value = f"m{object_number}"

    if value != expected_value:
        raise ValueError(
            "Идентификатор должен иметь вид "
            "m1, m42 или m110",
        )

    return value


class MessierProgressItem(BaseModel):
    item_id: str = Field(
        min_length=2,
        max_length=4,
    )

    streak: int = Field(
        ge=0,
        le=MESSIER_REQUIRED_STREAK,
    )

    correct_answers: int = Field(
        ge=0,
    )

    wrong_answers: int = Field(
        ge=0,
    )

    learned: bool

    next_prompt_kind: Literal[
        "name",
        "position",
    ]

    @field_validator("item_id")
    @classmethod
    def validate_item_id(
        cls,
        value: str,
    ) -> str:
        return validate_messier_item_id(
            value,
        )

    @model_validator(mode="after")
    def validate_learning_state(
        self,
    ) -> Self:
        expected_learned = (
            self.streak
            >= MESSIER_REQUIRED_STREAK
        )

        if self.learned != expected_learned:
            raise ValueError(
                "learned должен быть true только "
                "при streak, равном 16",
            )

        if (
            self.correct_answers
            < self.streak
        ):
            raise ValueError(
                "Количество правильных ответов "
                "не может быть меньше streak",
            )

        return self


class MessierProgressWrite(BaseModel):
    items: list[
        MessierProgressItem
    ] = Field(
        default_factory=list,
        max_length=MESSIER_OBJECTS_COUNT,
    )

    queue: list[str] = Field(
        default_factory=list,
        max_length=MESSIER_OBJECTS_COUNT,
    )

    @model_validator(mode="after")
    def validate_progress(
        self,
    ) -> Self:
        progress_item_ids = [
            item.item_id
            for item in self.items
        ]

        if (
            len(progress_item_ids)
            != len(set(progress_item_ids))
        ):
            raise ValueError(
                "Один объект не может дважды "
                "присутствовать в прогрессе",
            )

        for item_id in self.queue:
            validate_messier_item_id(
                item_id,
            )

        if (
            len(self.queue)
            != len(set(self.queue))
        ):
            raise ValueError(
                "Один объект не может дважды "
                "присутствовать в очереди",
            )

        learned_item_ids = {
            item.item_id
            for item in self.items
            if item.learned
        }

        learned_objects_in_queue = (
            learned_item_ids
            .intersection(self.queue)
        )

        if learned_objects_in_queue:
            raise ValueError(
                "Выученные объекты не должны "
                "находиться в очереди",
            )

        return self


class MessierProgressRead(BaseModel):
    items: list[MessierProgressItem]
    queue: list[str]
    has_saved_progress: bool


class ProgressResetResponse(BaseModel):
    message: str