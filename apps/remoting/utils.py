# -*- coding: utf-8 -*-

"""
"""
from remoting.models import SyncObject
from patient.models import Patient
from state.models import State
from visit.models import Visit, OrderedService
from service.models import BaseService
from django.db import transaction
from remoting.exceptions import ServiceDoesNotExist
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from lab.models import Result
import logging

logger = logging.getLogger('remoting')

def get_patient(request, data, state):

    lookups = dict([ (k,data[k]) for k in ('last_name','first_name','mid_name','birth_day','gender')])
    
    try:
        patient = Patient.objects.get(**lookups)
        msg = u'Пользователь %s найден' % patient.short_name()
    except ObjectDoesNotExist:
        data['state'] = state
        data['operator'] = state.remotestate.user
        patient = Patient.objects.create(**data)
        msg = u'Пользователь %s создан' % patient.short_name()
    except Exception, err:
        msg = u"Ошибка определения пациента: '%s %s %s'" % (data['last_name'],data['first_name'],data['mid_name'])
        logger.exception(msg)
        raise Exception(msg)
        
    logger.info(msg)
    return patient


def get_visit(request, data, state, patient):
    
    specimen = data['specimen']
    visit, created = Visit.objects.get_or_create(cls=u'б',
                                                 office=state,
                                                 specimen=specimen,
                                                 patient=patient,
                                                 payer=state,
                                                 source_lab=state,
                                                 payment_type=u'к',
                                                 operator=state.remotestate.user)
    
    msg = created and u'Визит для образца %s создан' % specimen or u'Визит для образца %s найден' % specimen
    logger.info(msg)
    
    return visit


def get_ordered_service(request, data):
    remote_state = State.objects.get(uuid=data['source_lab'])
    office = State.objects.get(uuid=data['dest_lab'])
    patient = get_patient(request, data['patient'], remote_state)
    visit = get_visit(request, data['visit'], remote_state, patient)

    try:
        service = BaseService.objects.get(code=data['order']['code'])

    except ObjectDoesNotExist:
        msg = u"Исследование с кодом '%s' не найдено" % data['order']['code']
        logger.exception(msg)
        raise Exception(msg)

    except Exception, err:
        msg = u"Ошибка поиска исследования '%s': %s" % (data['order']['code'], err.__unicode__())
        logger.exception(msg)
        raise Exception(msg)
    
    
    """
    необходимо учесть что лаборатории могут быть разными
    последовательность:
    запрашиваются extended service
    если количество результатов == 1, то берем единственный элемент
    если больше 1, то фильтруем запрос таким образом, чтобы осталось одно собственное учреждение
    если таковых нет, то берем первый результат из запроса
    """
    ex_services = service.extendedservice_set.active()
    c = ex_services.count()
    if c==1:
        ext_service = ex_services[0]
    elif c>1:
        own_ex_services = ex_services.filter(state__type=u'b')
        if own_ex_services.count()>0:
            ext_service = own_ex_services[0]
        else:
            ext_service = ex_services[0]
    else:
        msg = u"Исследование с кодом '%s' имеет неверные настройки" % data['order']['code']
        logger.exception(msg)
        raise Exception(msg)
   
    logger.debug( u'Для услуги %s найдено место выполнения: %s' % ( service, ext_service.state) )



    #### создаем услугу для образца
    try:
        ordered_service, created = OrderedService.objects.get_or_create(order=visit,
                                                                        execution_place=ext_service.state,
                                                                        service=service,
                                                                        operator=visit.operator)
    except Exception, err:
        msg = u"Ошибка при добавлении услуги '%s' к образцу %s: %s" % (service, visit.specimen, err.__unicode__())
        logger.exception(msg)
        raise Exception(msg)
    
    if created:
        logger.info( u"Услуга %s (%s) для образца %s добавлена" % (service, ext_service.state, visit.specimen) )
    else:
        logger.info( u"Услуга %s (%s) для образца %s уже существует" % (service, ext_service.state, visit.specimen) )

    try:
        ordered_service.to_lab()
    except Exception, err:
        msg = u'Ошибка проведения лабораторной услуги %s: %s' % (service, err.__unicode__())
        logger.exception(msg)
        raise Exception(msg)

    return ordered_service, created

    
def get_result(request, data):
    specimen_id = data['visit']['specimen_id']
    code = data['order']['code']
    r = data['result']
    try:
        result = Result.objects.get(order__visit__specimen=specimen_id, 
                                    analysis__service__code=code)
        if result.value:
            result.previous_value = result.value
        result.value = r['value']
        result.validation = 1
        result.save()
        
        msg = u"Результат теста '%s' для образца %s сохранен" % (r['name'],specimen_id)
        logger.info(msg)
        return result
    
    except ObjectDoesNotExist:
        msg = u"Результат теста '%s' для образца %s не найден" % (r['name'],specimen_id)
        logger.exception(msg)
        raise Exception(msg)
    
    except Exception, err:
        msg = u"При сохранении теста '%s' для образца %s произошла ошибка: %s" % (r['name'],specimen_id, err.__unicode__())
        logger.exception(msg)
        raise Exception(msg)
    

