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


@transaction.commit_on_success
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
            ordered_service = OrderedService.objects.create(order=visit,
                                                            execution_place=office,
                                                            service=service,
                                                            operator=visit.operator)
            print "OrderedService created", ordered_service
            ordered_service.to_lab()
            SyncObject.objects.create(content_object=ordered_service, 
                                      state=remote_state, 
                                      sync_id=data['order']['id'])
        except:
            raise Exception(u"Исследование с кодом '%s' не найдено" % data['order']['code'])
    return ordered_service
    