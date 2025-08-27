from django.urls import path
from .views import input_check
urlpatterns = [ path("input-check/", input_check, name="input-check") ]
