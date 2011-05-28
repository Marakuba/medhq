# -*- coding: utf-8 -*-


from django.core.management.base import NoArgsCommand, BaseCommand
from visit.models import Visit
from lab.models import Result, Sampling, LabOrder
import datetime


class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        from_date = datetime.datetime(year=2011,month=3,day=28)
        visits = Visit.objects.filter(created__gte=from_date)
        for visit in visits:
            print "visit:",visit
            
            for os in visit.orderedservice_set.all():
                if os.service.is_lab() and os.execution_place.type=='b':
                    #print "\tservice",os.service,"is lab"
                    if visit.office==os.execution_place:
                        tubes = os.service.normal_tubes
                        #print "\tusing normal tubes"
                    else:
                        tubes = os.service.transport_tubes
                        #print "\tusing transport tubes"
                    tubes = tubes.all() 
                    #print "\t\t",tubes
                    for tube in tubes:
                        try:
                            sampling = Sampling.objects.get(visit=visit,
                                                 laboratory=os.execution_place,
                                                 tube=tube,
                                                 execution_type_group=os.service.execution_type_group)
                        except:
                            print "\tsampling not found"
                            sampling = None
                    #print "\t","sampling is:", sampling
            
                    try:
                        lab_order = LabOrder.objects.get(visit=visit,  
                                                         laboratory=os.execution_place,
                                                         lab_group=os.service.lab_group,
                                                         office=visit.office)     
                        #print "\t\tLaborder:", lab_order       
    
                        for item in os.service.analysis_set.all():
                            result, created = Result.objects.get_or_create(order=lab_order,
                                                                           analysis=item, 
                                                                           sample=sampling)
                            
                            if created:
                                print "\t\t result:", result, "++++++++++created" 
                            #print "\t\t\t"
                    except:
                        print "\tlab order not found!!!"
                    