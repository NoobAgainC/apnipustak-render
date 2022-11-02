from django.shortcuts import render
from allauth.account.decorators import verified_email_required, login_required
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from .models import Contact, Message, Room
from apnipustak.models import Book, BookHistory, BookLog
from django.urls import reverse

# Create your views here.

MSG_LIMIT = 15
@login_required
def index(request):
    contacts = Contact.objects.select_related('room', 'friend').filter(user=request.user)
    return render(request, 'chat/chat.html', {'contacts': contacts})

def isallowed(user, room_name):
    index = room_name.find("t2b")
    buyer = room_name[:index]
    seller = room_name[index+3:]

    if Room.objects.only('name').filter(name=room_name).exists() and str(user) in (buyer, seller):
        return True

    return False

#@verified_email_required
@login_required
def room(request, room_name):
    print(isallowed(request.user.id, room_name))
    if not isallowed(request.user.id, room_name):
        return HttpResponseRedirect("/")

    return render(request, 'chat/room.html', {
        'room_name': room_name
    })
@login_required
def create_room(request):
    if request.method == "POST":
        listing = int(request.POST["book-listing"])
        book = Book.objects.get(id=listing)
        name = f"{request.user.id}t2b{book.owner.id}"
        
        if book.owner != request.user:
            if not Room.objects.only('name').filter(name=name).exists():
                room = Room.objects.create(name=name, listing=book, buyer=request.user)
                Contact.objects.create(room=room, user=request.user, friend=book.owner)
                Contact.objects.create(room=room, user = book.owner, friend=request.user)
            BookLog.objects.get_or_create(listing=book, buyer=request.user)
            Book.objects.update(busy=True)
            return HttpResponseRedirect(f'/chat/#{name}')

    return HttpResponse("no")
   
@login_required
def fetch_msg(request, room_name):
    # room = request.GET.get("room")
    start = int(request.GET.get("start") or 0) * MSG_LIMIT
    user = request.user
    if not isallowed(user.id, room_name):
        return HttpResponseRedirect("/")
    room = Room.objects.only('name').filter(name=room_name)
    messages = reversed(Message.objects.filter(room=room[0]).order_by('-time').values('id','message', 'sender')[start:start+MSG_LIMIT])
    return JsonResponse(list(messages), safe=False)



    
    