# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404
from staff.models import Staff, Position


def get_active_profile(request):
    try:
        position_id = request.session['ACTIVE_PROFILE']
        position = get_object_or_404(Position, id=position_id)
#        print position
        return position
    except KeyError:
        try:
            first = Position.objects.active(staff__user=request.user)[0]
        except IndexError:
            return None
        return first

class LazyActiveProfile(object):
    def __get__(self, request, obj_type=None):
        if not hasattr(request, '_cached_active_profile'):
            request._cached_active_profile = get_active_profile(request)
        return request._cached_active_profile


class ActiveProfileMiddleware(object):
    def process_request(self, request):
        assert hasattr(request, 'session'), "Active Profile middleware requires session middleware to be installed. Edit your MIDDLEWARE_CLASSES setting to insert 'django.contrib.sessions.middleware.SessionMiddleware'."
        request.__class__.active_profile = LazyActiveProfile()
        return None