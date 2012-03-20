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

def get_patient(request, data):
    state = State.objects.get(uuid=data['source_lab'])
    try:
        patient = SyncObject.objects.get(sync_id=data['patient']['id'], state=state, content_type__model='patient').content_object
        logger.debug( "patient found in SyncTable" )
    except:
        
        patient, created = Patient.objects.get_or_create(last_name=data['patient']['last_name'],
                                                first_name=data['patient']['first_name'],
                                                mid_name=data['patient']['mid_name'],
                                                birth_day=data['patient']['birth_day'],
                                                gender=data['patient']['gender'], 
                                                operator=state.remotestate.user)
        need_to_sync = False
        if created:
            patient.mobile_phone = data['patient']['mobile_phone']
            patient.state = state
            patient.save()
            need_to_sync = True
            logger.debug( "patient created and will be synced" )
        else:
            try:
                SyncObject.objects.get(content_type__model='patient',object_id=patient.id)
                print "patient %s found in registry and in not need to sync" % patient.id
            except Exception, err:
                need_to_sync = True
                print 'errrr:', err
                print "patient %s found in registry and will be synced" % patient.id
        
        if need_to_sync:
            SyncObject.objects.create(content_object=patient, 
                                      state=state, 
                                      sync_id=data['patient']['id'])
    
    return patient


def get_visit(request, data, patient):
    state = State.objects.get(uuid=data['source_lab'])
    try:
        visit = SyncObject.objects.get(sync_id=data['visit']['id'], state=state, content_type__model='visit').content_object
        logger.debug( "visit found in SyncTable" )
    except:
        visit = Visit.objects.create(cls=u'б',
                                     office=state,
                                     patient=patient,
                                     payer=state,
                                     source_lab=state,
                                     payment_type=u'к',
                                     operator=state.remotestate.user)
        logger.debug( u"visit created %s" % visit )
        SyncObject.objects.create(content_object=visit, 
                          state=state, 
                          sync_id=data['visit']['id'])
    return visit


def get_ordered_service(request, data):
    remote_state = State.objects.get(uuid=data['source_lab'])
    office = State.objects.get(uuid=data['dest_lab'])
    patient = get_patient(request, data)
    visit = get_visit(request, data, patient)
    try:
        ordered_service = SyncObject.objects.get(sync_id=data['order']['id'], state=remote_state, content_type__model='orderedservice').content_object
        logger.debug(u"orderedservice found in SyncTable")
    except:
        try:
            service = BaseService.objects.get(code=data['order']['code'])
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
                execution_place = ex_services[0]
            elif c>1:
                own_ex_services = ex_services.filter(state__type=u'b')
                if own_ex_services.count()>0:
                    execution_place = own_ex_services[0]
                else:
                    execution_place = ex_services[0]
            else:
                raise Exception(u"Исследование с кодом '%s' имеет неверные настройки" % data['order']['code'])
            logger.debug( u'Для услуги %s найдено место выполнения: %s' % ( service, execution_place.state) )
            ordered_service = OrderedService.objects.create(order=visit,
                                                            execution_place=execution_place.state,
                                                            service=service,
                                                            operator=visit.operator)
            logger.debug( "OrderedService created" )
            ordered_service.to_lab()
            logger.debug( "Sended to lab... %s %s" % ( ordered_service.service, execution_place.state))
            SyncObject.objects.create(content_object=ordered_service, 
                                      state=remote_state, 
                                      sync_id=data['order']['id'])
        except MultipleObjectsReturned:
            msg = u"Исследование с кодом '%s' имеет неверные настройки" % data['order']['code']
            raise Exception(msg)
            logger.debug(msg)
        except ObjectDoesNotExist:
            msg = u"Исследование с кодом '%s' не найдено" % data['order']['code']
            raise Exception(msg)
            logger.debug(msg)
        except Exception, err:
            msg = u"Неизввестная ошибка: %s" % err.__unicode__()
            raise Exception(msg)
            logger.debug(msg)
            
    return ordered_service


def get_visit_sync_id(visit):
    state = visit.office
    try:
        sync_obj = SyncObject.objects.get(state=state, 
                                          content_type__model='visit',
                                          object_id=visit.id)
        return sync_obj.sync_id
    except:
        return None


def get_result(request, data):
    visit_id = data['visit']['id']
    code = data['order']['code']
    r = data['result']
    try:
        result = Result.objects.get(order__visit__id=visit_id, 
                                    analysis__service__code=code,
                                    analysis__name=r['name'])
        result.value = r['value']
        result.validation = 1
        result.save()
        logger.debug(u'result %s for visit #%s saved' % (r['name'],visit_id))
        return result
    except ObjectDoesNotExist:
        raise Exception(u"Результат %s для заказа %s не найден" % (r['name'],visit_id) )
        logger.debug(u'result %s for visit #%s not found' % (r['name'],visit_id))
    except:
        logger.debug(u'exception for result %s for visit #%s' % (r['name'],visit_id))
    
    return None