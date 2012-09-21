# -*- coding: utf-8 -*-

from django.db import models
import mptt
from django.conf import settings
from staff.models import Staff, Position
from numeration.models import Numerator
from django.utils.encoding import smart_unicode
from django.conf.locale import tr
from django.core.cache import cache, get_cache
from django.db.models.signals import post_save
from mptt.models import MPTTModel
import datetime
from state.models import State
from constance import config
from collections import defaultdict
from django.template import Context, Template
from pricelist.models import get_actual_ptype


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
    template = models.CharField(u'Шаблон', max_length=100, blank=True)
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
    

            
BS_TYPES = (
    (u'cons',u'консультативная услуга'),
    (u'man',u'манипуляция'),
    (u'exam',u'обследование'),
    (u'article',u'товар'),
    (u'material',u'материал'),
    (u'group',u'группа'),
    (u'archive',u'архив'),
)
if 'lab' in settings.INSTALLED_APPS:
    BS_TYPES = BS_TYPES + ( (u'lab',u'лабораторная услуга'), )
    
class BaseService(models.Model):
    
    parent = models.ForeignKey('self', null=True, blank=True, 
                               related_name='children', verbose_name=u'Группа')
    name = models.CharField(u'Наименование', max_length=300)
    short_name = models.CharField(u'Краткое наименование', null=True, blank=True, max_length=300)
    base_group = models.ForeignKey(BaseServiceGroup, null=True, blank=True)
    execution_type_group = models.ForeignKey(ExecutionTypeGroup, null=True, blank=True)
    code = models.CharField(u'Код', max_length=25, null=True, blank=True)
    standard_service = models.ForeignKey(StandardService, null=True)
    execution_time = models.PositiveIntegerField(u'Время выполнения', null=True, blank=True)
    partnership = models.BooleanField(u'В направление')
    version = models.PositiveIntegerField(u'Версия', default=0, null=True, blank=True)
    is_group = models.BooleanField(u'Группа',default=False)
    
    material = models.ForeignKey(Material, blank=True, null=True)
    gen_ref_interval = models.TextField(u"Общий референсный интервал", 
                                        null=True, blank=True, 
                                        help_text=u'Выводится в результатах один на все тесты. Если пусто, используются значения из тестов.')
    lab_group = models.ForeignKey(LabServiceGroup, null=True, blank=True)
    
    
    inner_template = models.CharField(u'Рабочий бланк', max_length=100, blank=True)
    conditions = models.ManyToManyField(Condition, null=True, blank=True)
    
    description = models.TextField(u'Дополнительное описание', blank=True)
    type = models.CharField(u'Тип', choices=BS_TYPES, default=u'cons', max_length=10)

    _top = {}
    _parents = {}
    
    def __unicode__(self):
        #return "%s %s" % (self.code, self.name)
        return self.name 
    
    def is_manual(self):
        try:
            if self.labservice:
                return self.labservice.is_manual
        except:
            pass
        
        return False
    
    def is_lab(self):
        try:
            ls = self.labservice
            is_lab = True
        except:
            is_lab = self.lab_group is not None
        return is_lab 
    
    def get_ex_place(self):
        try:
            place = self.execution_place.get(is_prefer=True)
        except:
            try:
                place = self.execution_place.all()[0]
            except:
                return self.execution_place.get(id=config.MAIN_STATE_ID)
        return place
    
    def price(self, state=None, date=None, payment_type=u'н', payer=None):
        """
        """
        if state:
            try:
                price = self.extendedservice_set.get(state=state).get_actual_price(date=date, payment_type=payment_type, payer=payer)
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
    
    def top_level_named(self):
        if self.is_leaf_node():
            try:
                if self.id not in BaseService._top:
                    BaseService._top[self.id] = self.get_ancestors()[0]
                _top = BaseService._top[self.id]
                return u"%s / %s" % ( self.__unicode__(), _top.__unicode__() )
            except:
                pass
        return self.__unicode__()
    
    def get_parent(self):
        if self.id not in BaseService._parents:
            return None
        return BaseService._parents[self.id]
    
    @classmethod
    def cache_parents(self):
        services = BaseService.objects.all().order_by(BaseService._meta.tree_id_attr, BaseService._meta.left_attr, 'level')
        BaseService._parents = dict([(s['id'],s['parent__id']) for s in services.values('parent__id','id')])
    
    def get_absolute_url(self):
        return "/service/baseservice/%s/" % self.id
    
    class Meta:
        verbose_name = u"услуга клиники"
        verbose_name_plural = u"услуги клиники"
        ordering = ('name',)


class PlainBaseService(BaseService):
    
    class Meta:
        proxy = True
        verbose_name = u'услуга (адм.)'
        verbose_name_plural = u'услуги (адм.)'
        

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
                              limit_choices_to = {'type__in':(u'b',u'p')},
                              related_name = 'branches')
    tube = models.ForeignKey('lab.Tube', 
                             related_name='tube', 
                             null=True, blank=True,
                             verbose_name=u'Пробирка')
    tube_count = models.IntegerField(u'Количество пробирок', 
                                     null=True, blank=True)
    is_active = models.BooleanField(u'Активно', default=True)
    is_manual = models.BooleanField(u'Ручной метод', default=False)
    staff = models.ManyToManyField(Position, verbose_name=u'Кем выполняется', null=True, blank=True)
    code = models.CharField(u'Внешний код', max_length=20, blank=True)
    base_profile = models.ForeignKey('lab.AnalysisProfile', null=True, blank=True,
                                     verbose_name=u'Профиль')
    
    
    objects = ExtendedServiceManager()
    
    @classmethod
    def get_all_staff(cls):
        services = ExtendedService.objects.all().values('base_service__id','staff__id','staff__staff__last_name','staff__staff__first_name','staff__staff__mid_name','staff__title')
        
        r = defaultdict(list)
        
        for s in services:
            if s['staff__id']:
                r[s['base_service__id']].append([s['staff__id'], u'%s %s. %s., %s' % ( s['staff__staff__last_name'], s['staff__staff__first_name'] and s['staff__staff__first_name'][0] or u'', s['staff__staff__mid_name'] and s['staff__staff__mid_name'][0] or u'', s['staff__title'] )])
        
        return r
    
    def get_actual_price(self, date=None, payment_type=u'н', payer=None, p_type=None):
        args = {}
        if payer:
            args['payer'] = payer
        else:
            args['payer__isnull'] = True
        date = date or datetime.date.today()
        if not p_type:
            p_type = get_actual_ptype(date)
        try:
            price_item = self.price_set.filter(type=p_type,price_type=u'r', payment_type=payment_type, on_date__lte=date, **args).latest('on_date')
            return int(price_item.value.normalize())
        except:
            return 0
    
#    def get_absolute_url(self):
#        return "/admin/service/extendedservice/%s/" % self.id
#    
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



def _clear_cache():
    try:
        cache = get_cache('service')
        cache.clear()
        BaseService._top = {}
    except:
        pass

def clear_service_cache(sender, **kwargs):
    if config.SERVICE_CACHE_AUTO_CLEAR:
        _clear_cache()
        #raise "Service cache must be defined!"
        
def generate_service_code(sender, **kwargs):
    obj = kwargs['instance']
    if not obj.code and config.BASE_SERVICE_CODE_TEMPLATE:
        t = Template(config.BASE_SERVICE_CODE_TEMPLATE)
        c = Context({'service':obj})
        result = t.render(c)
        obj.code = result
        obj.save()
        

post_save.connect(generate_service_code, sender=BaseService)
post_save.connect(clear_service_cache, sender=BaseService)
post_save.connect(clear_service_cache, sender=ExtendedService)