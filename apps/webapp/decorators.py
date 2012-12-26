# -*- coding: utf-8 -*-

from django.contrib.auth import REDIRECT_FIELD_NAME
import urlparse
from django.conf import settings
from functools import wraps

from .utils import get_vp_for_user


def has_vp_perm(f, login_url=None, redirect_field_name=REDIRECT_FIELD_NAME):
    @wraps(f)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_superuser:
            qs = get_vp_for_user(request.user)
            if not qs.filter(slug=kwargs['slug']):

                # from django.contrib.auth.decorators

                path = request.build_absolute_uri()
                # If the login url is the same scheme and net location then just
                # use the path as the "next" url.
                login_scheme, login_netloc = urlparse.urlparse(login_url or
                                                            settings.LOGIN_URL)[:2]
                current_scheme, current_netloc = urlparse.urlparse(path)[:2]
                if ((not login_scheme or login_scheme == current_scheme) and
                    (not login_netloc or login_netloc == current_netloc)):
                    path = request.get_full_path()
                from django.contrib.auth.views import redirect_to_login
                return redirect_to_login(path, login_url, redirect_field_name)
        return f(request, *args, **kwargs)
    return wrapper
