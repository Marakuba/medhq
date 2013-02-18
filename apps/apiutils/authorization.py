# -*- coding: utf-8 -*-

"""
"""

from tastypie.authorization import Authorization


class LocalAuthorization(object):
    """
    A base class that provides no permissions checking.
    """
    def __get__(self, instance, owner):
        """
        Makes ``Authorization`` a descriptor of ``ResourceOptions`` and creates
        a reference to the ``ResourceOptions`` object that may be used by
        methods of ``Authorization``.
        """
        self.resource_meta = instance
        return self

    def is_authorized(self, request, object=None):
        """
        Checks if the user is authorized to perform the request. If ``object``
        is provided, it can do additional row-level checks.

        Should return either ``True`` if allowed, ``False`` if not or an
        ``HttpResponse`` if you need something custom.
        """

        return request.META['REMOTE_ADDR'] == '127.0.0.1'


class DjangoStrictAuthorization(Authorization):
    """
    Uses permission checking from ``django.contrib.auth`` to map ``POST``,
    ``PUT``, and ``DELETE`` to their equivalent django auth permissions.
    """
    def is_authorized(self, request, object=None):
        #  All methods require permission checking!
        if request.method == 'GET':
            return request.user.is_authenticated()

        klass = self.resource_meta.object_class

        # cannot check permissions if we don't know the model
        if not klass or not getattr(klass, '_meta', None):
            return True

        permission_codes = {
            'POST': '%s.add_%s',
            'PUT': '%s.change_%s',
            'DELETE': '%s.delete_%s',
        }

        # cannot map request method to permission code name
        if request.method not in permission_codes:
            return True

        permission_code = permission_codes[request.method] % (
            klass._meta.app_label,
            klass._meta.module_name)

        # user must be logged in to check permissions
        # authentication backend must set request.user
        if not hasattr(request, 'user'):
            return False

        return request.user.has_perm(permission_code)
