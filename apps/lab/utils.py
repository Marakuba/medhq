# -*- coding: utf-8 -*-

"""
"""
from django.core.exceptions import ObjectDoesNotExist
from service.exceptions import TubeIsNoneException
from lab.models import Sampling, LabOrder, Result, EquipmentTask
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
        raise TubeIsNoneException( u"В расширенной услуге <strong>'%s'</strong> для организации <strong>%s</strong> не указан тип пробирки" % 
                                   (ext_service.base_service.name, ext_service.state) )
    
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
    
    if ordered_service.status==u'т':
        ordered_service.status = u'л'    
    ordered_service.save()
            