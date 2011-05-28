from tastypie.api import Api
API_VERSION = 'v1' 

def get_api_name(name):
    return "%s/%s" % (API_VERSION, name)
