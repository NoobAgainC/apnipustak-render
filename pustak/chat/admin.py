from django.contrib import admin
from .models import Contact, Message, Room


# Register your models here.

admin.site.register(Message)
admin.site.register(Room)
admin.site.register(Contact)