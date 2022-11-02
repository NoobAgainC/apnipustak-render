from . import views
from django.urls import path

urlpatterns = [
    path('', views.index, name="chatindex"),
    path('room/<str:room_name>/', views.room, name='room'),
    path('create/', views.create_room, name='create_room'),
    path('json/room/<str:room_name>/', views.fetch_msg, name='fetch'),
]