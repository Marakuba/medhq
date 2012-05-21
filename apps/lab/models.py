# -*- coding: utf-8 -*-

from django.db import models
from service.models import BaseService, LabServiceGroup
from lab.vars import OPERATORS, FACTOR_FIELDS, RESULTS, TEST_FORM
from state.models import State
from staff.models import Staff, Position
import datetime
from workflow.models import Status
from django.contrib.auth.models import User
from numeration.models import NumeratorItem
from django.conf import settings
from django.utils.encoding import smart_unicode
from core.models import GENDER_TYPES, make_operator_object
from django.db.models.aggregates import Count
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from constance import config

import logging
from django.template import Template, Context
from django.db.models.signals import post_save
logger = logging.getLogger(__name__)


class LabService(models.Model):
    """
    """
    base_service = models.OneToOneField(BaseService)
    is_manual = models.BooleanField(u'Ручное исследование', default=False)
    code = models.CharField(u'Код ручного исследования', max_length=10, blank=True)
    
    class Meta:
        verbose_name = u'лабораторная услуга'
        verbose_name_plural = u'лабораторные услуги'


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
    
    name = models.CharField(u'Наименование', max_length=200)
    
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
    by_age = models.BooleanField(u'Оценивать по возрасту')
    by_gender = models.BooleanField(u'Оценивать по возрасту')
    by_pregnancy = models.BooleanField(u'Оценивать по возрасту')
    
    def __unicode__(self):
        return self.name

    def save(self, *args, **kwargs):
        super(Analysis, self).save(*args, **kwargs)
        if not self.code:
            self.code = u'ASSAY%s' % self.pk
        super(Analysis, self).save(*args, **kwargs)
            
    class Meta:
        verbose_name = u'тест'
        verbose_name_plural = u'тесты'
        ordering = ('order',)
        

class RefRange(models.Model):
    """
    """
    analysis = models.ForeignKey(Analysis)
    title = models.CharField(u'Наименование', max_length=50, blank=True)
    age_from = models.PositiveIntegerField(u'Возраст, от (мес.)', null=True, blank=True)
    age_to = models.PositiveIntegerField(u'Возраст, до (мес.)', null=True, blank=True)
    gender = models.CharField(u'Пол', max_length=1, choices=GENDER_TYPES, blank=True)
    pregnance_from = models.PositiveIntegerField(u'Беременность, от (нед.)', null=True, blank=True)
    pregnance_to = models.PositiveIntegerField(u'Беременность, до (нед.)', null=True, blank=True)
    min_value = models.DecimalField(u'Мин.значение', max_digits=12, decimal_places=2, null=True, blank=True)
    min_value = models.DecimalField(u'Макс.значение', max_digits=12, decimal_places=2, null=True, blank=True)
    result = models.SmallIntegerField(u'Уровень', max_length=1, choices=( (-1,u'Отрицательно'),(0,u'Сомнительно'),(1,u'Норма') ) )
    
    def __unicode__(self):
        return smart_unicode(u"Ref to: %s" % (self.analysis) )
    
    class Meta:
        verbose_name = u'реф.значение'
        verbose_name_plural = u'реф.значения'


class LabOrder(models.Model):
    """
    """
    _visit = None
    
    created = models.DateTimeField(u'Дата', auto_now_add=True)
    visit = models.ForeignKey('visit.Visit', verbose_name=u'Визит', 
                              blank=True, null=True) 
    laboratory = models.ForeignKey(State, verbose_name=u'Лаборатория', related_name='laboratory')
    lab_group = models.ForeignKey(LabServiceGroup, blank=True, null=True)
    staff = models.ForeignKey(Position, verbose_name=u'Врач', blank=True, null=True, related_name='staff_pos')
    staff_text = models.TextField(u'Врач (текст)', blank=True)
    executed = models.DateTimeField(u'Дата выполнения', blank=True, null=True)
    is_completed = models.BooleanField(u'Выполнен', default=False)
    is_printed = models.BooleanField(u'Печать', default=False)
    is_manual = models.BooleanField(u'Ручные исследования', default=False)
    status = models.ForeignKey(Status, blank=True, null=True)
    print_date = models.DateTimeField(u'Дата печати', blank=True, null=True)
    printed_by = models.ForeignKey(User, blank=True, null=True)
    comment = models.TextField(u'Комментарий', blank=True, default='')
    
    def __unicode__(self):
        return u"Заказ №%s (%s) - %s - %s" % (str(self.id).zfill(8), self.visit.patient.short_name(), self.visit.office, self.laboratory) 
    
    def get_info(self):
        if not hasattr(self, '_info'):
            self._info = u"Заказ %s, %s, %s, %s" % (self.visit.barcode.id, 
                                          self.visit.created.strftime('%d.%m.%Y'), 
                                          self.visit.office, 
                                          self.visit.patient.short_name() ) 
        return self._info
    
    def print_date_display(self):
        if self.print_date:
            return self.print_date.strftime("%d.%m.%Y / %H:%M")
        return u'---'
    print_date_display.short_description = u'Дата/время печати'
    
    def get_absolute_url(self):
        return "/lab/laborder/%s/" % self.id
    
    def append_staff(self, staff_text):
        """
        """
        chunks = self.staff_text.split('\n')
        print chunks
        if not staff_text in chunks:
            chunks.append(staff_text)
        self.staff_text = "\n".join(chunks)
        self.save()
    
    def confirm_results(self, autoclean=True):
        if autoclean:
            Result.objects.filter(analysis__service__labservice__is_manual=False, 
                                  order=self, 
                                  validation=0).delete()
            Result.objects.filter(order=self, 
                                  validation=-1).update(validation=1)
        self.is_completed = True
        for result in self.result_set.all():
            if not result.is_completed():
                self.is_completed = False
                break
        if self.is_completed:
            ordered_services = self.visit.orderedservice_set.filter(execution_place=self.laboratory,
                                                                    service__lab_group=self.lab_group)
            if self.is_manual:
                ordered_services.filter(labservice__is_manual=True)
            ordered_services.update(status=u'з',
                                    executed=self.executed)
        self.save()
        
    def revert_results(self):
        ordered_services = self.visit.orderedservice_set.filter(execution_place=self.laboratory,
                                                                service__lab_group=self.lab_group)
        if self.is_manual:
            ordered_services.filter(labservice__is_manual=True)
        for ordered_service in ordered_services:
            for analysis in ordered_service.service.analysis_set.all():
                result, created = Result.objects.get_or_create(order=self,
                                                               analysis=analysis, 
                                                               sample=ordered_service.sampling)
        for result in self.result_set.all():
            if not result.is_completed():
                self.is_completed = False
                break
        self.save()

    def operator(self):
        operator = self.visit.operator
        try:
            return operator.staff_user
        except:
            return operator
    operator.short_description = u'Регистратор'
    
    def save(self, *args, **kwargs):
        self.staff_text = self.staff and self.staff.__unicode__().strip() or u''
        super(LabOrder, self).save(*args, **kwargs)
        
    class Meta:
        verbose_name = u'заказ'
        verbose_name_plural = u'заказы'
        ordering = ('-visit__created',)


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
    previous_value = models.CharField(u"Предыдущий результат", max_length=200, blank=True, null=True)
    value = models.CharField(u"Результат", max_length=200, blank=True, null=True)
    presence = models.CharField(u"Наличие", max_length=1, blank=True, null=True, choices=RESULTS)
    test_form = models.CharField(u"Форма", max_length=6, blank=True, null=True, choices=TEST_FORM)
    to_print = models.BooleanField(u'Печатать', default=True)
    input_list = models.ForeignKey(InputList, blank=True, null=True, verbose_name=u'Дополнительное значение')
    is_validated = models.BooleanField(u'V', default=True)
    validation = models.IntegerField(u'Статус валидации', choices=PASS_STATUS, default=0)
    sample = models.ForeignKey('Sampling', blank=True, null=True)
    status = models.ForeignKey(Status, blank=True, null=True)
    modified = models.DateTimeField(auto_now=True)
    modified_by = models.ForeignKey(User, blank=True, null=True)
    
    def __unicode__(self):
        a = self.analysis.__unicode__()
        s = self.analysis.service.__unicode__()
        if a==s:
            return u"%s" % self.analysis
        return u"%s (%s)" % (self.analysis, self.analysis.service)
    
    def is_completed(self):
        if self.analysis.service.labservice.is_manual:
            return True
        if self.value or self.input_list or not self.to_print:
            return True
        return False
    
    def get_result(self):
        return self.value or self.input_list or u'---'
    
    def get_full_result(self):
        return smart_unicode(u"%s %s" % ( self.get_result(),self.analysis.measurement ))
    
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
        return u"№%s, %s, %s, к заказу %s" % (self.id, self.tube, self.laboratory, self.visit.id)
    
    def short_title(self):
        return u"№%s, %s" % (self.id, self.tube)
    
    def get_services(self):
#        services = self.visit.orderedservice_set.all()
        pass    
    
    
    class Meta:
        verbose_name = u'забор материала'
        verbose_name_plural = u'забор материалов'


class Invoice(make_operator_object('invoice')):
    """
    """
    office = models.ForeignKey(State, verbose_name=u'Офис', limit_choices_to={'type':u'b'}, related_name='office') 
    modified = models.DateTimeField(u'Изменено', auto_now=True)
    state = models.ForeignKey(State, related_name='lab')
    comment = models.TextField(u'Комментарий', blank=True)
    
    objects = models.Manager()
    
    def __unicode__(self):
        return smart_unicode(self.id)
    
    class Meta:
        verbose_name = u'накладная'
        verbose_name_plural = u'накладные'
        ordering = ('-id',)    
        
        
class InvoiceItem(make_operator_object('invoice_item')):
    """
    """
    invoice = models.ForeignKey(Invoice, blank=True, null=True)
    ordered_service = models.OneToOneField('visit.OrderedService')
    
    def __unicode__(self):
        return smart_unicode(self.ordered_service)
    
    class Meta:
        verbose_name = u'позиция накладной'
        verbose_name_plural = u'позиции накладных'
        ordering = ('id',)     
    
    
class EquipmentAnalysis(models.Model):
    analysis = models.OneToOneField(Analysis)
    
    def __unicode__(self):
        return self.analysis.__unicode__()
    
    class Meta:
        ordering = ('analysis__name',)
        

class Equipment(models.Model):
    """
    """
    name = models.CharField(u'Наименование', max_length=100)
    slug = models.CharField(u'Короткое наименование', max_length=15)
    serial_number = models.CharField(max_length=30)
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
    service = models.ForeignKey('service.BaseService', blank=True, null=True)
    equipment_analysis = models.ForeignKey(EquipmentAnalysis, blank=True, null=True)
    name = models.CharField(u'Название', max_length=20, blank=True)
    code = models.CharField(u'Код', max_length=20)
    def_protocol = models.TextField(u'Протокол исследования', default="", blank=True)
    is_active = models.BooleanField(u'Активно', default=True)

    def __unicode__(self):
        return smart_unicode( u"%s [%s]" % (self.equipment_analysis,self.equipment) )
    
    class Meta:
        verbose_name = u'аппаратное исследование'
        verbose_name_plural = u'аппаратные исследования'    
        ordering = ('name',)
        
ET_STATUS = (
    (u'wait', u'Ожидание'),
    (u'proc', u'В работе'),
    (u'done', u'Выполнен'),
    (u'disc', u'Отменен'),
    (u'lock', u'Заблокирован'),
)

class EquipmentTask(models.Model):
    """
    """
    created = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, blank=True, null=True)
    equipment_assay = models.ForeignKey(EquipmentAssay)
    ordered_service = models.ForeignKey('visit.OrderedService')
    assay_protocol = models.CharField(u'Протокол исследования', max_length=20, default='')
    result = models.ForeignKey(Result, blank=True, null=True)
    completed = models.DateTimeField(u'Выполнено', null=True, blank=True)
    is_locked = models.BooleanField(u'Заблокировано', default=False)
    repeats = models.IntegerField(u'Количество', default=0)
    status = models.CharField(u'Статус', max_length=5, choices=ET_STATUS, default=u'wait')
    
    def __unicode__(self):
        return "<<EQTASK>>"
#        return smart_unicode( u"%s - %s" % (self.ordered_service, self.equipment_assay) )
    def save(self, *args, **kwargs):
        if not self.pk and not self.assay_protocol:
            t = Template(self.equipment_assay.def_protocol)
            c = Context({'order':self.ordered_service})
            self.assay_protocol = t.render(c)
        super(EquipmentTask, self).save(*args, **kwargs)
    class Meta:
        verbose_name = u'задание для анализаторов'
        verbose_name_plural = u'задания для анализаторов' 
        ordering = ('-created',)
        

RESULT_TYPE = (
    ('F',u'Итоговый'),
    ('I',u'Интерпретируемый'),
    ('P',u'Инструментальный'),
)

RESULT_STATUS = (
    ('F',u'Итоговый'),
    ('R',u'Повторный'),
    ('X',u'Невозможно выполнить тест'),
)

class EquipmentResult(models.Model):
    """
    """
    equipment_task = models.ForeignKey(EquipmentTask, blank=True, null=True)
    created = models.DateTimeField(u'Получено', auto_now_add=True)
    eq_serial_number = models.CharField(u'SN анализатора', max_length=30)
    specimen = models.CharField(u'Заказ', max_length=20)
    assay_name = models.CharField(u'Наименование', max_length=20, blank=True)
    assay_code = models.CharField(u'Код', max_length=20)
    assay_protocol = models.CharField(u'Протокол', max_length=20, blank=True)
    result_type = models.CharField(u'Тип результата', max_length=1, choices=RESULT_TYPE)
    result_status = models.CharField(u'Статус результата', max_length=1, choices=RESULT_STATUS)
    abnormal_flags = models.CharField(u'Флаги', max_length=50)
    result = models.CharField(u'Результат', max_length=100)
    units = models.CharField(u'Ед.изм.', max_length=15)
    
    def save(self, *args, **kwargs):
        if not self.pk:
            try:
                equipment_task = EquipmentTask.objects.get(equipment_assay__equipment__serial_number=self.eq_serial_number,
#                                                           equipment_assay__name=self.assay_name,
                                                           equipment_assay__code=self.assay_code,
                                                           ordered_service__order__barcode__id=int(self.specimen))
                if equipment_task:
                    self.equipment_task = equipment_task
                    if self.result_type=='F':
                        visit = self.equipment_task.ordered_service.order
                        try:
                            result_obj = Result.objects.get(order__visit=visit,
                                                            analysis=self.equipment_task.equipment_assay.equipment_analysis.analysis)
                            logger.debug(u"LAB: result %s" % result_obj.id)
                            if result_obj.value:
                                result_obj.previous_value = result_obj.value
                            result_obj.value=self.result
                            result_obj.save()
                            self.equipment_task.result = result_obj
                            self.equipment_task.status = u'done'
                            self.equipment_task.repeats += 1
                            self.equipment_task.save()
                        except MultipleObjectsReturned:
                            logger.exception(u"LAB: MultipleObjectsReturned")
                        except ObjectDoesNotExist:
                            logger.exception(u"LAB: result not found")
                        except Exception, err:
                            smart_unicode
                            logger.exception(u"LAB:Error during result finding")
            except Exception, err:
                logger.debug(u"""LAB:Error during eq/task finding: %s SN: %s Name: %s Code: %s Specimen: %s""" % ( err.__unicode__(), self.eq_serial_number, self.assay_name, self.assay_code, self.specimen ) )
        super(EquipmentResult, self).save(*args, **kwargs)

        
def generate_analysis_code(sender, **kwargs):
    obj = kwargs['instance']
    if not obj.code and config.ANALYSIS_CODE_TEMPLATE:
        t = Template(config.ANALYSIS_CODE_TEMPLATE)
        c = Context({'analysis':obj})
        result = t.render(c)
        obj.code = result
        obj.save()
        
def generate_lab_code(sender, **kwargs):
    obj = kwargs['instance']
    if not obj.code and config.LAB_SERVICE_CODE_TEMPLATE:
        t = Template(config.LAB_SERVICE_CODE_TEMPLATE)
        c = Context({'labservice':obj})
        result = t.render(c)
        obj.code = result
        obj.save()

post_save.connect(generate_analysis_code, sender=Analysis)
post_save.connect(generate_analysis_code, sender=LabService)