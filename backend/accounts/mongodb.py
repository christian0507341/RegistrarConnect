# accounts/mongodb.py

from django.conf import settings

db = settings.mongo_db
users_collection = db["users"]
