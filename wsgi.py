from manager import app

if __name__ == "__main__":
    FLASK_KEY = "generic"
    with open("/opt/secrets/flaskkey.txt", "r") as f:
        FLASK_KEY = f.read().strip()
    app.secret_key = FLASK_KEY
    app.run()
