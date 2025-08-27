from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .services.input_checker import normalize_inputs

@api_view(["POST"])
@permission_classes([IsAuthenticated])  # switch to AllowAny locally if needed
def input_check(request):
    payload = request.data or {}
    # Example profile context: wire these to your real user model fields
    profile_ctx = {
        "student_id": getattr(request.user, "student_id", None),
        "program": getattr(request.user, "program", None),
        "full_name": getattr(request.user, "full_name", None),
        "birthdate": getattr(request.user, "birthdate", None),
        "exact_address": getattr(request.user, "exact_address", None),
        "place_of_birth": getattr(request.user, "place_of_birth", None),
    }
    result = normalize_inputs(payload, profile=profile_ctx)
    return Response(result, status=status.HTTP_200_OK)
