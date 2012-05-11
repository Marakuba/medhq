# -*- coding: utf-8 -*-

"""
"""


from django.core.management.base import NoArgsCommand
from lab.models import LabOrder
from django.test.client import RequestFactory
from taskmanager.tasks import manageable_task, SendError
from django.contrib.auth.models import User

def test_action(object, task_type, **kwargs):
    raise SendError()


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        
        laborder = LabOrder.objects.filter(is_completed=True).latest('id')
        
        print laborder
        
        operator = User.objects.get(username='trx')
        
        action_params = {
        }
        
        manageable_task.delay(operator=operator, 
                              task_type='email', 
                              action=test_action, 
                              object=laborder, 
                              action_params=action_params,
                              task_params={'countdown':10})
                