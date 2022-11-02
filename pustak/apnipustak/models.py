from email.policy import default
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_delete
from django.dispatch import receiver
from pyuploadcare.dj.models import ImageGroupField,ImageField
from .uploadcare import del_img



# Create your models here.

class User(AbstractUser):
    email = models.EmailField(('email address'), blank=False)
    picture = ImageField(blank=True)
    pass


class Title(models.Model):
    isbn_no = models.CharField(blank=True, null=True, max_length=13)
    title = models.CharField(max_length=128)

    def __str__(self):
        return self.title

class Book(models.Model):

    #semesters
    semester_choices = [
        ("phd", "PHD"),
        ("other", "Other")
    ]
    for i in range(10, 0, -1):
        semester_choices.insert(0, (str(i), f"Semester {i}"))
    #---------------------------------------------------------------------------------------


    isbn = models.ForeignKey(Title, on_delete=models.CASCADE, related_name="isbn_book", blank=True, null=True)
    description = models.TextField(max_length=10024, blank=True)
    created = models.DateTimeField(auto_now_add=True, blank=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="seller", blank=False)
    subject = models.CharField(max_length=50, blank=True)
    semester = models.CharField(choices=semester_choices, max_length=64)
    original_price = models.IntegerField(blank=False)
    offer_price = models.IntegerField(blank=False)
    busy = models.BooleanField(default=False)
    

    def __str__(self):
        return f"{self.isbn.title}"



class BookImage(models.Model):

    photo = ImageGroupField()
    listing = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='book_listing')


    def __str__(self):
        return f"{str(self.listing)} id={self.listing.id}"


class BookLog(models.Model):
    listing = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='log_listing')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="log_buyer", blank=False)

    def __str__(self):
        return f"{self.buyer} looking for {self.listing}"

@receiver(post_delete, sender=BookImage)
def delete_images(sender, instance, using, **kwargs):
    

    for each in instance.photo.info["files"]:
        del_img(each["uuid"])

# @receiver(post_delete, sender=Book)
# def delete_title(sender, instance, using, **kwargs):

#     if not len(Book.objects.filter(isbn=instance.isbn)):
        
#         try:
#             Title.objects.get(id=instance.isbn.id).delete()
#         except:
#             pass
        

class WatchList(models.Model):
    listing = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='watch_listing')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watcher", blank=False)

class BookHistory(models.Model):
    listing = models.ForeignKey(Title, on_delete=models.CASCADE, related_name='list_history')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="list_buyer", blank=False)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="list_seller", blank=False)