# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from core.models import make_person_object, make_operator_object
from state.models import State
import datetime
from pricelist.models import Discount



class Patient(make_person_object('patient')):
    user = models.ForeignKey(User, related_name="django_user", null=True, blank=True)
    hid_card = models.CharField(u'HID', max_length=50, blank=True)
    insurance_state = models.ForeignKey(State, 
                                        verbose_name=u'Страховая организация',
                                        limit_choices_to={'type':u'i'},
                                        null=True, blank=True,
                                        help_text=u'При добавлении новой организации необходимо выбрать тип: "Страховая компания"!')
    insurance_doc = models.CharField(u'Полис ДМС', max_length=50, 
                                     null=True, blank=True)
    #accept_rules = models.BooleanField(u'Согласие подписано', default=False)
    discount = models.ForeignKey(Discount, 
                                 verbose_name=u'Скидка', 
                                 null=True, blank=True)
    initial_account = models.PositiveIntegerField(u'Первоначальное накопление', default=0)
    billed_account = models.PositiveIntegerField(u'Счет накопления', default=0)
    
    def __unicode__(self):
        return u"%s - %s /%s/" % (self.zid(), self.full_name(), self.birth_day.strftime("%d.%m.%Y"))
    
    def zid(self):
        return str(self.id).zfill(7)
    zid.short_description = u'ID'
    
    def full_name(self):
        return u"%s %s %s" % (self.last_name, self.first_name, self.mid_name)
    full_name.short_description = u'Полное имя'
    
    def full_age(self):
        today = datetime.date.today()
        delta = today - self.birth_day
        return delta.days / 365
    
    def short_name(self):
        return u"%s %s.%s" % (self.last_name, self.first_name[0].capitalize(), self.mid_name and u" %s." % self.mid_name[0].capitalize() or u'')
    
    def is_f(self):
        return self.gender==u'Ж'
    
    def get_contract(self):
        """
        """
        return self.contract_set.actual()
    
    def warnings(self):
        warns = []
#        if not self.get_contract():
#            warns.append(u'Договор не заключен')
#        if not self.accept_rules:
#            warns.append(u'Согласие не подписано')
#        if len(warns):
#            return ". ".join(warns)
        return None
    
    def get_absolute_url(self):
        return u"/patient/patient/%s/" % self.id
    
    class Meta:
        verbose_name = u"Пациент"
        verbose_name_plural = u"Пациенты"
        ordering = ('last_name',)
        

class InsurancePolicy(make_operator_object('insurance_policy')):
    """
    """
    patient = models.ForeignKey(Patient)
    insurance_state = models.ForeignKey(State, limit_choices_to={'type__iexact':'i'})
    number = models.CharField(u'№ полиса', max_length=50)
    start_date = models.DateField(u'Начало действия', blank=True, null=True)
    end_date = models.DateField(u'Окончание действия', blank=True, null=True)
    
    objects = models.Manager()


class ContractManager(models.Manager):
    """
    """
    
    def actual(self):
        try:
            actual = self.get(active=True)
            return actual
        except:
            return None

class Contract(models.Model):
    """
    """
    patient = models.ForeignKey(Patient, verbose_name=Patient._meta.verbose_name)
    created = models.DateField(u'Дата заключения', auto_now_add=True)
    expire = models.DateField(u'Заключен до', default=datetime.datetime.today()+datetime.timedelta(days=365))
    active = models.BooleanField(u'Действующий', default=True)
    
    objects = ContractManager()
        
    def __unicode__(self):
        return u"Договор №%s от %s" % (self.id, self.created.strftime("%d.%m.%Y"))
    
    def details(self):
        return u"№%s от %s" % (self.id, self.created.strftime("%d.%m.%Y"))
    
    class Meta:
        verbose_name = u'договор'
        verbose_name_plural = u'договоры'
        

class CardType(models.Model):
    title = models.CharField(max_length=100)
    
    def __unicode__(self):
        return u"%s" % self.title
    
    class Meta:
        verbose_name = u"Медицинская карточка"
        verbose_name_plural = u"Медицинские карточки"
        
        
class PatientCard(make_operator_object('patient_card')):
    patient = models.ForeignKey(Patient, related_name='patient_field')
    card_type = models.ForeignKey(CardType)
    
    def __unicode__(self):
        return u"%s (%s)" % (self.patient, self.card_type)
    
    class Meta:
        verbose_name = u"Карта пациента"
        verbose_name_plural = u"Карты пациента"
