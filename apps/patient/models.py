# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from core.models import make_person_object, make_operator_object
from state.models import State
import datetime
from pricelist.models import Discount
from django.db.models.aggregates import Sum
from django.utils.encoding import smart_unicode
from interlayer.models import ClientItem
from billing.models import Payment
#from visit.models import Visit


class Patient(make_person_object('patient')):
    user = models.ForeignKey(User, related_name="django_user", null=True, blank=True)
    hid_card = models.CharField(u'HID', max_length=50, blank=True)
    discount = models.ForeignKey(Discount, 
                                 verbose_name=u'Скидка', 
                                 null=True, blank=True)
    initial_account = models.DecimalField(u'Первоначальная сумма', max_digits=10, decimal_places=2, default='0.0')
    billed_account = models.DecimalField(u'Счет накопления', max_digits=10, decimal_places=2, default='0.0')
    doc = models.CharField(u'Документ', max_length=30, blank=True)
    client_item = models.OneToOneField(ClientItem, null=True, blank= True, related_name = 'client')
    balance = models.FloatField(u'Баланс', blank=True, null=True)
    
    objects = models.Manager()
    
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
    
    def update_account(self):
        visits = self.visit_set.all()
        result = visits.aggregate(price=Sum('total_price'), discount=Sum('total_discount'))
        if result['price'] is not None and result['discount'] is not None:
            total = result['price']-result['discount']
        else:
            total = 0    
        self.billed_account = total
        
        print "set new account value:", total
        
        if not self.discount or self.discount.type in (u'accum',):
            full_total = total + self.initial_account
            if not self.discount or full_total > self.discount.max:
                new_discount = Discount.objects.filter(type__iexact=u'accum', min__lte=full_total, max__gte=full_total)
                if len(new_discount):
                    self.discount = new_discount[0]
                    print "set new discount:", new_discount[0]
                else:
                    print "no discounts for current value!"
        #commit all changes
        self.save()
    
    def get_absolute_url(self):
        return u"/patient/patient/%s/" % self.id
    
    def updBalance(self):
        orders = Payment.objects.filter(client_account__client_item = self.client_item).aggregate(Sum("amount"))
        sales = 'visit.Visit'.objects.filter(client = self).aggregate(Sum("total_price"))
        discount = 'visit.Visit'.objects.filter(client = self).aggregate(Sum("total_discount"))
        self.balance = orders['amount__sum'] - ( sales['total_sum__sum'] or 0 ) + (discount['total_discount__sum'] or 0)
        print 'sales %s' % (sales['total_sum__sum'])
        self.save()
    
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
    
    def __unicode__(self):
        return smart_unicode(u'%s, %s' % (self.number, self.insurance_state) )
    
    class Meta:
        verbose_name = u'страховой полис'
        verbose_name_plural = u'страховые полисы'


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
    
    objects = models.Manager()
    
    def __unicode__(self):
        return u"%s (%s)" % (self.patient, self.card_type)
    
    class Meta:
        verbose_name = u"Карта пациента"
        verbose_name_plural = u"Карты пациента"


