from django.conf.urls.defaults import *

urlpatterns = patterns('promotion.views',
    url('^$', 'promo_form', name='promo-form'),
    url('^upload/$', 'promo_upload', name='promo-upload'),
)
