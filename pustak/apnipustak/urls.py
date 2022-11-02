from . import views
from django.urls import path

urlpatterns = [
    path('', views.index, name="index"),
    path('accounts/profile/<str:username>', views.profile, name="profile"),
    path('sell/', views.sell, name="sell"),
    path('json/titles/', views.titleApi, name="titles"),
    path('json/listings/<int:id>/', views.listingApi, name="listings"),
    path('json/book/<int:id>/', views.BookApi, name="book"),
    path('json/watch/', views.AddWatch, name="watch"),
    path('wishlist/', views.ShowWatch, name="wishlist"),
    path('delete/', views.delete_room, name='delete')
]