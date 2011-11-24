# -*- coding: utf-8 -*-

from django.db import models
import mptt
from django.conf import settings
from staff.models import Staff, Position
from numeration.models import Numerator
from django.utils.encoding import smart_unicode
from django.conf.locale import tr
from django.core.cache import cache
from django.db.models.signals import post_save
from mptt.models import MPTTModel
import datetime
from state.models import State


class ICD10(MPTTModel):
    name = models.CharField(u'Наименование', max_length=512)
    code = models.CharField(u'Код', max_length=20)
    description = models.TextField(u'Дополнительное описание')
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')

    def __unicode__(self):
        return "%s %s" % (self.code, self.name) 
    
    class Meta:
        verbose_name = u"МКБ"
        verbose_name_plural = u"МКБ"
        ordering = ('code',)


class StandardService(models.Model):
    name = models.CharField(u'Наименование', max_length=512)
    code = models.CharField(u'Код', max_length=20)
    description = models.CharField(u'Дополнительное описание', max_length=500, blank=True)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')
    
    def __unicode__(self):
        return "%s %s" % (self.code, self.name) 
    
    class Meta:
        verbose_name = u"стандартная услуга"
        verbose_name_plural = u"стандартные услуги"
        ordering = ('code',)

    def get_type(self):
        return


EXECUTION = (
    (u'у',u'УЗИ'),
    (u'к',u'Консультация'),
    (u'п',u'Процедурный кабинет'),
    (u'д',u'Другое'),
)

class Condition(models.Model):
    """
    Условия оказания услуги / взятия материала
    """
    name = models.CharField(u'Наименование', max_length=100)
        
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'условие'
        verbose_name_plural = u'условия'
        

class Material(models.Model):
    """
    Материал
    """
    name = models.CharField(u'Наименование', max_length=100)
        
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'материал'
        verbose_name_plural = u'материалы'
        

class ServiceGroup(models.Model):
    """
    Группа услуг
    """
    name = models.CharField(u'Наименование', max_length=100)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        abstract = True


class BaseServiceGroup(ServiceGroup):
    """
    """
    
    class Meta:
        verbose_name = u'группа услуг'
        verbose_name_plural = u'группы услуг'
        
    
class LabServiceGroup(ServiceGroup):
    """
    """
    template = models.CharField(u'Шаблон', max_length=100, default="print/lab/results.html")
    numerator = models.ForeignKey(Numerator, null=True, blank=True)
    
    class Meta:
        verbose_name = u'лабораторная группа'
        verbose_name_plural = u'лабораторные группы'
    

class ExecutionTypeGroup(ServiceGroup):
    """
    """
    class Meta:
        verbose_name = u'способ исполнения'
        verbose_name_plural = u'способы исполнения'
    

            

class BaseService(models.Model):
    
    parent = models.ForeignKey('self', null=True, blank=True, 
                               related_name='children', verbose_name=u'Группа')
    name = models.CharField(u'Наименование', max_length=300)
    short_name = models.CharField(u'Краткое наименование', null=True, blank=True, max_length=300)
    base_group = models.ForeignKey(BaseServiceGroup, null=True, blank=True)
    execution_type_group = models.ForeignKey(ExecutionTypeGroup, null=True, blank=True)
    code = models.CharField(u'Код', max_length=25, null=True, blank=True)
    standard_service = models.ForeignKey(StandardService, null=True)
    execution_time = models.PositiveIntegerField(u'Стандартное время выполнения', null=True, blank=True)
    #is_lab = models.BooleanField(u'В направление')
    partnership = models.BooleanField(u'В направление')
    version = models.PositiveIntegerField(u'Версия', default=0, null=True, blank=True)
    is_group = models.BooleanField(u'Это группа',default=False)
    
    ### будет пересмотрено позже
    execution_place = models.ManyToManyField('state.State', 
                                             verbose_name=u'Место выполнения',
                                             through='ExecutionPlace', 
                                             null=True, blank=True)
    ### к удалению
    execution_form = models.CharField(u'Способ исполнения', max_length=1, choices=EXECUTION, default=u'п')
    ##############
    
    material = models.ForeignKey(Material, blank=True, null=True)
    gen_ref_interval = models.TextField(u"Общий референсный интервал", 
                                        null=True, blank=True, 
                                        help_text=u'Выводится в результатах один на все тесты. Если пусто, используются значения из тестов.')
    lab_group = models.ForeignKey(LabServiceGroup, null=True, blank=True)
    
    
    ### к удалению
    normal_tubes = models.ManyToManyField('lab.Tube', null=True, blank=True, 
                                         verbose_name=u'Местная тара', 
                                         related_name='normal_tubes')
    transport_tubes = models.ManyToManyField('lab.Tube', null=True, blank=True, 
                                            verbose_name=u'Транспортная тара', 
                                            related_name='transport_tubes')
    individual_tube = models.BooleanField(u'Отдельная тара', default=False)
    ##############
    
    
    inner_template = models.CharField(u'Рабочий бланк', max_length=100, blank=True)
    conditions = models.ManyToManyField(Condition, null=True, blank=True)

    staff = models.ManyToManyField(Position, verbose_name=u'Кем выполняется', null=True, blank=True)
    
    def __unicode__(self):
        #return "%s %s" % (self.code, self.name)
        return self.name 
    
    def is_manual(self):
        if self.labservice:
            return self.labservice.is_manual
        return False
    
    def is_lab(self):
        return self.lab_group is not None
    
    def get_ex_place(self):
        try:
            place = self.execution_place.get(is_prefer=True)
        except:
            try:
                place = self.execution_place.all()[0]
            except:
                return self.execution_place.get(id=settings.MAIN_STATE_ID)
        return place
    
    def price(self, state=None, date=None, payment_type=u'н'):
        """
        """
        if state:
            try:
                price = self.extendedservice_set.get(state=state).get_actual_price(date=date, payment_type=payment_type)
                return price
            except:
                return 0
        return 0
        
    def first_price(self):
        """
        """
        try:
            price = self.extendedservice_set.active().latest('id').get_actual_price()
            return price
        except:
            return 0
        
    def price_by_states(self, slugs):
        """
        """
        if isinstance(slugs, (str,unicode)):
            slugs = (slugs,)
        prices = {}
        for slug in slugs:
            try:
                price = self.price_set.filter(type__slug=slug).latest()
                prices[slug]=price.value
            except:
                prices[slug]=None
        return prices                
    
    def get_absolute_url(self):
        return "/service/baseservice/%s/" % self.id
    
    class Meta:
        verbose_name = u"услуга клиники"
        verbose_name_plural = u"услуги клиники"
        ordering = ('name',)
        

class ExtendedServiceManager(models.Manager):
    """
    """
    
    def active(self):
        return self.filter(is_active=True)


class ExtendedService(models.Model):
    """
    """
    base_service = models.ForeignKey(BaseService)
    state = models.ForeignKey('state.State', 
                              verbose_name=u'Учреждение',
                              limit_choices_to = {'type__in':(u'm',u'b')})
    branches = models.ManyToManyField('state.State', 
                              verbose_name=u'Филиалы',
                              limit_choices_to = {'type__in':(u'b')},
                              related_name = 'branches')
    tube = models.ForeignKey('lab.Tube', 
                             related_name='tube', 
                             null=True, blank=True)
    tube_count = models.IntegerField(u'Количество пробирок', 
                                     null=True, blank=True)
    is_active = models.BooleanField(u'Активно', default=True)
    is_manual = models.BooleanField(u'Ручной метод', default=False)
    staff = models.ManyToManyField(Position, verbose_name=u'Кем выполняется', null=True, blank=True)
    
    objects = ExtendedServiceManager()
    
    def get_actual_price(self, date=None, payment_type=u'н'):
        try:
            date = date or datetime.date.today()
            price_item = self.price_set.filter(price_type=u'r', payment_type=payment_type, on_date__lte=date).latest('on_date')
            return int(price_item.value.normalize())
        except:
            return None
    
    def get_absolute_url(self):
        return "/admin/service/extendedservice/%s/" % self.id
    
    def __unicode__(self):
        return smart_unicode(u"%s" % self.base_service.short_name)
    
    class Meta:
        verbose_name = u"расширенная услуга"
        verbose_name_plural = u"расширенные услуги"
        unique_together = ('base_service', 'state')

    

class ExecutionPlace(models.Model):
    """
    """
    state = models.ForeignKey('state.State', 
                              verbose_name=u'Учреждение',
                              limit_choices_to = {'type__in':(u'm',u'b')})
    base_service = models.ForeignKey(BaseService)
    is_prefer = models.BooleanField(u'Предпочитаемое')
    is_blocked = models.BooleanField(u'Временно недоступно')
    
    class Meta:
        verbose_name = u"место выполнения"
        verbose_name_plural = u"места выполнения"


try:
    mptt.register(StandardService)
    mptt.register(BaseService)
except mptt.AlreadyRegistered:
    pass


def clear_service_cache(sender, **kwargs):
    if settings.SERVICETREE_ONLY_OWN:
        own_states = State.objects.filter(type=u'b')
        for state in own_states:
            _state_key = u'service_list_%s' % state.id
            cache.delete(u'%s' % (_state_key,) )
            cache.delete(u'%s_%s' % (_state_key,u'н') )
            cache.delete(u'%s_%s' % (_state_key,u'б') )
            cache.delete(u'%s_%s' % (_state_key,u'д') )
    else:
        cache.delete(u'service_list_н')
        cache.delete(u'service_list_д')
        cache.delete(u'service_list_б')
        cache.delete(u'service_list')
    
    
post_save.connect(clear_service_cache, sender=BaseService)
post_save.connect(clear_service_cache, sender=ExtendedService)