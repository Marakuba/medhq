# -*- coding: utf-8 -*-

"""
"""
import datetime
from celery.task import task

from celery.task.control import revoke

class SendError(Exception):
    """
    """
    

@task(max_retries=3,default_retry_delay=10)
def send_results():
    rtr = send_results.request.retries
    if rtr==2:
        revoke(task_id=send_results.request.id)
    try:
        print "delayed task id: %s. retries: %s" % (send_results.request.id, rtr)
        raise SendError
    except SendError, exc:
        try:
            send_results.retry(exc=exc)
        except SendError:
            print "failed :-(("

