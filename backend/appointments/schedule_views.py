from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from .models import AppointmentTimeSlot
from .serializers import AppointmentTimeSlotSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def time_slot_list_create(request):
    """
    GET: List all time slots
    POST: Create a new time slot (Registrar/Admin only)
    """
    user = request.user
    
    if request.method == 'GET':
        # Anyone authenticated can view time slots
        time_slots = AppointmentTimeSlot.objects.all()
        serializer = AppointmentTimeSlotSerializer(time_slots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # Only registrar and admin can create time slots
        if not hasattr(user, 'role') or user.role not in ['registrar', 'admin']:
            return Response(
                {"detail": "You do not have permission to create time slots."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AppointmentTimeSlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def time_slot_detail(request, pk):
    """
    GET: Retrieve a specific time slot
    PATCH: Update a time slot (Registrar/Admin only)
    DELETE: Delete a time slot (Registrar/Admin only)
    """
    user = request.user
    
    try:
        time_slot = AppointmentTimeSlot.objects.get(pk=pk)
    except AppointmentTimeSlot.DoesNotExist:
        return Response(
            {"detail": "Time slot not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        # Anyone authenticated can view a time slot
        serializer = AppointmentTimeSlotSerializer(time_slot)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method == 'PATCH':
        # Only registrar and admin can update time slots
        if not hasattr(user, 'role') or user.role not in ['registrar', 'admin']:
            return Response(
                {"detail": "You do not have permission to update time slots."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = AppointmentTimeSlotSerializer(time_slot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only registrar and admin can delete time slots
        if not hasattr(user, 'role') or user.role not in ['registrar', 'admin']:
            return Response(
                {"detail": "You do not have permission to delete time slots."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        time_slot.delete()
        return Response(
            {"detail": "Time slot deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

