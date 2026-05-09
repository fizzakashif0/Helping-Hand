import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
import random

from bson import ObjectId

from config.settings import Settings
from modules.auth.model import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    update_user,
)


def _utcnow():
    return datetime.now(timezone.utc)


def _generate_jwt(user_id: str, role: str) -> str:
    if not Settings.JWT_SECRET:
        raise RuntimeError("JWT_SECRET is not set")

    exp = _utcnow() + timedelta(minutes=Settings.JWT_EXP_MINUTES)
    payload = {"user_id": user_id, "role": role, "exp": exp}
    token = jwt.encode(payload, Settings.JWT_SECRET, algorithm=Settings.JWT_ALGORITHM)
    # pyjwt may return str already; keep normalized
    return token if isinstance(token, str) else token.decode("utf-8")


def register():
    from flask import request, jsonify

    data = request.get_json(force=True) or {}

    required = ["name", "email", "password", "phone", "role"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if data.get("role") not in ["donor", "recipient", "NGO", "admin"]:
        return jsonify({"error": "Invalid role"}), 400

    if find_user_by_email(data["email"]):
        return jsonify({"error": "Email already registered"}), 409

    hashed = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())

    user_doc = {
        "name": data["name"],
        "email": data["email"],
        "password": hashed.decode("utf-8"),
        "phone": data["phone"],
        "role": data["role"],
        "profile_picture": data.get("profile_picture", ""),
        "is_verified": data.get("is_verified", False),
        "is_blocked": data.get("is_blocked", False),
        "otp": "",
        "otp_expiry": None,
        "bio": data.get("bio", ""),
        "address": data.get("address", ""),
        "city": data.get("city", ""),
        "location": data.get("location", {"lat": 0.0, "lng": 0.0}),
        "rating_avg": data.get("rating_avg", 0.0),
        "total_donations": data.get("total_donations", 0),
        "total_received": data.get("total_received", 0),
        "created_at": _utcnow(),
    }

    inserted_id = create_user(user_doc)
    token = _generate_jwt(str(inserted_id), user_doc["role"])

    return jsonify({"token": token, "user_id": str(inserted_id), "role": user_doc["role"]}), 201


def login():
    from flask import request, jsonify

    data = request.get_json(force=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = find_user_by_email(email)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if user.get("is_blocked"):
        return jsonify({"error": "Account is blocked"}), 403

    stored_hash = user.get("password")
    if not stored_hash:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8")):
        return jsonify({"error": "Invalid credentials"}), 401

    token = _generate_jwt(str(user["_id"]), user.get("role"))
    return jsonify({"token": token, "user_id": str(user["_id"]), "role": user.get("role")}), 200


def forgot_password():
    from flask import request, jsonify

    data = request.get_json(force=True) or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "email is required"}), 400

    user = find_user_by_email(email)
    if not user:
        # Avoid user enumeration
        return jsonify({"message": "If that email exists, an OTP will be sent."}), 200

    otp = f"{random.randint(0, 999999):06d}"
    otp_expiry = _utcnow() + timedelta(minutes=10)

    update_user(str(user["_id"]), {"otp": otp, "otp_expiry": otp_expiry})

    # In production, send OTP via email/SMS. Here we return for testing.
    return jsonify({"message": "OTP generated", "otp": otp, "otp_expiry": otp_expiry.isoformat()}), 200


def verify_otp():
    from flask import request, jsonify

    data = request.get_json(force=True) or {}
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({"error": "email and otp are required"}), 400

    user = find_user_by_email(email)
    if not user:
        return jsonify({"error": "Invalid OTP"}), 400

    if user.get("otp") != str(otp):
        return jsonify({"error": "Invalid OTP"}), 400

    expiry = user.get("otp_expiry")
    if not expiry or expiry <= _utcnow():
        return jsonify({"error": "OTP expired"}), 400

    return jsonify({"message": "OTP verified"}), 200


def reset_password():
    from flask import request, jsonify

    data = request.get_json(force=True) or {}
    email = data.get("email")
    otp = data.get("otp")
    new_password = data.get("new_password")

    if not email or not otp or not new_password:
        return jsonify({"error": "email, otp and new_password are required"}), 400

    user = find_user_by_email(email)
    if not user:
        return jsonify({"error": "Invalid OTP"}), 400

    if user.get("otp") != str(otp):
        return jsonify({"error": "Invalid OTP"}), 400

    expiry = user.get("otp_expiry")
    if not expiry or expiry <= _utcnow():
        return jsonify({"error": "OTP expired"}), 400

    hashed = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

    update_user(
        str(user["_id"]),
        {
            "password": hashed.decode("utf-8"),
            "otp": "",
            "otp_expiry": None,
        },
    )

    return jsonify({"message": "Password updated"}), 200

