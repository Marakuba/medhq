# -*- coding: utf-8 -*-

from django.shortcuts import get_object_or_404
from lab.models import LabOrder, Result, Invoice, InvoiceItem, Sampling,\
    EquipmentTask, LabOrderEmailTask
import datetime
import simplejson
from django.http import HttpResponse, HttpResponseBadRequest
from visit.models import OrderedService, Visit
from state.models import State
from annoying.decorators import render_to
from django.db.models.aggregates import Count
from collections import defaultdict
import operator
from remoting.views import post_results
from direct.providers import remote_provider
from extdirect.django.decorators import remoting
from django.db import transaction

import logging
from taskmanager.tasks import manageable_task, SendError
from remoting.models import RemoteState
from remoting.utils import update_result_feed

logger = logging.getLogger('lab.models')


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


@render_to('print/lab/register.html')
def print_register(request):
    allowed_lookups = {
        'visit__created__gte': u'Дата с',
        'visit__created__lte': u'Дата по',
        'laboratory': u'Лаборатория',
        'visit__office': u'Офис',
        'visit__payer': u'Плательщик',
        'visit__patient': u'Пациент',
        'visit__is_cito': u'cito'
    }
    lookups = {}

    for k, v in request.GET.iteritems():
        if k in allowed_lookups:
            lookups['order__%s' % k] = v

    status = request.GET.get('is_completed', None)
    if status:
        if status in ['0', '1']:
            lookups['order__is_completed'] = bool(int(status))
    if 'visit__is_cito' in lookups:
        lookups['visit__is_cito'] = True
    results = Result.objects.filter(**lookups) \
        .order_by('analysis__service__name',
                  'order__visit__created',
                  'order__visit__patient__last_name') \
        .values('analysis__service__name',
                'order__visit__created',
                'order__visit__barcode__id',
                'order__is_completed',
                'order__visit__patient__last_name',
                'order__visit__patient__first_name',
                'order__visit__patient__mid_name',
                'order__visit__office__name') \
        .annotate(count=Count('analysis__service__name'))

    r = defaultdict(list)
    for result in results:
        r[result['analysis__service__name']].append([u'%s %s %s' % (result['order__visit__patient__last_name'],\
                                                                     result['order__visit__patient__first_name'],\
                                                                     result['order__visit__patient__mid_name'],\
                                                                     ),
                                                     result['order__visit__created'].strftime("%d.%m.%Y"),\
                                                     result['order__is_completed'],
                                                     result['order__visit__barcode__id'],
                                                     result['order__visit__office__name']
                                                    ])
    result_list = []
    for k in sorted(r.keys()):
        tmp_list = sorted(r[k], key=operator.itemgetter(0))
        last = tmp_list[-1]
        for i in range(len(tmp_list) - 2, -1, -1):
            if last[0] == tmp_list[i][0]:
                del tmp_list[i]
            else:
                last = tmp_list[i]
        result_list.append([k, tmp_list])
    return {
        'result_list': result_list
    }


from .utils import lab_order_to_html, lab_order_to_pdf


def results(request, object_id):
    """
    """

    order = get_object_or_404(LabOrder, pk=object_id)
    if 'format' in request.GET and request.GET['format'] == 'pdf':
        return lab_order_to_pdf(order, request)
    return lab_order_to_html(request, order)


from .utils import make_lab


def revert_results(request):
    """
    """
    if request.method == 'POST':
        lab_order = request.POST.get('laborder', None)

        if lab_order:
            lab_order = get_object_or_404(LabOrder, id=lab_order)
            ordered_services = lab_order.visit.orderedservice_set.filter(execution_place=lab_order.laboratory,
                                                                         service__lab_group=lab_order.lab_group)
            for ordered_service in ordered_services:
                make_lab(ordered_service)

            for result in lab_order.result_set.all():
                if not result.is_completed():
                    lab_order.is_completed = False
                    break
            lab_order.save()

            data = {
                'success': True,
                'status': lab_order.is_completed,
                'message': u'Исследования были восстановлены'
            }
            return HttpResponse(simplejson.dumps(data), mimetype='application/json')
    return HttpResponseBadRequest()


from .utils import send_lab_order_to_email


def router(obj, task_type, **kwargs):

    if task_type == 'remote':
        try:
            post_results(obj)
        except Exception, err:
            logger.exception(err.__unicode__())
            raise SendError(err)
    elif task_type == 'email':

        send_lab_order_to_email(obj)

        # print "Order", obj.visit.barcode.id, "will be send to patient email", obj.visit.patient.email

        # from django.core.mail import EmailMessage
        # email = EmailMessage('Результаты анализов',
        #     'Добрый день! Высылаем результаты анализов',
        #     'support@medhq.ru',
        #     [obj.visit.patient.email, ]
        # )
        # pdf = lab_order_to_pdf(obj, raw=True)
        # email.attach('results.pdf', pdf, 'application/pdf')
        # email.send()


from .utils import _create_email_task


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


from celery.task import subtask
from .tasks import email_sent_success


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


def pull_invoice(request):
    """
    """
    if request.method == 'POST':
        invoice_id = request.POST.get('invoice', None)
        state_id = request.POST.get('state', None)
        office_id = request.POST.get('office', request.active_profile.department.state.id)
        if not state_id:
            return HttpResponseBadRequest()
        state = get_object_or_404(State, id=state_id)

        if invoice_id:
            invoice = get_object_or_404(Invoice, id=invoice_id)
        else:
            return HttpResponseBadRequest()
#            invoice = Invoice.objects.create(state=state)
        items = OrderedService.objects.filter(order__office__id=office_id,
                                              invoiceitem__isnull=True,
                                              sampling__isnull=False,
                                              execution_place=state)
        if items:
            for item in items:
                InvoiceItem.objects.create(invoice=invoice, ordered_service=item, operator=request.user)

            return HttpResponse(simplejson.dumps({
                                                    'success': True,
                                                    'message': u'Накладная заполнена успешно'
                                                }), mimetype='application/json')
        else:
            return HttpResponse(simplejson.dumps({
                                                    'success': False,
                                                    'message': u'Нет позиций для заполнения'
                                                }), mimetype='application/json')


@render_to('print/lab/invoice.html')
def print_invoice(request, invoice_id):
    """
    """
    invoice = get_object_or_404(Invoice, id=invoice_id)
    items = invoice.invoiceitem_set.all()
    vals = items.order_by('ordered_service__sampling').values('ordered_service__sampling').annotate(count=Count('ordered_service__sampling'))
    vals = [item['ordered_service__sampling'] for item in vals]
    samplings = Sampling.objects.filter(id__in=vals)
    groups = samplings.order_by('tube').values('tube__name').annotate(count=Count('tube'))

    return {
        'invoice': invoice,
        'items': items,
        'groups': groups,
        'samplings': samplings
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


def clean_value(v):
    if not v:
        return ''
    try:
        if "." in v:
            return str(round(float(v), 2))
        return str(int(v))
    except:
        return v


def hem_results(request):

    data = simplejson.loads(request.raw_post_data)
    try:
        specimen = int(data['specimenID'])
    except:
        return HttpResponse('Invalid specimen')
    results = Result.objects.filter(order__visit__barcode__id=specimen)
    for result in results:
        if result.analysis.code in data:
            result.previous_value = result.value
            result.value = clean_value(data[result.analysis.code])
            result.save()

    return HttpResponse('OK')


from annoying.decorators import ajax_request

DATE_TYPES = {
    0: 'confirmed',
    1: 'visit__created',
    2: 'executed'
}


@ajax_request
def feed(request):
    """
    """
    data = {
    }
    orders = {}
    state_key = request.GET.get('state_key', None) or request.POST.get('state_key', None)
    if not state_key:
        return {
            'error': u'Не указан ключ организации'
        }
    try:
        state = RemoteState.objects.get(secret_key=state_key)
        state = state.state
    except:
        return {
            'error': u'Неверный ключ организации'
        }
    start = request.GET.get('start', None) or request.POST.get('start', None)
    end = request.GET.get('end', None) or request.POST.get('end', None)
    specimen = request.GET.get('specimen', None) or request.POST.get('specimen', None)
    date_type = request.GET.get('date_type', 0) or request.POST.get('date_type', 0)
    date_type = DATE_TYPES.get(date_type, 0)

    if start:
        try:
            start = datetime.datetime.fromtimestamp(int(start))

            lookups = {
                'order__visit__office': state,
                'order__%s__gte' % date_type: start,
                'order__is_completed': True
            }
            results = Result.objects.filter(**lookups) \
                .order_by('-order__confirmed', 'order__visit__specimen')

        except:
            results = None

        if end and results:
            try:
                end = datetime.datetime.fromtimestamp(int(end))
                lookups = {
                    'order__%s__lte' % date_type: end
                }
                results.filter(**lookups)
            except:
                pass

    elif specimen:
        specimens = specimen.split(',')
        results = Result.objects.filter(order__visit__office=state, order__visit__specimen__in=specimens, order__is_completed=True)

    if not results:
        return {}

    for r in results:
        if r.order_id not in orders:
            order = {}
            order['patient'] = {
                'first_name': r.order.visit.patient.first_name,
                'last_name': r.order.visit.patient.last_name,
                'mid_name': r.order.visit.patient.mid_name
            }
            order['order_id'] = r.order_id
            order['specimen'] = r.order.visit.specimen
            order['created'] = r.order.visit.created.strftime('%Y-%m-%d %H:%M:%S')
            order['executed'] = r.order.executed.strftime('%Y-%m-%d %H:%M:%S')
            order['confirmed'] = r.order.confirmed.strftime('%Y-%m-%d %H:%M:%S')
            order['services'] = {}
            orders[r.order_id] = order
        code = r.analysis.service.code
        if not code in orders[r.order_id]['services']:
            orders[r.order_id]['services'][code] = {
                'code': code,
                'name': r.analysis.service.name,
                'tests': []
            }
        res = {
            'name': r.analysis.name,
            'code': r.analysis.code,
            'value': r.value,
            'measurement': r.measurement,
            'ref_interval': r.ref_range_text
        }
        orders[r.order_id]['services'][code]['tests'].append(res)

    orders = orders.values()
    for o in orders:
        o['services'] = o['services'].values()
    data['orders'] = orders

    return data


@ajax_request
def result_loader(request):
    """
    """

    state_id = request.POST.get('state_id', None)
    start = request.POST.get('start', None)
    end = request.POST.get('end', None)
    specimens = request.POST.get('specimens', None)
    date_type = request.POST.get('date_type', None)

    try:
        state = RemoteState.objects.get(state__id=state_id)
        state_key = state.secret_key
    except Exception, err:
        # print err
        return {
            'error': u'Ошибка определения лаборатории'
        }

    if specimens:
        try:
            specimens = specimens.replace(' ', '').split(',')
        except:
            return {
                'error': u'Неправильно заданы номера образцов'
            }

        results = update_result_feed(state_key, specimens=specimens)
        return {
            'results': results
        }

    if start:
        try:
            start = datetime.datetime.strptime(start, '%Y-%m-%dT%H:%M:%S')
        except:
            return {
                'error': u'Некорректная начальная дата'
            }
        if end:
            try:
                end = datetime.datetime.strptime(end, '%Y-%m-%dT%H:%M:%S')
                end = datetime.datetime(year=end.year, month=end.month, day=end.day,
                                        hour=23, minute=59, second=59)
                # print end
            except Exception, err:
                # print err
                return {
                    'error': u'Некорректная конечная дата'
                }
        results = update_result_feed(state_key, start, end, update=False)
        return {
            'results': results
        }

    return {
        'error': u'Нет данных'
    }


def sampling_tree(request, visit_id):
    states = defaultdict(list)
    tree = []
    samplings = Sampling.objects.filter(visit__id=visit_id).order_by('laboratory__id',)
    for sampling in samplings:
        states[sampling.laboratory.__unicode__()].append(sampling)
    for k, v in states.iteritems():
        children = [{'id': item.id, 'text': item.tube.name, 'leaf': True} for item in v]
        node = {
            'id': k,
            'text': k,
            'leaf': False,
            'expanded': True,
            'children': children
        }
        tree.append(node)

    json = simplejson.dumps(tree)

    return HttpResponse(json, mimetype="application/json")
