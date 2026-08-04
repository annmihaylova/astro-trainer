from collections.abc import Generator
from os import getenv
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import (
    create_engine,
    event,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Session,
    sessionmaker,
)


BACKEND_DIRECTORY = (
    Path(__file__).resolve().parent.parent
)

load_dotenv(
    BACKEND_DIRECTORY / ".env",
)


DATABASE_URL = getenv(
    "DATABASE_URL",
    "sqlite:///./astro_trainer.db",
)


is_sqlite_database = (
    DATABASE_URL.startswith("sqlite")
)


engine_options: dict = {
    "pool_pre_ping": True,
}


if is_sqlite_database:
    engine_options["connect_args"] = {
        "check_same_thread": False,
    }


engine = create_engine(
    DATABASE_URL,
    **engine_options,
)


if is_sqlite_database:
    @event.listens_for(
        engine,
        "connect",
    )
    def enable_sqlite_foreign_keys(
        dbapi_connection,
        _connection_record,
    ) -> None:
        cursor = dbapi_connection.cursor()

        cursor.execute(
            "PRAGMA foreign_keys=ON",
        )

        cursor.close()


SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


def get_database_session(
) -> Generator[Session, None, None]:
    database = SessionLocal()

    try:
        yield database
    finally:
        database.close()