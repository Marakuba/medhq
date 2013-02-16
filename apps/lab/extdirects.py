# -*- coding: utf-8 -*-


import simplejson

from direct.providers import remote_provider
from extdirect.django.decorators import remoting
from django.db import transaction
from celery.task import subtask

from visit.models import Visit
from taskmanager.tasks import manageable_task

from .utils import _create_email_task, router
from .tasks import email_sent_success
from .models import LabOrder, LabOrderEmailTask, EquipmentTask


import logging
logger = logging.getLogger(__name__)


@remoting(remote_provider, len=1, action='lab', name='getPatientInfo')
def get_patient_info(request):
    data = simplejson.loads(request.raw_post_data)
    order_id = data['data'][0]
    laborder = LabOrder.objects.get(id=order_id)
    patient = laborder.visit.patient
    data = {
        'last_name': patient.last_name,
        'first_name': patient.first_name,
        'mid_name': patient.mid_name,
        'birth_day': patient.birth_day,
        'gender': patient.gender,
    }
    return dict(success=True, data=data)


@remoting(remote_provider, len=1, action='lab', name='confirmResults')
def confirm_results(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    laborder_id = data['data'][0]

    try:
        lab_order = LabOrder.objects.get(id=laborder_id)
    except:
        return dict(success=False, message="Laborder %s not found" % laborder_id)

    lab_order.confirm_results()

    msg = lab_order.is_completed and u'Лабораторный ордер подтвержден' or u'Присутствуют пустые значения. Лабораторный ордер не подтвержден'

    if lab_order.is_completed:
        try:
            state = lab_order.visit.office.remotestate
#            logger.info(u"LabOrder for specimen %s is remote" % lab_order.visit.specimen)
            if state.mode == u'a':
                action_params = {}
                manageable_task.delay(operator=request.user,
                                      task_type='remote',
                                      action=router,
                                      object=lab_order,
                                      action_params=action_params,
                                      task_params={'countdown': 300})
            else:
                pass
        except:
            if lab_order.visit.send_to_email:
                _create_email_task(lab_order=lab_order, resend=False)

    return {
        'success': lab_order.is_completed,
        'message': msg
    }


@remoting(remote_provider, len=2, action='lab', name='makeEmailTask')
def make_email_task(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    laborder_id = data['data'][0]

    try:
        lab_order = LabOrder.objects.get(id=laborder_id)
    except:
        return dict(success=False, message="Laborder %s not found" % laborder_id)

    if not lab_order.is_completed:
        return {
            'success': False,
            'message': u'Лабораторный ордер к заказу %s не выполнен и не может быть отправлен' % lab_order.visit.barcode_id
        }

    v = lab_order.visit
    if not v.send_to_email:
        v.send_to_email = True
        v.save()

    try:
        email = data['data'][1]
    except:
        email = None

    if email:
        v.patient.email = email
        # print "new email received:", email
        v.patient.save()

    task, created = _create_email_task(lab_order=lab_order)

    # if created:
    msg = u'Лабораторный ордер к заказу %s успешно добавлен в список отправки' % lab_order.visit.barcode_id
    # else:
    #     if task.status in [u'ready', u'resent']:
    #         msg = u'Лабораторный ордер к заказу %s уже был добавлен к отправке ранее' % lab_order.visit.barcode_id
    #     elif task.status == u'resent'

    return {
        'success': True,
        'message': msg
    }


@remoting(remote_provider, len=1, action='lab', name='sendEmailNow')
def send_email_now(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    laborder_id = data['data'][0]

    try:
        lab_order = LabOrder.objects.get(id=laborder_id)
    except:
        return dict(success=False, message="Laborder %s not found" % laborder_id)

    action_params = {}
    manageable_task.delay(operator=request.user,
                          task_type='email',
                          action=router,
                          object=lab_order,
                          action_params=action_params,
                          task_params={'countdown': 300},
                          success=subtask(email_sent_success)
                          )

    return {
        'success': lab_order.is_completed,
        'message': u'Лабораторный ордер к заказу %s отправлен' % lab_order.visit.barcode_id
    }


@remoting(remote_provider, len=1, action='lab', name='getEmailTaskStatus')
def get_email_task_status(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    task_id = data['data'][0]

    try:
        task = LabOrderEmailTask.objects.get(id=task_id)
    except:
        return dict(success=False, message="Отсутствует задание на отправку почты #%s" % task_id)

    return {
        'success': True,
        'message': task.status
    }


@transaction.commit_on_success
@remoting(remote_provider, len=2, action='lab', name='setAddress')
def set_address(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    task_id = data['data'][0]

    try:
        task = LabOrderEmailTask.objects.get(id=task_id)
    except:
        return dict(success=False, message="Отсутствует задание на отправку почты #%s" % task_id)

    patient = task.lab_order.visit.patient

    patient.email = data['data'][1]
    patient.save()

    task.status = 'ready'
    task.save()

    return {
        'success': True,
        'message': u'Адрес электронной почты был успешно сохранен',
        'status': task.status
    }


@remoting(remote_provider, len=1, action='lab', name='getSpecimenStatus')
def get_specimen_status(request):
    data = simplejson.loads(request.raw_post_data)
    barcode_id = data['data'][0]
    try:
        Visit.objects.get(barcode__id=barcode_id)
        tasks = EquipmentTask.objects.filter(ordered_service__order__barcode__id=barcode_id, status=u'wait') \
            .order_by('equipment_assay__equipment__order')
        try:
            task = tasks[0]
            next_place = task.equipment_assay.equipment.name
        except Exception, err:
            logger.error(u"LAB: %s " % err)
            next_place = u"Архив"
    except:
        next_place = u'Образец не найден'
    data = {
        'next': next_place
    }
    return dict(success=True, data=data)
