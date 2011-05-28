# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
import datetime
from lab.models import Sampling, LabOrder, Result
from visit.models import Visit


def rebuild_laborder(obj):
    visit = obj.order
    visit.update_total_price()
    s = obj.service
    if s.is_lab():
        print "service is laboratory:", s
        #today = datetime.date.today()
        if visit.office==obj.execution_place:
            tubes = s.normal_tubes
            print "using normal tubes"
        else:
            tubes = s.transport_tubes
            print "using transport tubes"
        tubes = tubes.all() 
        nm = s.lab_group.numerator
        if s.individual_tube:
            """
            Если пробирка должна быть уникальной для каждого теста, 
            то создаем новый экземпляр прибирки каждого привязанного в настройках типа
            """
            print "tube must be individual so we create a new one"
            #print tubes
            for tube in tubes:
                #временно блокируем создание нумераторов
#                    if nm:
#                        """
#                        Если надо, генерируем новый код для каждой созданной пробирки
#                        """
#                        try:
#                            sampling_number = nm.generate()
#                        except Exception,err:
#                            print "Error: %s" % err
#                    else:
#                        sampling_number = None
                sampling = Sampling.objects.create(visit=visit,
                                                   laboratory=obj.execution_place,
                                                   tube=tube,
                                                   #number=sampling_number,
                                                   execution_type_group=obj.service.execution_type_group)
                 
                #print "sampling created: ", sampling
        else:
            """
            Если несколько тестов можно выполнить используя одну и ту же пробирку,
            то ищем пробирку определенного типа, созданную в рамках одного заказа.
            """
            print "tubes re-using so we getting or creating it"
            #print tubes
            for tube in tubes:
                sampling, created = Sampling.objects.get_or_create(visit=visit,
                                                                   laboratory=obj.execution_place,
                                                                   tube=tube,
                                                                   execution_type_group=obj.service.execution_type_group)
                print "sampling:", sampling, created
                if created:
                    """
                    Для вновь созданной пробирки привязываем визит и новый номер, 
                    если он должен формироваться с помощью индивидуального нумератора
                    """
#                        if nm:
#                            try:
#                                sampling.number = nm.generate()
#                            except Exception, err:
#                                print "error: %s" % err
                        #print "new number",sampling.number 
                    #sampling.visit = visit
                    #sampling.save()
            
        lab_order, created = LabOrder.objects.get_or_create(visit=visit,  
                                                            laboratory=obj.execution_place,
                                                            lab_group=s.lab_group,
                                                            office=visit.office)
        print "laborder:", lab_order, created
        #lab_order.visit = visit
        #lab_order.save()
        for item in obj.service.analysis_set.all():
            result, created = Result.objects.get_or_create(order=lab_order,
                                                           analysis=item, 
                                                           sample=sampling)
            print "\t result:", result, created

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        for visit_id in args:
            
            visit = Visit.objects.get(id=visit_id)
            
            for item in visit.orderedservice_set.all():
                rebuild_laborder(item)
            