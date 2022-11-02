from email import message
from django.db import models
from apnipustak.models import Book, User
# Create your models here.

  
class Room(models.Model):
    name = models.CharField(max_length=100, unique=True)
    listing = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="selling_book")
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="approacher")   

    def __str__(self):
        return self.name


class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="chatbox")
    message = models.CharField(max_length=256)
    time = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.message

class Contact(models.Model):
    room  = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="contactchat")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contactuser")
    friend = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contactfriend")

    def __str__(self):
        return f"{self.user.username} and {self.friend.username}"