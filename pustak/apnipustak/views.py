from django.http import HttpResponseRedirect
from django.shortcuts import render
from .models import Book, BookImage, BookLog, Title, User, WatchList, BookHistory
from chat.models import Room
from django.contrib import messages
from django import forms
from allauth.account.decorators import verified_email_required, login_required
import requests 
from django.http import JsonResponse
import json
from django.http import Http404
from django.views.decorators.csrf import csrf_exempt
from pyuploadcare.dj.forms import FileWidget, ImageGroupField, ImageField
from .uploadcare import del_img
from django.db.models import Q

"""Limit number of entries"""

LIMIT = 12

"""to show while showing listings"""


# Create your views here.




class SellBook(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super(SellBook, self).__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
    class Meta:
        model = Book
        exclude = ['owner', 'isbn', 'busy']


class BookISBN(forms.ModelForm):
    def __init__(self, *args, **kwargs):
           super().__init__(*args, **kwargs)
           self.fields['title'].widget.attrs.update({'class': 'form-control'})
           self.fields['isbn_no'].widget.attrs.update({'class':'form-control', 'id': 'isbn', 'type':'number'})
    class Meta:
        model = Title
        exclude = ['qty']
        labels = {"isbn_no": ("ISBN No")}

class BookImageForm(forms.ModelForm):

    class Meta: 

        model = BookImage
        exclude = ['listing']
        photo = ImageGroupField(widget=FileWidget(attrs={
        'data-cdn-base': 'https://cdn.super-candidates.com',
        'data-image-shrink': '1024x1024',
    }))

class Avatar(forms.ModelForm):
     class Meta:

        model = User
        fields = ['picture']
        photo = ImageField(widget=FileWidget(attrs={
        'data-cdn-base': 'https://cdn.super-candidates.com',
        'data-image-shrink': '1024x1024',
    }))

def index(request):
    
    return render(request, "apnipustak/index.html",{
        "books": Title.objects.all()
    })

def profile(request, username):
    if request.method == 'POST':
        pre_photo = request.user.picture
        photo = Avatar(request.POST, instance=request.user)
        if photo.is_valid():
            if request.user.picture:
                del_img(pre_photo.uuid)
            photo.save()
        return HttpResponseRedirect(username)
    orders = ""
    avatar = ""
    transactions = ""
    if username == request.user.username:
        orders = BookLog.objects.filter(buyer=request.user).all()
        avatar = Avatar(instance=request.user)
        transactions = BookHistory.objects.filter(Q(buyer=request.user) | Q(seller=request.user)).all()
        #print(orders)
    
    return render(request, "account/profile.html", {
       "consumer": User.objects.get(username=username),
       "orders": orders,
       "avatar": avatar,
       "transactions": transactions
    })

    
# @verified_email_required
def sell(request):
    # print("\n\n\n")
    # print(request.get_port())

    if request.method == 'POST':
        book = SellBook(request.POST)
        images = BookImageForm(request.POST)
        isbn = BookISBN(request.POST)
        isbn_check = True
        isbn_obj = isbn.save(commit=False)
       
        if isbn_obj.isbn_no:
            try:
                int(isbn_obj.isbn_no)
                if not (len(isbn_obj.isbn_no) == 10 or len(isbn_obj.isbn_no) == 13):
                    isbn_check = False
            except:
                isbn_check = False
        
        if book.is_valid() and images.is_valid() and isbn_check:
            obj = book.save(commit=False)
            if obj.original_price < obj.offer_price:
                messages.warning(request, "Offer price must be lesser than the original price")
                return HttpResponseRedirect("/sell/")
            obj.owner = request.user

            if isbn_obj.isbn_no:
                r = requests.get(f'https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn_obj.isbn_no}')
                isbn_book = r.json()
                if isbn_book['totalItems'] > 0:
                    new_book = isbn_book["items"][0]["volumeInfo"]
                    isbns = new_book["industryIdentifiers"]
                    
                    for index in range(len(isbns)):
                        if isbns[index]["type"] == "ISBN_13":
                            isbn_no = isbns[index]["identifier"]

                    try:
                        pre_isbn = Title.objects.get(isbn_no = isbn_no)
                        isbn_obj = pre_isbn
                    except:
                        isbn_obj.title = new_book["title"]
                        isbn_obj.isbn_no = isbn_no
            isbn_obj.save()
            obj.isbn = isbn_obj
            
            obj.save()
           
            img = images.save(commit=False)
            img.listing = obj
            img.save()
            
 
            messages.success(request, "Listing Added Successfully")
        else:
            # print(book.errors)
            messages.warning(request, "Something went wrong!")
            return HttpResponseRedirect("/sell/")
        return HttpResponseRedirect("/")
    return render(request, "apnipustak/sell.html", {"details": SellBook(), "isbn": BookISBN(), "image": BookImageForm()})

def titleApi(request):

    start = int(request.GET.get("start") or 0) * LIMIT
    key = request.GET.get("q") or ""

    try:
        isbn = int(key)
        if len(key) == 13:
            isbn = str(isbn / 10)

        titles = Title.objects.filter(isbn_no__icontains=isbn)
        
    except:
        from django.db.models import CharField, TextField
        from django.db.models import  Q

        fields = [f for f in Title._meta.fields if isinstance(f, CharField)]
        queries = [Q(**{f.name + "__icontains": key}) for f in fields]
        qs = Q()
        for query in queries:
            qs = qs | query

        fields = [f for f in Book._meta.fields if isinstance(f, CharField) or isinstance(f, TextField)]
        queries = [Q(**{"isbn_book__"+ f.name + "__icontains": key}) for f in fields]

        for query in queries:
            qs = qs | query

        titles = Title.objects.filter(qs).distinct()[start:start+LIMIT+1]
        # print(titles)



    book_json = list(titles.values())
    title_json = []
    for each in book_json:
        
        books = Title.objects.get(id=each["id"]).isbn_book.order_by("offer_price")
        if books:
            new = books.values('description', 'offer_price', 'original_price')[0]   
            image = books[0].book_listing.all()[0].photo
            
            new["images"] = image.file_cdn_urls
            each.update(new)
            title_json.append(each)
    
    return JsonResponse(title_json, safe=False, status=200)

def listingApi(request, id):

    start = int(request.GET.get("start") or 0) * LIMIT
    owner = (request.GET.get("seller") or "")

    if not owner:
        try:
            book = Title.objects.get(id=id)
            title = book.title
            isbn = book.isbn_no
        except:
            raise Http404

        listings = Book.objects.filter(isbn=id).order_by("-created")[start:start+LIMIT+1]
    
    else:
        listings = Book.objects.select_related('isbn').filter(owner=owner).order_by("-created")[start:start+LIMIT+1]
    # print(listings.count())
    books = list(listings.values())

    for i in range(listings.count()):
        each = books[i]
        image = BookImage.objects.get(listing=each["id"]).photo
        each["images"] = image.file_cdn_urls
        try:
            each["title"] = title
            each["isbn"] = isbn
        except:
            each["title"] = listings[i].isbn.title
            each["isbn"] = listings[i].isbn.isbn_no
        watched = False
        if request.user.is_authenticated:
            watched = WatchList.objects.filter(user=request.user, listing=each["id"]).exists()
        each["watched"] = watched
        
    
    return JsonResponse(books, safe=False, status=200)

def BookApi(request, id):
    try:
        id = int(id)
        book = Book.objects.select_related('isbn').filter(id=id)
        booklist = list(book.values())[0]
        booklist["title"] = book[0].isbn.title
        booklist["isbn"] = book[0].isbn.isbn_no
        booklist["images"] = book[0].book_listing.all()[0].photo.file_cdn_urls
        watched = False
        if request.user.is_authenticated:
            watched = WatchList.objects.filter(user=request.user, listing=book[0]).exists()
        booklist["watched"] = watched
    except:
        raise Http404

    return JsonResponse(booklist, safe=False, status=200)

@login_required
@csrf_exempt
def AddWatch(request):
    if request.method == "PUT":
        data = json.loads(request.body)
        l_id = int(data["id"])
        try:
            listing = Book.objects.get(id=l_id)
        except:
            raise Http404
        
        try:
            x = WatchList.objects.get(user=request.user, listing=listing)
            x.delete()
            y = {"message":"Book removed from Watchlist",
                "method":"removed"
            }
            return JsonResponse(y, safe=False, status=200)
        except:
            WatchList.objects.create(user=request.user, listing=listing)
            
            return JsonResponse(({"message": "Book added to Watchlist",
                "method": "added"
            }), safe=False,status=200)

    raise Http404

@login_required
def ShowWatch(request):
    watchlist = WatchList.objects.filter(user=request.user)

    return render(request, "apnipustak/watchlist.html", {"watchlist": watchlist}) 

@login_required
def delete_room(request):
    if request.method == "POST":
        room = request.POST["room"]
        if 'cancel' in request.POST:
            Room.objects.get(name=room).delete()
            return HttpResponseRedirect('/chat')
        elif 'close' in request.POST:
            index = room.find("t2b")
            buyer = int(room[:index])
            listing = Room.objects.get(name=room).listing
            if listing.owner == request.user:
                BookHistory.objects.create(listing=listing.isbn, buyer=User.objects.get(id=buyer), seller=request.user)
                listing.delete()
    return HttpResponseRedirect(f'/profile/{request.user.username}')