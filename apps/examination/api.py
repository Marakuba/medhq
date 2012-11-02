# -*- coding: utf-8 -*-
from tastypie.authorization import DjangoAuthorization
from api.resources import ExtResource, ComplexQuery
from tastypie.constants import ALL, ALL_WITH_RELATIONS
from tastypie.api import Api
from examination.models import CardTemplate, ExaminationCard, TemplateGroup, DICOM, Card, Template, FieldSet,\
    SubSection, Glossary, Questionnaire, Equipment as ExamEquipment
from sorl.thumbnail import get_thumbnail
from tastypie import fields
from patient.utils import smartFilter
from django.db.models.query_utils import Q


class ExamEquipmentResource(ExtResource):
    class Meta:
        queryset = ExamEquipment.objects.all()
#        authorization = DjangoAuthorization()
        resource_name = 'exam_equipment'
        filtering = {
            'name': ALL,
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class TemplateGroupResource(ExtResource):

    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)

    class Meta:
        queryset = TemplateGroup.objects.all()
        authorization = DjangoAuthorization()
        resource_name = 'templategroup'
        filtering = {
            'name': ALL,
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class CardTemplateResource(ExtResource):

    staff = fields.ForeignKey('staff.api.PositionResource', 'staff', null=True)
    group = fields.ForeignKey(TemplateGroupResource, 'group', null=True)
    mbk_diag = fields.ForeignKey('service.api.ICD10Resource', 'mbk_diag', null=True)
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)

    def dehydrate(self, bundle):
        obj = bundle.obj
        if obj.staff:
            bundle.data['staff_name'] = obj.staff.__unicode__()
        bundle.data['group_name'] = obj.group and obj.group.name or u'Без группы'
        return bundle

    class Meta:
        queryset = CardTemplate.objects.all()
        always_return_data = True
        resource_name = 'cardtemplate'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL,
            'staff': ALL_WITH_RELATIONS,
            'id': ALL
        }
        limit = 150
        list_allowed_methods = ['get', 'post', 'put']


class ExaminationCardResource(ExtResource):

    assistant = fields.ForeignKey('staff.api.PositionResource', 'assistant', null=True)
    ordered_service = fields.ForeignKey('service.api.OrderedServiceResource', 'ordered_service', null=True)
    mbk_diag = fields.ForeignKey('service.api.ICD10Resource', 'mbk_diag', null=True)
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['name'] = obj.print_name or obj.ordered_service.service
        bundle.data['assistant_name'] = obj.assistant and obj.assistant or u''
        bundle.data['view'] = obj.__unicode__()
        bundle.data['staff_id'] = obj.ordered_service.staff.id
        return bundle

    class Meta:
        queryset = ExaminationCard.objects.all()
        resource_name = 'examcard'
        always_return_data = True
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'id': ALL,
            'name': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class CardResource(ExtResource):

    ordered_service = fields.ForeignKey('service.api.OrderedServiceResource', 'ordered_service', null=True)
    assistant = fields.ForeignKey('staff.api.PositionResource', 'assistant', null=True)
    mkb_diag = fields.ForeignKey('service.api.ICD10Resource', 'mkb_diag', null=True)
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(CardResource, self).build_filters(filters)

        if "search" in filters:
            smart_filters = smartFilter(filters['search'], 'ordered_service__order__patient')
            if len(smart_filters.keys()) == 1:
                try:
                    orm_filters = ComplexQuery(Q(**smart_filters), \
                                      **orm_filters)
                except:
                    orm_filters.update(**smart_filters)
            else:
                orm_filters.update(**smart_filters)

        return orm_filters

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['view'] = obj.__unicode__()
        bundle.data['patient_id'] = obj.ordered_service.order.patient.id
        bundle.data['patient_name'] = obj.ordered_service.order.patient.short_name()
        bundle.data['staff_id'] = obj.ordered_service.staff and obj.ordered_service.staff.id
        bundle.data['staff_name'] = obj.ordered_service.staff and obj.ordered_service.staff
        bundle.data['executed'] = obj.ordered_service.executed and True or False
        bundle.data['assistant_name'] = obj.assistant and obj.assistant.staff.short_name() or ''
        return bundle

    class Meta:
        queryset = Card.objects.all().select_related()
        resource_name = 'card'
        default_format = 'application/json'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'id': ALL,
            'created': ALL,
            'deleted': ALL,
            'name': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class TemplateResource(ExtResource):

    base_service = fields.ForeignKey('service.api.BaseServiceResource', 'base_service', null=True)
    staff = fields.ForeignKey('staff.api.StaffResource', 'staff', null=True)
    equipment = fields.ForeignKey(ExamEquipmentResource, 'equipment', null=True)

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['service_name'] = obj.base_service and obj.base_service.name
        return bundle

    class Meta:
        queryset = Template.objects.all()
        resource_name = 'examtemplate'
        default_format = 'application/json'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'base_service': ALL_WITH_RELATIONS,
            'id': ALL,
            'print_name': ALL,
            'deleted': ALL,
            'staff': ALL_WITH_RELATIONS
        }
        limit = 150
        list_allowed_methods = ['get', 'post', 'put']


class FieldSetResource(ExtResource):

    class Meta:
        queryset = FieldSet.objects.all().order_by('order')
        resource_name = 'examfieldset'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'name': ALL,
            'order': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class SubSectionResource(ExtResource):
    section = fields.ForeignKey(FieldSetResource, 'section')

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['section_name'] = obj.section.name
        return bundle

    class Meta:
        queryset = SubSection.objects.all().order_by('section')
        resource_name = 'examsubsection'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        filtering = {
            'section': ALL_WITH_RELATIONS,
            'order': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class GlossaryResource(ExtResource):

    base_service = fields.ForeignKey('service.api.BaseServiceResource', 'base_service', null=True)
    staff = fields.ForeignKey('staff.api.StaffResource', 'staff', null=True)
    parent = fields.ForeignKey('self', 'parent', null=True)

    def dehydrate(self, bundle):
        bundle.data['parent'] = bundle.obj.parent and bundle.obj.parent.id
        if bundle.obj.is_leaf_node():
            bundle.data['leaf'] = bundle.obj.is_leaf_node()
        return bundle

    def build_filters(self, filters=None):
        if filters is None:
            filters = {}

        orm_filters = super(GlossaryResource, self).build_filters(filters)

        if "parent" in filters:
            if filters['parent'] == 'root':
                del orm_filters['parent__exact']
                orm_filters['parent__isnull'] = True

        return orm_filters

    class Meta:
        queryset = Glossary.objects.all()
        resource_name = 'glossary'
        default_format = 'application/json'
        authorization = DjangoAuthorization()
        always_return_data = True
        filtering = {
            'base_service': ALL_WITH_RELATIONS,
            'staff': ALL_WITH_RELATIONS,
            'id': ALL,
            'text': ALL,
            'parent': ALL,
            'section': ALL
        }
        limit = 1000
        list_allowed_methods = ['get', 'post', 'put']


class RegExamCardResource(ExtResource):
    ordered_service = fields.ForeignKey('service.api.OrderedServiceResource', 'ordered_service', null=True)

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['staff_name'] = obj.ordered_service.staff.__unicode__()
        bundle.data['ordered_service_id'] = obj.ordered_service.id
        return bundle

    class Meta:
        queryset = ExaminationCard.objects.all()
        resource_name = 'regexamcard'
        default_format = 'application/json'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class DicomResource(ExtResource):

    examination_card = fields.ForeignKey(ExaminationCardResource, 'examination_card')

    def dehydrate(self, bundle):
        bundle.data['photo'] = bundle.obj.get_image_url()
        bundle.data['thumb'] = get_thumbnail(bundle.obj.get_image_url(), "100x100", crop="center").url
        return bundle

    class Meta:
        queryset = DICOM.objects.all()
#        authorization = DjangoAuthorization()
        resource_name = 'dicom'
        filtering = {
            'examination_card': ALL_WITH_RELATIONS,
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


class QuestionnaireResource(ExtResource):
    base_service = fields.ManyToManyField('service.api.BaseServiceResource', 'base_service')
    staff = fields.ManyToManyField('staff.api.StaffResource', 'staff')

    class Meta:
        queryset = Questionnaire.objects.all()
        resource_name = 'questionnaire'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'staff': ALL_WITH_RELATIONS,
            'base_service': ALL_WITH_RELATIONS
        }
        list_allowed_methods = ['get', 'post', 'put']


class RegExamCardResource(ExtResource):
    ordered_service = fields.ForeignKey('visit.api.OrderedServiceResource', 'ordered_service', null=True)

    def dehydrate(self, bundle):
        obj = bundle.obj
        bundle.data['staff_name'] = obj.ordered_service.staff.__unicode__()
        bundle.data['ordered_service_id'] = obj.ordered_service.id
        return bundle

    class Meta:
        queryset = ExaminationCard.objects.all()
        resource_name = 'regexamcard'
        default_format = 'application/json'
        always_return_data = True
        authorization = DjangoAuthorization()
        filtering = {
            'ordered_service': ALL_WITH_RELATIONS,
            'id': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']


api = Api(api_name='examination')

api.register(TemplateGroupResource())
api.register(CardTemplateResource())
api.register(ExaminationCardResource())
api.register(ExamEquipmentResource())
api.register(DicomResource())
api.register(FieldSetResource())
api.register(SubSectionResource())
api.register(TemplateResource())
api.register(CardResource())
api.register(GlossaryResource())
api.register(QuestionnaireResource())
api.register(RegExamCardResource())
