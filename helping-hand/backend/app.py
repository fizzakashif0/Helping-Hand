import os
from flask import Flask

from modules.auth.routes import auth_bp


def create_app() -> Flask:
    app = Flask(__name__)

    # JSON settings
    app.config["JSON_SORT_KEYS"] = False

    # Register blueprints
    app.register_blueprint(auth_bp)

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)

