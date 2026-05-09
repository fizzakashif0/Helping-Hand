import os


class Settings:
    # JWT
    JWT_SECRET = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXP_MINUTES = int(os.getenv("JWT_EXP_MINUTES", "60"))

    # Mongo
    MONGO_URI = os.getenv("MONGO_URI", "")

