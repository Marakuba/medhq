# -*- coding: utf-8 -*-

from tastypie.authorization import DjangoAuthorization
from tastypie.constants import ALL
from tastypie import fields
from tastypie.api import Api
from api.resources import ExtResource
from medstandart.models import Standart, StandartItem, Term,\
    Complications, Stage, Phase, NosologicalForm, AgeCategory


class NosologicalFormResource(ExtResource):

    class Meta:
        queryset = NosologicalForm.objects.all()
        resource_name = 'nosological_form'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class AgeCategoryResource(ExtResource):

    class Meta:
        queryset = AgeCategory.objects.all()
        resource_name = 'age_category'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class PhaseResource(ExtResource):
    class Meta:
        queryset = Phase.objects.all()
        resource_name = 'phase'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class StageResource(ExtResource):

    class Meta:
        queryset = Stage.objects.all()
        resource_name = 'stage'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class ComplicationsResource(ExtResource):

    class Meta:
        queryset = Complications.objects.all()
        resource_name = 'complications'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class TermResource(ExtResource):

    class Meta:
        queryset = Term.objects.all()
        resource_name = 'term'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class MedStandartResource(ExtResource):
    nosological_form = fields.ForeignKey(NosologicalFormResource, 'nosological_form', null=True)
    age_category = fields.ManyToManyField(AgeCategoryResource, 'age_category', null=True)
    phase = fields.ForeignKey(PhaseResource, 'phase', null=True)
    stage = fields.ForeignKey(StageResource, 'stage', null=True)
    complications = fields.ForeignKey(ComplicationsResource, 'complications', null=True)
    terms = fields.ManyToManyField(TermResource, 'terms', null=True)
    mkb10 = fields.ForeignKey('service.api.ICD10Resource', 'mkb10')

    def dehydrate(self, bundle):
        bundle.data['nosological_form_name'] = bundle.obj.nosological_form and bundle.obj.nosological_form.name or u'Не указано'
        bundle.data['age_category_name'] = bundle.obj.get_items_str('age_category') or u'Не указано'
        bundle.data['phase_name'] = bundle.obj.phase and bundle.obj.phase.name or u'Не указано'
        bundle.data['stage_name'] = bundle.obj.stage and bundle.obj.stage.name or u'Не указано'
        bundle.data['complications_name'] = bundle.obj.complications and bundle.obj.complications.name or u'Не указано'
        bundle.data['terms_name'] = bundle.obj.get_items_str('terms') or u'Не указано'
        return bundle

    class Meta:
        queryset = Standart.objects.all()
        resource_name = 'medstandart'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'mkb10': ALL,
        }
        list_allowed_methods = ['get', 'post', 'put']


class StandartItemResource(ExtResource):
    standart = fields.ForeignKey(MedStandartResource, 'standart')
    service = fields.ForeignKey('service.api.ExtendedServiceResource', 'service')

    def dehydrate(self, bundle):
        bundle.data['service_name'] = bundle.obj.service.base_service.name
        bundle.data['price'] = bundle.obj.service.get_actual_price()
        bundle.data['state'] = bundle.obj.service.state
        return bundle

    class Meta:
        queryset = StandartItem.objects.all()
        resource_name = 'standartitem'
        authorization = DjangoAuthorization()
        always_return_data = True
        limit = 200
        filtering = {
            'id': ALL,
            'standart': ALL
        }
        list_allowed_methods = ['get', 'post', 'put']

api = Api(api_name='medstandart')

api.register(NosologicalFormResource())
api.register(AgeCategoryResource())
api.register(PhaseResource())
api.register(StageResource())
api.register(ComplicationsResource())
api.register(TermResource())
api.register(MedStandartResource())
api.register(StandartItemResource())
