from flask import Flask, render_template, redirect, url_for, session, request

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

CLIENT_ID = ""
CLIENT_SECRET = ""
CLIENT_SECRET_FILE = "secrets.json"
SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]

AUTH_URL = "https://accounts.google.com/o/oauth2/auth"

app = Flask(__name__)


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
    flow.redirect_uri = url_for("callback", _external=True)
    authorization_url, state = flow.authorization_url(
        access_type="offline", prompt="select_account"
    )

    # Save the state so we can verify the request later
    session["state"] = state

    return redirect(authorization_url)


@app.route("/callback")
def callback():
    # Verify the request state
    if request.args.get("state") != session["state"]:
        raise Exception("Invalid state")

    # Create the OAuth flow object
    flow = InstalledAppFlow.from_client_secrets_file(
        CLIENT_SECRET_FILE, scopes=SCOPES, state=session["state"]
    )
    flow.redirect_uri = url_for("callback", _external=True)

    # Exchange the authorization code for an access token
    authorization_response = request.url
    flow.fetch_token(authorization_response=authorization_response)

    # Save the credentials to the session
    credentials = flow.credentials
    session["credentials"] = credentials_to_dict(credentials)
    client = build("oauth2", "v2", credentials=credentials)
    user_info = client.userinfo().get().execute()
    session["user"] = user_info

    return redirect(url_for("/"))


@app.route("/")
def hello_world():
    return render_template("index.html", data=session.get("user"))


if __name__ == "__main__":
    app.secret_key = "super secret key"
    app.config["SESSION_TYPE"] = "cachelib"
    app.run(host="0.0.0.0", port=443)
