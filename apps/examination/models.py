# -*- coding: utf-8 -*-
from django.db import models, transaction
from django.utils.encoding import smart_unicode
from core.models import make_operator_object
import datetime
from django.core.exceptions import ObjectDoesNotExist
from visit.models import OrderedService
from staff.models import Position
from service.models import ICD10

class TemplateGroup(models.Model):
    """
    Шаблон карты обследования
    """
    name = models.TextField(u'Наименование', null=True, blank=True)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'Группа шаблонов'
        verbose_name_plural = u'Группы шаблонов'


class CardTemplate(models.Model):
    """
    Шаблон карты обследования
    """
    staff = models.ForeignKey(Position, null=True, blank=True, verbose_name=u'Врач')
    name = models.TextField(u'Рабочее наименование', null=True, blank=True)
    print_name = models.TextField(u'Заголовок для печати', null=True, blank=True)
    complaints = models.TextField(u'Жалобы', null=True, blank=True)
    anamnesis = models.TextField(u'Анамнез', null=True, blank=True)
    objective_data = models.TextField(u'Объективные данные', null=True, blank=True)
    psycho_status = models.TextField(u'Психологический статус', null=True, blank=True)
    gen_diag = models.TextField(u'Основной диагноз', null=True, blank=True)
    complication = models.TextField(u'Осложнения', null=True, blank=True)
    ekg = models.TextField(u'ЭКГ', null=True, blank=True)
    #mbk_diag = models.ForeignKey(ICD10, null=True, blank=True)
    concomitant_diag= models.TextField(u'Сопутствующий диагноз', null=True, blank=True)
    clinical_diag = models.TextField(u'Клинический диагноз', null=True, blank=True)
    treatment = models.TextField(u'Лечение', null=True, blank=True)
    referral = models.TextField(u'Направление', null=True, blank=True)
    conclusion = models.TextField(u'Заключение', null=True, blank=True)
    group = models.ForeignKey(TemplateGroup, null=True, blank=True)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'Шаблон карты осмотра'
        verbose_name_plural = u'Шаблоны карты осмотра'
        
class ExaminationCard(models.Model):
    """
    Карта обследования
    """
    name = models.TextField(u'Рабочее наименование', null=True, blank=True)
    print_name = models.TextField(u'Заголовок для печати', null=True, blank=True)
    created = models.DateTimeField(u'Дата создания', auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    print_date = models.DateTimeField(u'Время печати', blank=True, null=True)
    ordered_service = models.ForeignKey(OrderedService,blank=True, null=True)
    disease = models.TextField(u'Характер заболевания', null=True, blank=True)
    complaints = models.TextField(u'Жалобы', null=True, blank=True)
    history = models.TextField(u'История настоящего заболевания', null=True, blank=True)
    anamnesis = models.TextField(u'Анамнез', null=True, blank=True)
    objective_data = models.TextField(u'Объективные данные', null=True, blank=True)
    psycho_status = models.TextField(u'Психологический/неврологический статус', null=True, blank=True)
    gen_diag = models.TextField(u'Основной диагноз', null=True, blank=True)
    mbk_diag = models.ForeignKey(ICD10, null=True, blank=True)
    complication= models.TextField(u'Осложнения', null=True, blank=True)
    ekg = models.TextField(u'ЭКГ', null=True, blank=True)
    concomitant_diag= models.TextField(u'Сопутствующий диагноз', null=True, blank=True)
    clinical_diag = models.TextField(u'Клинический диагноз', null=True, blank=True)
    treatment = models.TextField(u'Лечение', null=True, blank=True)
    referral = models.TextField(u'Направление', null=True, blank=True)
    extra_service = models.TextField(u'Дополнительные услуги', null=True, blank=True)
    conclusion = models.TextField(u'Заключение', null=True, blank=True)
    comment = models.TextField(u'Примечание', null=True, blank=True)
    
        
    def __unicode__(self):
        return "%s - %s - %s" % (self.created.strftime("%d/%m/%Y"),self.name or self.print_name,self.ordered_service.order.patient.short_name())
    
    class Meta:
        verbose_name = u'Карта осмотра'
        verbose_name_plural = u'Карты осмотра'
