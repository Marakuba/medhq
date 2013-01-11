# -*- coding: utf-8 -*-

from tastypie.resources import ModelResource
from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie import fields
from tastypie.api import Api
from apiutils.resources import ExtResource, ComplexQuery, ExtBatchResource
from lab.models import LabOrder, Sampling, Tube, Result, Analysis, InputList,\
    Equipment, EquipmentAssay, EquipmentResult, EquipmentTask, Invoice,\
    InvoiceItem, AnalysisProfile, LabService, Measurement, LabOrderEmailTask, LabOrderEmailHistory
from patient.utils import smartFilter
from django.db.models.query_utils import Q
from tastypie.cache import SimpleCache
from visit.models import OrderedService
from apiutils.authorization import LocalAuthorization


class LSResource(ExtResource):
    base_service = fields.OneToOneField('service.api.BaseServiceResource', 'base_service')

    class Meta:
        queryset = LabService.objects.all()
        authorization = DjangoAuthorization()
        resource_name = 'ls'
        always_return_data = True
        filtering = {
            'base_service': ALL_WITH_RELATIONS,
            'is_manual': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class TubeResource(ExtResource):
    """
    """
    class Meta:
        queryset = Tube.objects.all()
        resource_name = 'tube'
        limit = 500
        filtering = {
            'id': ALL,
            'name': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class InputListResource(ModelResource):
    """
    """

    class Meta:
        queryset = InputList.objects.all()
        resource_name = 'inputlist'
        limit = 10000
        filtering = {
            'name': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class MeasurementResource(ExtResource):
    """
    """

    class Meta:
        queryset = Measurement.objects.all()
        resource_name = 'measurement'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 10000
        filtering = {
            'name': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class AnalysisProfileResource(ExtResource):
    """
    """

    class Meta:
        queryset = AnalysisProfile.objects.all()
        resource_name = 'analysisprofile'
        always_return_data = True
        filtering = {
            'id': ALL,
            'name': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class InputListResource(ModelResource):
    """
    """

    class Meta:
        queryset = AnalysisProfile.objects.all()
        resource_name = 'analysis_profile'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'id': ALL,
            'name': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class AnalysisResource(ExtResource):
    """
    """
    service = fields.ForeignKey('service.api.BaseServiceResource', 'service')
    input_list = fields.ToManyField(InputListResource, 'input_list', null=True)
    profile = fields.ForeignKey(AnalysisProfileResource, 'profile', null=True)
    measurement = fields.ForeignKey(MeasurementResource, 'measurement', null=True)

    def dehydrate(self, bundle):
        bundle.data['profile_name'] = bundle.obj.profile and bundle.obj.profile.name
        bundle.data['measurement_name'] = bundle.obj.measurement and bundle.obj.measurement.name
        return bundle

    class Meta:
        queryset = Analysis.objects.select_related().all()
        resource_name = 'analysis'
        always_return_data = True
        limit = 1000
        authorization = DjangoAuthorization()
        filtering = {
            'service': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class LabOrderResource(ExtResource):
    """
    """
    visit = fields.ToOneField('visit.api.VisitResource', 'visit', null=True)
    laboratory = fields.ForeignKey('state.api.MedStateResource', 'laboratory', null=True)
#    lab_group = fields.ForeignKey(LabServiceGroupResource, 'lab_group', null=True)
    staff = fields.ForeignKey('staff.api.PositionResource', 'staff', null=True)

    def dehydrate(self, bundle):
        laborder = bundle.obj
        bundle.data['laboratory_name'] = laborder.laboratory
        v = laborder.visit
        if v:
            info = []
            if v.pregnancy_week:
                info.append(u"Б: <font color='red'>%s</font>" % v.pregnancy_week)
            if v.menses_day:
                info.append(u"Д/ц: <font color='red'>%s</font>" % v.menses_day)
            bundle.data['info'] = "; ".join(info)
            try:
                task = laborder.laborderemailtask
                status = 'email'
                if task.status in ['sent', 'resent']:
                    status += '-go'
                elif task.status == 'failed':
                    status += '-error'
                bundle.data['send_to_email'] = status
            except:
                email_flag = v.send_to_email and 'email' or ''
                bundle.data['send_to_email'] = email_flag
            bundle.data['visit_created'] = v.created
            bundle.data['visit_is_cito'] = v.is_cito
            bundle.data['visit_id'] = v.id
            bundle.data['barcode'] = v.barcode.id
            bundle.data['is_male'] = v.patient.gender == u'М'
            bundle.data['patient_name'] = v.patient.full_name()
            bundle.data['payer_name'] = v.payer and v.payer.name or ''
            bundle.data['patient_age'] = v.patient.full_age()
            bundle.data['lat'] = v.patient.translify()
            bundle.data['operator_name'] = v.operator
            bundle.data['office_name'] = v.office
        bundle.data['staff_name'] = laborder.staff and laborder.staff.staff.short_name() or ''
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(LabOrderResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'visit__patient')
            if len(smart_filters.keys()) == 1:
                try:
                    cond = Q(**smart_filters)
                    if filters['search'].startswith('!'):
                        cond |= Q(visit__specimen=filters['search'][1:])
                    else:
                        cond |= Q(visit__barcode__id=int(filters['search']))

                    orm_filters = ComplexQuery(cond, \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

#            orm_filters.update(smartFilter(filters['search'], 'visit__patient'))

        return orm_filters

    class Meta:
        queryset = LabOrder.objects.select_related().all()
        resource_name = 'laborder'
        authorization = DjangoAuthorization()
        always_return_data = True
        caching = SimpleCache()
        limit = 100
        filtering = {
            'id': ALL,
            'created': ALL_WITH_RELATIONS,
            'visit': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'laboratory': ALL_WITH_RELATIONS,
            'lab_group': ALL_WITH_RELATIONS,
            'is_completed': ALL,
            'is_printed': ALL,
            'is_manual': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class SamplingResource(ExtResource):
    """
    """
    visit = fields.ForeignKey('visit.api.VisitResource', 'visit')
    laboratory = fields.ForeignKey('state.api.StateResource', 'laboratory')
    tube = fields.ForeignKey('lab.api.TubeResource', 'tube')
    number = fields.ForeignKey('numerator.api.NumeratorItemResource', 'number', null=True)

    def obj_delete(self, request=None, **kwargs):
        sampling_pk = kwargs['pk']
        OrderedService.objects.filter(sampling__pk=sampling_pk).update(sampling=None)
        result = super(SamplingResource, self).obj_delete(request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        bundle.data['tube_type'] = bundle.obj.tube
#        bundle.data['services'] = [item.service.__unicode__() for item in bundle.obj.get_services()]
        return bundle

    class Meta:
        queryset = Sampling.objects.all()
        authorization = DjangoAuthorization()
        resource_name = 'sampling'
        always_return_data = True
        limit = 100
        filtering = {
            'visit': ALL_WITH_RELATIONS,
            'laboratory': ALL_WITH_RELATIONS,
            'number': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class BarcodedSamplingResource(ModelResource):
    """
    """
    visit = fields.ForeignKey('visit.api.VisitResource', 'visit')
    laboratory = fields.ForeignKey('state.api.StateResource', 'laboratory')
    tube = fields.ForeignKey('lab.api.TubeResource', 'tube')
    number = fields.ForeignKey('numerator.api.NumeratorItemResource', 'number', null=True)

    def dehydrate(self, bundle):
        bundle.data['tube_type'] = bundle.obj.tube
        bundle.data['bc_count'] = bundle.obj.tube.bc_count
        bundle.data['services'] = [item.service.__unicode__() for item in bundle.obj.get_services()]
        return bundle

    class Meta:
        queryset = Sampling.objects.filter(number__isnull=True)
        resource_name = 'bc_sampling'
        always_return_data = True
        limit = 100
        filtering = {
            'visit': ALL_WITH_RELATIONS,
            'laboratory': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class ResultResource(ExtResource):
    """
    """
    order = fields.ForeignKey('lab.api.LabOrderResource', 'order')
    analysis = fields.ForeignKey(AnalysisResource, 'analysis')
    modified_by = fields.ForeignKey('core.api.UserResource', 'modified_by', null=True)
    sample = fields.ForeignKey(SamplingResource, 'sample', null=True)

    def obj_update(self, bundle, request=None, **kwargs):
        kwargs['modified_by'] = request.user
        result = super(ResultResource, self).obj_update(bundle=bundle, request=request, **kwargs)
        return result

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['barcode'] = obj.order.visit.barcode.id
        bundle.data['patient'] = obj.order.visit.patient.full_name()
        bundle.data['service_name'] = obj.analysis.service
        bundle.data['laboratory'] = obj.order.laboratory
        bundle.data['is_group'] = obj.is_group()
        bundle.data['analysis_name'] = obj.__unicode__()
        bundle.data['analysis_code'] = obj.analysis.code
        bundle.data['inputlist'] = [[input.name] for input in obj.analysis.input_list.all()]
        bundle.data['measurement'] = obj.analysis.measurement
        bundle.data['modified_by_name'] = obj.modified_by
        return bundle

    class Meta:
        queryset = Result.objects.active().select_related()
        authorization = DjangoAuthorization()
        resource_name = 'result'
        always_return_data = True
        limit = 100
        filtering = {
            'order': ALL_WITH_RELATIONS,
            'analysis': ALL_WITH_RELATIONS,
            'is_validated': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class EquipmentResource(ExtResource):

    class Meta:
        queryset = Equipment.objects.all()
        resource_name = 'equipment'
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL,
            'slug': ALL,
            'serial_number': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class EquipmentAssayResource(ExtResource):

    equipment = fields.ForeignKey(EquipmentResource, 'equipment')
    service = fields.ForeignKey('service.api.BaseServiceResource', 'service', null=True)

    def dehydrate(self, bundle):
        bundle.data['equipment_name'] = bundle.obj.equipment
        bundle.data['service_name'] = bundle.obj.equipment_analysis
        return bundle

    class Meta:
        queryset = EquipmentAssay.objects.select_related().all().order_by('service__name',)
        resource_name = 'equipmentassay'
        limit = 50
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'equipment': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
        }
        list_allowed_methods = ['get', 'post', 'put']


class EquipmentTaskReadOnlyResource(ExtBatchResource):

    equipment_assay = fields.ForeignKey(EquipmentAssayResource, 'equipment_assay')
    ordered_service = fields.ForeignKey('visit.api.OrderedServiceResource', 'ordered_service')

    def dehydrate(self, bundle):
        bundle.data['assay_code'] = bundle.obj.equipment_assay.code
        bundle.data['assay_name'] = bundle.obj.equipment_assay.name
        bundle.data['status_name'] = bundle.obj.get_status_display()
        bundle.data['equipment_name'] = bundle.obj.equipment_assay.equipment
        bundle.data['service_name'] = bundle.obj.ordered_service.service.short_name
        bundle.data['analysis_name'] = bundle.obj.equipment_assay.equipment_analysis
        bundle.data['patient_name'] = bundle.obj.ordered_service.order.patient.short_name()
        bundle.data['order'] = bundle.obj.ordered_service.order.barcode.id
        bundle.data['result'] = bundle.obj.result and bundle.obj.result.get_full_result() or u''
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(EquipmentTaskReadOnlyResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'ordered_service__order__patient')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(ordered_service__order__barcode__id=int(filters['search'])) | Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        if "order" in filters:
            orm_filters.update(ordered_service__order__barcode__id=filters['order'])
        return orm_filters

    class Meta:
        queryset = EquipmentTask.objects.all()
        resource_name = 'equipmenttaskro'
        authorization = DjangoAuthorization()
        limit = 50
        always_return_data = True
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'equipment_assay': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
            'status': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class EquipmentTaskResource(ExtBatchResource):

    equipment_assay = fields.ForeignKey(EquipmentAssayResource, 'equipment_assay')
    ordered_service = fields.ForeignKey('visit.api.OrderedServiceResource', 'ordered_service')

    def dehydrate(self, bundle):
        bundle.data['assay_code'] = bundle.obj.equipment_assay.code
        bundle.data['assay_name'] = bundle.obj.equipment_assay.name
        bundle.data['status_name'] = bundle.obj.get_status_display()
        bundle.data['equipment_name'] = bundle.obj.equipment_assay.equipment
        bundle.data['service_name'] = bundle.obj.ordered_service.service
        bundle.data['patient_name'] = bundle.obj.ordered_service.order.patient.short_name()
        bundle.data['lat'] = bundle.obj.ordered_service.order.patient.translify()
        bundle.data['order'] = bundle.obj.ordered_service.order.barcode.id
        bundle.data['result'] = bundle.obj.result and bundle.obj.result.get_full_result() or u''
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(EquipmentTaskResource, self).build_filters(filters)

        if "order" in filters:
            orm_filters.update(ordered_service__order__barcode__id=filters['order'])
        return orm_filters

    class Meta:
        queryset = EquipmentTask.objects.all()
        resource_name = 'equipmenttask'
        authorization = LocalAuthorization()
        always_return_data = True
        limit = 1000
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'equipment_assay': ALL_WITH_RELATIONS,
            'service': ALL_WITH_RELATIONS,
            'status': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class EquipmentResultResource(ExtBatchResource):

    def dehydrate(self, bundle):
        return bundle

    class Meta:
        queryset = EquipmentResult.objects.all()
        resource_name = 'equipmentresult'
        authorization = LocalAuthorization()
        filtering = {
            'order': ALL,
            'assay': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class EquipmentResultReadOnlyResource(ExtBatchResource):

    def dehydrate(self, bundle):
        return bundle

    class Meta:
        queryset = EquipmentResult.objects.all()
        resource_name = 'equipmentresultro'
        authorization = DjangoAuthorization()
        filtering = {
            'order': ALL,
            'assay': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class InvoiceResource(ExtResource):

    office = fields.ForeignKey('state.api.OwnStateResource', 'office')
    state = fields.ForeignKey('state.api.MedStateResource', 'state')

    def dehydrate(self, bundle):
        bundle.data['state_name'] = bundle.obj.state
        bundle.data['office_name'] = bundle.obj.office
        bundle.data['operator_name'] = bundle.obj.operator
        return bundle

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        kwargs['office'] = request.active_profile.department.state
        result = super(InvoiceResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    class Meta:
        queryset = Invoice.objects.all()
        resource_name = 'invoice'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 100
        filtering = {
            'id': ALL,
            'state': ALL_WITH_RELATIONS,
            'office': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class InvoiceItemResource(ExtResource):

    invoice = fields.ForeignKey(InvoiceResource, 'invoice')
    ordered_service = fields.ToOneField('visit.api.SamplingServiceResource', 'ordered_service')

    def dehydrate(self, bundle):
        s = bundle.obj.ordered_service
        bundle.data['created'] = s.order.created
        bundle.data['barcode'] = s.order.barcode.id
        bundle.data['patient_name'] = s.order.patient.short_name()
        bundle.data['service_name'] = s.service
        bundle.data['sampling'] = s.sampling.tube

        return bundle

    def obj_create(self, bundle, request=None, **kwargs):
        kwargs['operator'] = request.user
        result = super(InvoiceItemResource, self).obj_create(bundle=bundle, request=request, **kwargs)
        return result

    class Meta:
        queryset = InvoiceItem.objects.all()
        resource_name = 'invoiceitem'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 1000
        filtering = {
            'id': ALL,
            'invoice': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class LabOrderEmailTaskResource(ExtResource):

    lab_order = fields.ForeignKey(LabOrderResource, 'lab_order')

    def dehydrate(self, bundle):
        visit = bundle.obj.lab_order.visit
        bundle.data['order_id'] = visit.barcode_id
        bundle.data['order_created'] = visit.created
        bundle.data['patient_name'] = visit.patient.full_name()
        bundle.data['email'] = visit.patient.email
        bundle.data['status_text'] = bundle.obj.get_status_display()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(LabOrderEmailTaskResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'lab_order__visit__patient')
            if len(smart_filters.keys()) == 1:
                try:
                    cond = Q(**smart_filters)
                    cond |= Q(lab_order__visit__barcode__id=int(filters['search']))
                    cond |= Q(lab_order__visit__patient__email__icontains=filters['search'])

                    orm_filters = ComplexQuery(cond, \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        return orm_filters

    class Meta:
        queryset = LabOrderEmailTask.objects.all()
        resource_name = 'emailtask'
        authorization = DjangoAuthorization()
        limit = 50
        filtering = {
            'lab_order': ALL_WITH_RELATIONS,
            'status': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class LabOrderEmailHistoryResource(ModelResource):

    email_task = fields.ForeignKey(LabOrderEmailTaskResource, 'email_task')

    def dehydrate(self, bundle):
        bundle.data['status_text'] = bundle.obj.get_status_display()
        bundle.data['created_by_name'] = bundle.obj.created_by and bundle.obj.created_by.__unicode__()
        return bundle

    class Meta:
        queryset = LabOrderEmailHistory.objects.all()
        resource_name = 'emailhistory'
        authorization = DjangoAuthorization()
        limit = 50
        filtering = {
            'email_task': ALL_WITH_RELATIONS,
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='lab')

api.register(InputListResource())
api.register(LabOrderResource())
api.register(AnalysisProfileResource())
api.register(MeasurementResource())
api.register(AnalysisResource())
api.register(ResultResource())
api.register(SamplingResource())
api.register(BarcodedSamplingResource())
api.register(TubeResource())
api.register(EquipmentResource())
api.register(EquipmentAssayResource())
api.register(EquipmentResultResource())
api.register(EquipmentResultReadOnlyResource())
api.register(EquipmentTaskResource())
api.register(EquipmentTaskReadOnlyResource())
api.register(InvoiceResource())
api.register(InvoiceItemResource())
api.register(LSResource())
api.register(LabOrderEmailTaskResource())
api.register(LabOrderEmailHistoryResource())
