from functools import wraps

import jwt
from flask import request, jsonify

from config.settings import Settings
from modules.auth.model import find_user_by_id


def token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401

        token = auth_header.split("Bearer ", 1)[1].strip()
        if not token:
            return jsonify({"error": "Missing token"}), 401

        if not Settings.JWT_SECRET:
            return jsonify({"error": "JWT_SECRET not configured"}), 500

        try:
            decoded = jwt.decode(token, Settings.JWT_SECRET, algorithms=[Settings.JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401

        user_id = decoded.get("user_id")
        if not user_id:
            return jsonify({"error": "Invalid token payload"}), 401

        user = find_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 401

        # Pass current_user into route handler
        # Ensure role is present even if missing in user doc
        if "role" not in user and "role" in decoded:
            user["role"] = decoded["role"]

        kwargs["current_user"] = user
        return fn(*args, **kwargs)

    return wrapper


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_user = kwargs.get("current_user")
            if not current_user:
                return jsonify({"error": "Authentication required"}), 401

            user_role = current_user.get("role")
            if user_role not in roles:
                return jsonify({"error": "Forbidden"}), 403

            return fn(*args, **kwargs)

        return wrapper

    return decorator

