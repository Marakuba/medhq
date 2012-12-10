# -*- coding: utf-8 -*-

"""
"""
import datetime
from celery.task import task, subtask
from taskmanager.models import DelayedTask


class SendError(Exception):
    """
    """

INITIAL_TASK_PARAMS = dict(max_retries=4, default_retry_delay=5 * 60)


@task(ignore_result=True)
def mt_success(task_instance, request=None):
    NOW = datetime.datetime.now()
    task_instance.completed = NOW
    task_instance.status = u'sended'
    task_instance.save()


@task(ignore_result=True)
def mt_failure(task_instance, request=None):
    task_instance.status = u'failed'
    task_instance.save()


def mt_retry(task_instance, countdown=5 * 60):
    NOW = datetime.datetime.now()
    next_attempt = NOW + datetime.timedelta(seconds=countdown)
    task_instance.attempts = task_instance.attempts + 1
    task_instance.next_attempt = next_attempt
    task_instance.save()
    return task_instance


@task(**INITIAL_TASK_PARAMS)
def manageable_task(operator, task_type, action, object, action_params={},
                    success=None, failure=None, retry=None,
                    task_instance=None, task_params=INITIAL_TASK_PARAMS):

    if task_instance is None:
        task_instance = DelayedTask.objects.create(operator=operator,
                                                   id_task=manageable_task.request.id,
                                                   type=task_type,
                                                   status=u'sending',
                                                   assigned_to=object)
    try:
        action(object, task_type, **action_params)
        print "action run"
        if success:
            print "success subtask"
            subtask(success).delay(task_instance)

        # безусловный вызов внутренней функции
        subtask(mt_success).delay(task_instance)

    except SendError, exc:
        print "retrying"
        try:
            countdown = 'countdown' in task_params and task_params['countdown'] or manageable_task.default_retry_delay

            task_instance = mt_retry(task_instance, countdown)

            if retry:
                retry()

            kwargs = dict(operator=operator,
                          task_type=task_type,
                          action=action,
                          object=object,
                          action_params=action_params,
                          success=success,
                          failure=failure,
                          retry=retry,
                          task_instance=task_instance,
                          task_params=task_params)
            manageable_task.retry(exc=exc, kwargs=kwargs, **task_params)

        except SendError:
            print "failure"

            subtask(mt_failure(task_instance))

            if failure:
                subtask(failure).delay(task_instance)
