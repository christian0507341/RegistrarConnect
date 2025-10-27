import os
import requests

API_BASE = os.getenv("API_BASE", "http://127.0.0.1:8000/api")  # override via env in prod

class APIClient:
    def __init__(self, access_token: str = None):
        self.session = requests.Session()
        self.access_token = access_token
        if access_token:
            self.session.headers.update({"Authorization": f"Bearer {access_token}"})

    def set_token(self, token: str):
        """Update session with a new token dynamically."""
        self.access_token = token
        self.session.headers.update({"Authorization": f"Bearer {token}"})

    def get_current_user(self):
        """Fetch the authenticated user profile (student) from backend."""
        url = f"{API_BASE}/accounts/me/"
        resp = self.session.get(url)
        resp.raise_for_status()
        return resp.json()

    def save_chat_history(self, student_id: str, history: list):
        """Send chatbot history to backend for storage/logging."""
        url = f"{API_BASE}/ai/chat-history/"
        payload = {"student_id": student_id, "history": history}
        resp = self.session.post(url, json=payload)
        resp.raise_for_status()
        return resp.json()
