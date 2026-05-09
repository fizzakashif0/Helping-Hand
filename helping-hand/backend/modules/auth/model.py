from datetime import datetime

from bson import ObjectId

from config.mongo import get_db


def _users_collection():
    return get_db().users


def find_user_by_email(email: str):
    return _users_collection().find_one({"email": email})


def find_user_by_id(user_id: str):
    return _users_collection().find_one({"_id": ObjectId(user_id)})


def create_user(data: dict):
    result = _users_collection().insert_one(data)
    return result.inserted_id


def update_user(user_id: str, data: dict):
    return _users_collection().update_one(
        {"_id": ObjectId(user_id)},
        {"$set": data},
    )

