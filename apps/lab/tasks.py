# -*- coding: utf-8 -*-

"""
"""

from celery.task import task
from .utils import _email_sent_success


@task(ignore_result=True)
def email_sent_success(task_instance):
    order = task_instance.assigned_to
    task = order.laborderemailtask

    _email_sent_success(task, task_instance.operator)
