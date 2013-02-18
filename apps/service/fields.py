# -*- coding: utf-8 -*-

from django.forms.models import ModelChoiceField, ModelMultipleChoiceField


class ServiceModelChoiceField(ModelChoiceField):

    def label_from_instance(self, obj):
        return obj.top_level_named()


class TreeModelMultipleChoiceField(ModelMultipleChoiceField):

    def label_from_instance(self, obj):
        identer = u'---'
        return u"%s %s" % (obj.level * identer, obj.name, )
