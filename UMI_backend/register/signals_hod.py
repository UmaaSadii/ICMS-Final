from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import HODRegistrationRequest
from .serializers import HODRegistrationRequestSerializer

@receiver([post_save, post_delete], sender=HODRegistrationRequest)
def hod_request_changed(sender, instance=None, **kwargs):
    channel_layer = get_channel_layer()
    if channel_layer:
        requests = HODRegistrationRequest.objects.all().order_by('-requested_at')
        serializer = HODRegistrationRequestSerializer(requests, many=True)
        
        data = {
            'requests': serializer.data,
            'stats': {
                'total': requests.count(),
                'pending': requests.filter(status='pending').count(),
                'approved': requests.filter(status='approved').count(),
                'rejected': requests.filter(status='rejected').count()
            }
        }
        
        async_to_sync(channel_layer.group_send)(
            'hod_requests',
            {
                'type': 'hod_request_update',
                'data': data
            }
        )