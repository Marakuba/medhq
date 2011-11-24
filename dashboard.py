# -*- coding: utf-8 -*-

from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse
from admin_tools.dashboard import modules, Dashboard, AppIndexDashboard
from django.conf import settings
from admin_tools.dashboard.modules import LinkList, DashboardModule

try:
    title = settings.APPSERVER_ADMIN_TITLE
except AttributeError:
    title = u'Панель управления'
    
class Toolbar(LinkList):
    def __init__(self, **kwargs):
        super(Toolbar,self).__init__(**kwargs)
        self.icon = kwargs.get('icon', None)
        self.template = kwargs.get('template',
                                   'admin_tools/dashboard/modules/toolbar.html')

class TaskList(DashboardModule):
    def __init__(self, **kwargs):
        super(TaskList, self).__init__(**kwargs)
        self.template = kwargs.get('template',
                                   'admin_tools/dashboard/modules/tasklist.html')

class CustomIndexDashboard(Dashboard):
    """
    Custom index dashboard for appserver.
    """
    
    def __init__(self, **kwargs):
        Dashboard.__init__(self, **kwargs)
        self.title = title 
        self.columns = 2
        # append a link list module for "quick links"
#        self.children.append(Toolbar(
#            title=_('Quick links'),
#            layout='inline',
#            draggable=False,
#            deletable=False,
#            collapsible=False,
#            children=[
#                {
#                    'title': _(u'Новый пациент'),
#                    'url': reverse('admin:patient_patient_add'),
#                    'icon': 'resources/images/patient-new.png'
#                },{
#                    'title': _(u'Новый прием'),
#                    'url': reverse('admin:visit_visit_add'),
#                    'icon': 'resources/images/document-new.png'
#                },
##                {
##                    'title': _(u'Предварительная запись'),
##                    'url': '%s?preliminary' % reverse('admin:visit_visit_add'),
##                    'icon': 'resources/images/calendar.png'
##                }
#                
#            ]
#        ))

        # append an app list module for "Applications"
        self.children.append(modules.AppList(
            title=_('Applications'),
            exclude_list=('django.contrib','taskmanager','schedule'),
            #include_list=('patient','lab','state','staff','service','visit','taskmanager','schedule')
        ))

        # append an app list module for "Administration"
        self.children.append(modules.AppList(
            title=_('Administration'),
            include_list=('django.contrib',),
        ))

        # append a recent actions module
        self.children.append(modules.RecentActions(
            title=_('Recent Actions'),
            limit=5
        ))

        # append a feed module
#        self.children.append(modules.Feed(
#            title=_('Latest Django News'),
#            feed_url='http://www.djangoproject.com/rss/weblog/',
#            limit=12
#        ))

        # append another link list module for "support".
#        self.children.append(modules.LinkList(
#            title=_('Support'),
#            children=[
#                {
#                    'title': _('Django documentation'),
#                    'url': 'http://docs.djangoproject.com/',
#                    'external': True,
#                },
#                {
#                    'title': _('Django "django-users" mailing list'),
#                    'url': 'http://groups.google.com/group/django-users',
#                    'external': True,
#                },
#                {
#                    'title': _('Django irc channel'),
#                    'url': 'irc://irc.freenode.net/django',
#                    'external': True,
#                },
#            ]
#        ))

    def init_with_context(self, context):
        """
        Use this method if you need to access the request context.
        """
        pass


# to activate your app index dashboard add the following to your settings.py:
#
# ADMIN_TOOLS_APP_INDEX_DASHBOARD = 'appserver.dashboard.CustomAppIndexDashboard'

class CustomAppIndexDashboard(AppIndexDashboard):
    """
    Custom app index dashboard for appserver.
    """
    def __init__(self, *args, **kwargs):
        AppIndexDashboard.__init__(self, *args, **kwargs)

        # we disable title because its redundant with the model list module
        self.title = ''

        # append a model list module
        self.children.append(modules.ModelList(
            title=self.app_title,
            include_list=self.models,
        ))

        # append a recent actions module
        self.children.append(modules.RecentActions(
            title=_('Recent Actions'),
            include_list=self.get_app_content_types(),
        ))

    def init_with_context(self, context):
        """
        Use this method if you need to access the request context.
        """
        pass
