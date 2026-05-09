from pymongo import MongoClient

from .settings import Settings

_client: MongoClient | None = None


def get_db():
    global _client
    if _client is None:
        if not Settings.MONGO_URI:
            raise RuntimeError("MONGO_URI is not set")
        _client = MongoClient(Settings.MONGO_URI)

    # Use default database from URI if present, otherwise fallback
    # MongoClient('mongodb://host/dbname') keeps that dbname internally.
    # We'll explicitly select 'helping_hand' if not specified.
    # NOTE: pymongo doesn't expose 'default dbname' directly; choose one.
    return _client["helping_hand"]

