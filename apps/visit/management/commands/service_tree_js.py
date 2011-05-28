# -*- coding: utf-8 -*-



from django.core.management.base import NoArgsCommand
from visit.models import Visit, Payment
from django.conf import settings
from django.template.loader import render_to_string
from webapp.views import get_service_tree


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        #c = {'json':get_service_tree()}
        file_path = settings.MEDIA_ROOT / 'resources' / 'js' / 'app' / 'ServicePanelData.json'
        f = open(file_path,'w')
        f.write(get_service_tree())
        f.close()