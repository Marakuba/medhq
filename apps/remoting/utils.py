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
from django.core.exceptions import ObjectDoesNotExist
from lab.models import Result

def get_patient(request, data):
    state = State.objects.get(uuid=data['source_lab'])
    try:
        patient = SyncObject.objects.get(sync_id=data['patient']['id'], state=state, content_type__model='patient').content_object
        print "patient found in SyncTable"
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
            print "patient created and will be synced"
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
        print "visit found in SyncTable"
    except:
        visit = Visit.objects.create(cls=u'б',
                                     office=state,
                                     patient=patient,
                                     payer=state,
                                     source_lab=state,
                                     payment_type=u'к',
                                     operator=state.remotestate.user)
        print "visit created", visit
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
        print "orderedservice found in SyncTable"
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
            print u'Для услуги',service, u'найдено место выполнения:', execution_place.state
            ordered_service = OrderedService.objects.create(order=visit,
                                                            execution_place=execution_place.state,
                                                            service=service,
                                                            operator=visit.operator)
            print "OrderedService created", ordered_service.service
            ordered_service.to_lab()
            print "Sended to lab...", ordered_service.service, execution_place.state
            SyncObject.objects.create(content_object=ordered_service, 
                                      state=remote_state, 
                                      sync_id=data['order']['id'])
        except ObjectDoesNotExist:
            raise Exception(u"Исследование с кодом '%s' не найдено" % data['order']['code'])
        except Exception, err:
            print "какая-то неизввестная ошибка:", err
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
        return result
    except ObjectDoesNotExist:
        raise Exception(u"Результат %s для заказа %s не найден" % (r['name'],visit_id) )
    except:
        pass
    
    return None