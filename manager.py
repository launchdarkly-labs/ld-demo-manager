from flask import Flask, render_template, redirect, session, url_for, request
from flask_session import Session
from cachelib.file import FileSystemCache
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import requests
import os
import signal
import sys

CLIENT_SECRET_FILE = "/opt/secrets/secrets.json"
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
app = Flask(__name__)
app.config["SESSION_TYPE"] = "cachelib"
app.config["SESSION_SERIALIZATION_FORMAT"] = "json"
app.config["SESSION_CACHELIB"] = (
    FileSystemCache(threshold=500, cache_dir="/sessions"),
)
app.config.from_object(__name__)
Session(app)


def shut_down(signum, frame):
    print("[runtime] SIGTERM received")
    print("[runtime] exiting")
    sys.exit(0)


signal.signal(signal.SIGTERM, shut_down)
signal.signal(signal.SIGINT, shut_down)


def credentials_to_dict(credentials):
    return {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes,
        "id_token": credentials.id_token,
    }


def build_url(path):
    new_path = path
    if path.startswith("/"):
        new_path = path[1:]
    return f"https://demobuilder.launchdarklydemos.com/{new_path}"


@app.route("/logout")
def logout():
    response = requests.post(
        "https://accounts.google.com/o/oauth2/revoke?token="
        + session["credentials"]["token"]
    )
    if "credentials" in session:
        session.pop("credentials")
    if "credentials" in session:
        session.pop("user")
    if "error" in session:
        session.pop("error")
    return redirect("/")


@app.route("/login")
def login():
    if "credentials" not in session:
        return redirect("/authorize")
    else:
        return redirect("/")


@app.route("/authorize")
def authorize():
    # Create the OAuth flow object
    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET_FILE, scopes=SCOPES)
    flow.redirect_uri = build_url("callback")
    authorization_url, state = flow.authorization_url(
        access_type="offline", prompt="select_account", include_granted_scopes="true"
    )

    # Save the state so we can verify the request later
    # session["state"] = state

    return redirect(authorization_url)


@app.route("/callback")
def callback():
    # Verify the request state
    # if request.args.get("state") != session["state"]:
    #     raise Exception("Invalid state")

    # Create the OAuth flow object
    flow = InstalledAppFlow.from_client_secrets_file(
        CLIENT_SECRET_FILE, scopes=SCOPES  # , state=session["state"]
    )
    flow.redirect_uri = build_url("callback")

    # Exchange the authorization code for an access token
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)

    # Save the credentials to the session
    credentials = flow.credentials
    client = build("oauth2", "v2", credentials=credentials)
    user_info = client.userinfo().get().execute()
    email = user_info["email"]
    creds = credentials_to_dict(credentials)
    if not email.endswith("@launchdarkly.com"):
        session["error"] = "You must use a LaunchDarkly email address to log in."
        requests.post(
            "https://accounts.google.com/o/oauth2/revoke?token=" + creds["token"]
        )
    else:
        session["credentials"] = creds
        session["user"] = user_info

    return redirect(build_url("/"))


@app.route("/")
def index():
    email = ""
    error = ""
    if "user" in session:
        email = session.get("user")["email"]
    if "error" in session:
        error = session.get("error")
        session.pop("error")
    return render_template("index.html", email=email, error=error)


if __name__ == "__main__":
    FLASK_KEY = "generic"
    with open("/opt/secrets/flaskkey.txt", "r") as f:
        FLASK_KEY = f.read().strip()
    app.secret_key = FLASK_KEY
    app.run(host="0.0.0.0", port=80)
