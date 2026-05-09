from flask import Blueprint

from . import controller


auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    return controller.register()


@auth_bp.post("/login")
def login():
    return controller.login()


@auth_bp.post("/forgot-password")
def forgot_password():
    return controller.forgot_password()


@auth_bp.post("/verify-otp")
def verify_otp():
    return controller.verify_otp()


@auth_bp.post("/reset-password")
def reset_password():
    return controller.reset_password()

