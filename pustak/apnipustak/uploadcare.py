from distutils.log import error
import time
import hashlib
import hmac
from email import header, utils
import requests
import json

# Specifying the project’s key (demo account Public API Key is used in this example)
SECRET_KEY = '617a97ab6e2ebb766b0f'

PUBLIC_KEY = '17f22389057cde9c063b'

# Specifying request type
verb = 'GET'

# Calculate [md5](https://en.wikipedia.org/wiki/MD5) checksum for the request's HTTP body.
# Note: Taking into account that in our example, we are sending an HTTP GET request,
# and the request does not have anything in its HTTP body, we use an empty string as an input to the md5 hash function.
# If we were to send an HTTP POST request with, for example, JSON in the request's body,
# we would have to pass the JSON as the input to the md5 hash function.
content_md5 = hashlib.md5(b'').hexdigest()

# Content-Type header
content_type = 'application/json'

# Current time, e.g. 1541423681
timestamp = int(time.time())
# Date header ('Mon, 05 Nov 2018 13:14:41 GMT')
date_header = utils.formatdate(timestamp, usegmt=True)

# The request URI
uri = '/files/?limit=1&stored=true'

# Forming the final string: concatenating
sign_string = '\n'.join([verb, content_md5, content_type, date_header, uri])

# Calculating the signature,
# the result may look like this: "3cbc4d2cf91f80c1ba162b926f8a975e8bec7995"
signature = hmac.new(SECRET_KEY.encode(), sign_string.encode(), hashlib.sha1).hexdigest()

# Expire in 30 min, e.g., 1454903856
expire = int(time.time()) + 60 * 30


def del_img(uuid):
    url = f"https://api.uploadcare.com/files/{uuid}/storage/"

    headers = {'Authorization': f"Uploadcare.Simple {PUBLIC_KEY}:{SECRET_KEY}"}

    x = requests.delete(url, headers=headers)

def store_avatar(src):
    url = "https://upload.uploadcare.com/from_url/"
    status_url = "https://upload.uploadcare.com/from_url/status/"
    
    data = {"pub_key": PUBLIC_KEY, 
                "source_url": src}
    save = requests.post(url, params=data)
    file = json.loads(save.text)
    while(True):
        status = requests.get(status_url, params={ "token": file["token"]})
        status = json.loads(status.text)
        if status["status"] == "success":
            return status["uuid"]

        
 