from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.utils import user_field
from apnipustak.uploadcare import store_avatar

class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        pic = sociallogin.account.get_avatar_url()
        picture = store_avatar(pic)
        user_field(sociallogin.user, "picture", picture)
        return super().populate_user(request, sociallogin, data)

# class MyAccountAdapter(DefaultAccountAdapter):

#   def get_login_redirect_url(self, request):
#       return '/'
