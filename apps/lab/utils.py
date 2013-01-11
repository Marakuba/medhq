# -*- coding: utf-8 -*-

"""
"""
from django.core.exceptions import ObjectDoesNotExist
from service.exceptions import TubeIsNoneException
from lab.models import Sampling, LabOrder, Result, EquipmentTask, LabOrderEmailHistory
from lab.widgets import get_widget


def make_lab(ordered_service):
    """
    """
    s = ordered_service.service
    try:
        lab_service = s.labservice
    except:
        return

    visit = ordered_service.order

    try:
        ext_service = s.extendedservice_set.get(state=ordered_service.execution_place)
    except ObjectDoesNotExist:
        raise Exception(u'Для услуги <strong>%s</strong> не найдено место выполнения <strong>%s</strong>' % (s, ordered_service.execution_place))

    save_lab_order = False

    if ext_service.tube is None:
        raise TubeIsNoneException(u"В расширенной услуге <strong>'%s'</strong> для организации <strong>%s</strong> не указан тип пробирки" %
                                   (ext_service.base_service.name, ext_service.state))

    sampling, created = Sampling.objects.get_or_create(visit=visit,
                                                       laboratory=ordered_service.execution_place,
                                                       is_barcode=ext_service.is_manual,
                                                       tube=ext_service.tube)
    widget = get_widget(lab_service.widget)()

    is_manual = lab_service.is_manual
    params = dict(visit=visit,
                  laboratory=ordered_service.execution_place,
                  lab_group=s.lab_group,
                  widget=widget.ext_app_name,
                  is_manual=is_manual)
    if is_manual:
        params['manual_service'] = s.name
    lab_order, created = LabOrder.objects.get_or_create(**params)

    analysis_list = s.analysis_set.all()
    if ext_service.base_profile:
        analysis_list = analysis_list.filter(profile=ext_service.base_profile)
    for analysis in analysis_list:
        result, created = Result.objects.get_or_create(order=lab_order,
                                                       analysis=analysis,
                                                       sample=sampling)
        if created:
            save_lab_order = True
            lab_order.is_completed = False

        try:
            eq_analysis = analysis.equipmentanalysis
            ### Generating AssayTask

            assays = eq_analysis.equipmentassay_set.filter(is_active=True)
            for assay in assays:
                EquipmentTask.objects.get_or_create(equipment_assay=assay, ordered_service=ordered_service)
        except:
            pass

    widget.process_results(lab_order.result_set.all())

    if save_lab_order:
        lab_order.save()

    if sampling:
        ordered_service.sampling = sampling

    if ordered_service.status == u'т':
        ordered_service.status = u'л'
    ordered_service.save()


import datetime

from constance import config

from django.conf import settings
from django.template import RequestContext
from django.shortcuts import render_to_response
from django.http import HttpResponse


def format_tpl(v):
    def wrap(tpl):
        try:
            return tpl % v
        except:
            return tpl
    return wrap


def lab_order_to_html(request, order):

    widget = get_widget(order.widget)()

    result_ctx = widget.make_results(order)

    preview = request and request.GET.get('preview') or False

    NOW = datetime.datetime.now()

    if not preview:
        if order.is_completed and not order.print_date:
            order.is_printed = True
            order.print_date = NOW
            order.save()

    services = order.visit.orderedservice_set.filter(executed__isnull=False, print_date__isnull=True)
    services.update(print_date=NOW)

    ec = {
            'order': order,
            'preview': preview,
    }
    ec.update(result_ctx)

    templates = widget.get_template()
    if widget.allow_tpl_override and order.lab_group and order.lab_group.template:
        templates.insert(0, order.lab_group.template)

    def_state = request and request.active_profile.state or config.MAIN_STATE_ID

    context_instance = request and RequestContext(request) or Context({
        'STATIC_URL': settings.STATIC_URL
    })

    templates = map(format_tpl(def_state), templates)  # [t %  for t in templates]

    rendered = render_to_response(templates, ec,
                              context_instance=context_instance)

    return rendered


from sx.pisa3 import pisaDocument
from StringIO import StringIO


def link_callback(*args, **kwargs):
    # base = args[1] or '/home/trx/Projects/medhq/medhq'
    uri = args[0].replace(settings.STATIC_URL, settings.STATIC_ROOT)
    return uri


def lab_order_to_pdf(order, request=None, raw=False):
    rendered = lab_order_to_html(request, order)
    pdf = StringIO()
    pisaDocument(rendered.content, pdf, link_callback=link_callback)
    pdf_content = pdf.getvalue()
    if raw:
        return pdf_content
    return HttpResponse(pdf_content, mimetype='application/pdf')


from .models import LabOrderEmailTask


def _create_email_task(lab_order, resend=True):
    task, created = LabOrderEmailTask.objects.get_or_create(lab_order=lab_order)
    if not lab_order.visit.patient.email:
        task.status = 'noaddr'
        task.save()
    else:
        if task.status in ['sent', 'resent', 'failed', 'canceled'] and resend:
            task.status = 'repeat'
            task.save()
        elif task.status == 'noaddr':
            task.status = 'ready'
            task.save()

    return task, created


from django.core.mail import EmailMessage
from django.template import loader, Context


def send_lab_order_to_email(obj):

    t = loader.get_template('lab/email/subject.html')
    c = Context({'object': obj})
    subject = t.render(c)

    t = loader.get_template('lab/email/body.html')
    c = Context({'object': obj})
    body = t.render(c)

    email = EmailMessage(subject=subject, body=body, to=[obj.visit.patient.email, ])
    pdf = lab_order_to_pdf(obj, raw=True)
    filename = 'Euromed Lab %s.pdf' % obj.visit.barcode.id
    email.attach(filename, pdf, 'application/pdf')
    email.send(fail_silently=False)


def _create_email_history(task, operator):

    LabOrderEmailHistory.objects.create(
        email_task=task,
        status=task.status,
        created_by=operator
    )


def _email_sent_success(task, operator=None):
    task.status = task.status == u'ready' and u'sent' or u'resent'
    task.save()
    _create_email_history(task, operator)


def _email_sent_failed(task, operator=None):
    task.status = 'failed'
    task.save()
    _create_email_history(task, operator)


def check_addresses():
    tasks = LabOrderEmailTask.objects.filter(status=u'noaddr')
    for task in tasks:
        if task.lab_order.visit.patient.email:
            task.status = u'ready'
            task.save()


def send_all_email_task(status_list=None):
    """
    """
    check_addresses()

    status_list = status_list or ['ready', 'repeat']
    tasks = LabOrderEmailTask.objects.filter(status__in=status_list)
    for task in tasks:
        try:
            send_lab_order_to_email(task.lab_order)
            _email_sent_success(task)
        except Exception, err:
            # print err
            _email_sent_failed(task)
