# -*- coding: utf-8 -*-

from django.db import models
from service.models import BaseService, LabServiceGroup
from lab.vars import OPERATORS, FACTOR_FIELDS, RESULTS, TEST_FORM
from state.models import State
from staff.models import Staff
import datetime
from workflow.models import Status
from django.contrib.auth.models import User
from numeration.models import NumeratorItem
import logging
from django.conf import settings
from django.utils.encoding import smart_unicode



logger = logging.getLogger()
hdlr = logging.FileHandler(settings.LOG_FILE)
formatter = logging.Formatter('[%(asctime)s]%(levelname)-8s"%(message)s"','%Y-%m-%d %a %H:%M:%S') 

hdlr.setFormatter(formatter)
logger.addHandler(hdlr)
logger.setLevel(logging.NOTSET)


class Tube(models.Model):
    """
    """
    name = models.CharField(u'Наименование', max_length=100)
    bc_count = models.IntegerField(u'Количество штрих-кодов', default=1)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'пробирка'
        verbose_name_plural = u'пробирки'
        ordering = ('name',)
        

class Measurement(models.Model):
    """
    """
    name = models.CharField(u'Наименование', max_length=50)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'единица измерения'
        verbose_name_plural = u'единицы измерения'
        ordering = ('name',)
        

class InputMask(models.Model):
    """
    """
    value = models.CharField(u'Значение', max_length=100)
    
    def __unicode__(self):
        return self.value
    
    class Meta:
        verbose_name = u'маска ввода'
        verbose_name_plural = u'маски ввода'


class InputList(models.Model):
    """
    """
    
    name = models.CharField(u'Наименование', max_length=50)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'маска результатов'
        verbose_name_plural = u'маски результатов'
        


class Analysis(models.Model):
    """
    """
    service = models.ForeignKey(BaseService, null=True, blank=True)
    equipment_assay = models.ForeignKey('lab.EquipmentAssay', null=True, blank=True)
    name = models.CharField(u'Наименование', max_length=300)
    code = models.CharField(u'Код', max_length=20, blank=True)
    input_mask = models.ForeignKey(InputMask, null=True, blank=True, verbose_name=InputMask._meta.verbose_name)
    input_list = models.ManyToManyField(InputList, null=True, blank=True, verbose_name=InputList._meta.verbose_name)
    measurement = models.ForeignKey(Measurement, null=True, blank=True, verbose_name=Measurement._meta.verbose_name)
    tube = models.ManyToManyField(Tube, null=True, blank=True, verbose_name=Tube._meta.verbose_name, related_name='m2m_tube')
    ref_range_text = models.TextField(u'Реф.интервалы (текст)', blank=True)
    order = models.PositiveIntegerField(u'Порядок', default=0, null=True, blank=True)
    
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'тест'
        verbose_name_plural = u'тесты'



class ReferenceRange(models.Model):
    """
    """
    
    analysis = models.ForeignKey(Analysis)
    operator1 = models.CharField(u'Оператор 1', max_length=2, choices=OPERATORS)
    value1 = models.CharField(u'Значение 1', max_length=50)
    operator2 = models.CharField(u'Оператор 2', max_length=2, choices=OPERATORS, blank=True)
    value2 = models.CharField(u'Значение 2', max_length=50, blank=True)
    
    
class Factor(models.Model):
    """
    """

    ref_range = models.ForeignKey(ReferenceRange)
    field = models.CharField(u"Параметр", max_length=20, choices=FACTOR_FIELDS, blank=True)
    operator = models.CharField(u'Оператор', max_length=2, choices=OPERATORS, blank=True)
    value = models.CharField(u'Значение', max_length=50, blank=True)





class LabOrder(models.Model):
    """
    """

    created = models.DateTimeField(u'Дата', auto_now_add=True)
    visit = models.ForeignKey('visit.Visit', verbose_name=u'Визит', 
                              blank=True, null=True) 
    laboratory = models.ForeignKey(State, verbose_name=u'Лаборатория', related_name='laboratory')
    lab_group = models.ForeignKey(LabServiceGroup, blank=True, null=True)
    staff = models.ForeignKey(Staff, verbose_name=u'Врач', blank=True, null=True)
    is_completed = models.BooleanField(u'Выполнен', default=False)
    is_printed = models.BooleanField(u'Печать', default=False)
    status = models.ForeignKey(Status, blank=True, null=True)
    print_date = models.DateTimeField(u'Дата печати', blank=True, null=True)
    printed_by = models.ForeignKey(User, blank=True, null=True)
    comment = models.TextField(u'Комментарий', blank=True, default='')
    
    def __unicode__(self):
        return u"Заказ №%s (%s) - %s - %s" % (str(self.id).zfill(8), self.visit.patient.short_name(), self.visit.office, self.laboratory) 
    
    def print_date_display(self):
        if self.print_date:
            return self.print_date.strftime("%d.%m.%Y / %H:%M")
        return u'---'
    print_date_display.short_description = u'Дата/время печати'
    
    def get_absolute_url(self):
        return "/lab/laborder/%s/" % self.id
    
    def operator(self):
        operator = self.visit.operator
        try:
            return operator.staff_user
        except:
            return operator
    operator.short_description = u'Регистратор'
    
    class Meta:
        verbose_name = u'заказ'
        verbose_name_plural = u'заказы'
        ordering = ('-created',)


PASS_STATUS = (
    (0, u'Требует уточнения'),
    (1, u'Валидация пройдена'),
    (-1, u'Валидация не пройдена'),
)

class Result(models.Model):
    """
    """
    
    order = models.ForeignKey(LabOrder)
    analysis = models.ForeignKey(Analysis, verbose_name=Analysis._meta.verbose_name)
    value = models.CharField(u"Результат", max_length=50, blank=True, null=True)
    presence = models.CharField(u"Наличие", max_length=1, blank=True, null=True, choices=RESULTS)
    test_form = models.CharField(u"Форма", max_length=6, blank=True, null=True, choices=TEST_FORM)
    to_print = models.BooleanField(u'Печатать', default=True)
    input_list = models.ForeignKey(InputList, blank=True, null=True, verbose_name=u'Дополнительное значение')
    is_validated = models.BooleanField(u'V', default=False)
    validation = models.IntegerField(u'Статус валидации', choices=PASS_STATUS, default=0)
    sample = models.ForeignKey('Sampling', blank=True, null=True)
    status = models.ForeignKey(Status, blank=True, null=True)
    
    def __unicode__(self):
        a = self.analysis.__unicode__()
        s = self.analysis.service.__unicode__()
        if a==s:
            return u"%s" % self.analysis
        return u"%s (%s)" % (self.analysis, self.analysis.service)
    
    def is_completed(self):
        if self.value or self.input_list or not self.to_print:
            return True
        return False
    
    def get_result(self):
        return self.value or self.input_list or u'---'
    
    def get_title(self):
        title = self.analysis.__unicode__()
        if self.test_form:
            title = u"%s (%s)" % (title, self.test_form)
        return title
    
    class Meta:
        verbose_name = u'результат'
        verbose_name_plural = u'результаты'
        ordering = ('analysis__service__%s' % BaseService._meta.tree_id_attr, #@UndefinedVariable
                    '-analysis__service__%s' % BaseService._meta.left_attr, #@UndefinedVariable
                    'analysis__order',)

class Sampling(models.Model):
    """
    """
    created = models.DateTimeField(u'Дата', default=datetime.datetime.now())
    visit = models.ForeignKey('visit.Visit', verbose_name=u"Прием", null=True, blank=True) #@UndefinedVariable
    laboratory = models.ForeignKey(State, verbose_name=u'Лаборатория')
    tube = models.ForeignKey(Tube, verbose_name=Tube._meta.verbose_name)
    tube_count = models.IntegerField(u'Количество пробирок', default=1)
    code = models.IntegerField(u'Код', null=True, blank=True)
    is_barcode = models.BooleanField()
    number = models.ForeignKey(NumeratorItem, null=True, blank=True)
    status = models.ForeignKey(Status, blank=True, null=True)
    
    def __unicode__(self):
        return u"материал №%s, %s, %s, к заказу %s" % (self.id, self.tube, self.laboratory, self.visit.id)
    
    def get_services(self):
        print self.orderedservice_set.all()
        services = self.visit.orderedservice_set.all()
        services = services.filter(execution_place=self.laboratory, service__normal_tubes=self.tube)
        return services
    
    
    
    class Meta:
        verbose_name = u'забор материала'
        verbose_name_plural = u'забор материалов'
        
        

class Equipment(models.Model):
    """
    """
    name = models.CharField(u'Наименование', max_length=100)
    slug = models.CharField(u'Короткое наименование', max_length=15)
    address = models.CharField(max_length=15)
    is_active = models.BooleanField(u'Активно', default=True)
    order = models.IntegerField(u'Порядок', default=0)

    def __unicode__(self):
        return smart_unicode(self.name)
    
    class Meta:
        verbose_name = u'оборудование'
        verbose_name_plural = u'оборудование'
        ordering = ('order',)
        
        
class EquipmentAssay(models.Model):
    """
    """
    equipment = models.ForeignKey(Equipment)
    service = models.ForeignKey('service.BaseService')

    def __unicode__(self):
        return smart_unicode( u"%s - %s" % (self.equipment, self.service) )
    
    class Meta:
        verbose_name = u'аппаратное исследование'
        verbose_name_plural = u'аппаратные исследования'    
        

class EquipmentTask(models.Model):
    """
    """
    created = models.DateTimeField(auto_now_add=True)
    equipment_assay = models.ForeignKey(EquipmentAssay)
    ordered_service = models.ForeignKey('visit.OrderedService')
    completed = models.DateTimeField(u'Выполнено', null=True, blank=True)
    
    def __unicode__(self):
        return smart_unicode( u"%s - %s" % (self.ordered_service, self.equipment_assay) )
    
    class Meta:
        verbose_name = u'задание для анализаторов'
        verbose_name_plural = u'задания для анализаторов' 

class EquipmentResult(models.Model):
    """
    """
    order = models.CharField(u'Заказ', max_length=20)
    assay = models.CharField(u'Исследование', max_length=20)
    result = models.CharField(u'Результат', max_length=100)
    measurement = models.CharField(u'Ед.изм.', max_length=15)
    