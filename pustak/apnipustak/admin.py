from django.contrib import admin
from .models import Book, BookHistory, BookImage, BookLog, User, Title, WatchList
# Register your models here.

admin.site.register(User)
admin.site.register(Book)
admin.site.register(Title)
admin.site.register(BookImage)
admin.site.register(BookLog)
admin.site.register(WatchList)
admin.site.register(BookHistory)