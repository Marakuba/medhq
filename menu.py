# -*- coding: utf-8 -*-

from django.core.urlresolvers import reverse
from django.utils.translation import ugettext_lazy as _
from admin_tools.menu import items, Menu

# to activate your custom menu add the following to your settings.py:
#
# ADMIN_TOOLS_MENU = 'appserver.menu.CustomMenu'

class CustomMenu(Menu):
    """
    Custom Menu for appserver admin site.
    """
    def __init__(self, **kwargs):
        Menu.__init__(self, **kwargs)
        self.children.append(items.MenuItem(
            title=_('Dashboard'),
            url=reverse('admin:index')
        ))
        self.children.append(items.MenuItem(
            title=_(u'Регистратура'),
            url='/webapp/registry/'
        ))
        self.children.append(items.AppList(
            title=_('Applications'),
            exclude_list=('django.contrib',)
        ))
        self.children.append(items.AppList(
            title=_('Administration'),
            include_list=('django.contrib',)
        ))

    def init_with_context(self, context):
        """
        Use this method if you need to access the request context.
        """
        request = context['request']
        user = request.user

        reports = [items.MenuItem(
                title=u'Прайслист',
                url="/admin/service/baseservice/pricelist/"
            )]
        if user.has_perm('pricelist.add_price'):
            reports.append(items.MenuItem(
                title=u'Панель отчетов',
                url="/old/reporting/"
            ))
            
        if user.has_perm('pricelist.add_price'):
            reports.append(items.MenuItem(
                title=u'Тестовая панель отчетов',
                url="/old/reporting/test/"
            ))
            
        self.children.append(items.MenuItem(
            title=u'Отчеты',
            children=reports
        ))
        
        
        reports = [items.MenuItem(
                title=u'Обновить кэш услуг',
                url="/admin/service/baseservice/clear_cache/"
            )]

        if user.has_perm('pricelist.add_price'):
            reports.append(items.MenuItem(
                title=u'Загрузка промо-акций',
                url="/promotion/"
            ))

        self.children.append(items.MenuItem(
            title=u'Сервис',
            children=reports
        ))
