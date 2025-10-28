import os, json

TOKEN_FILE = os.path.join(os.path.dirname(__file__), "token.json")

def save_token(token: str):
    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        json.dump({"access": token}, f)

def load_token() -> str:
    if not os.path.isfile(TOKEN_FILE):
        raise RuntimeError("No token found. Please login first.")
    with open(TOKEN_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("access")
