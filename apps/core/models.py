# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User

def make_operator_object(sub_model):

    class OperatorObject(models.Model):
        
        operator = models.ForeignKey(User, related_name='operator_in_%s' % sub_model)
        created = models.DateTimeField(u'Создано', auto_now_add=True)
        
        class Meta:
            abstract = True
    
    return OperatorObject



IDCardTypes = (
    ('1',u'Паспорт гражданина РФ'),
    ('2',u'Заграничный паспорт'),
)
GENDER_TYPES = (
    (u'М',u'Мужской'),
    (u'Ж',u'Женский'),
)

def make_person_object(sub_model):

    class Person(make_operator_object(sub_model)):
        last_name = models.CharField(u'Фамилия', max_length=50)
        first_name = models.CharField(u'Имя', max_length=50)
        mid_name = models.CharField(u'Отчество', max_length=50, blank=True)
        birth_day = models.DateField(u'Дата рождения')
        gender = models.CharField(u'Пол', max_length=1, choices=GENDER_TYPES)
        
        work_phone = models.CharField(u"Рабочий телефон", max_length=15, blank=True)
        home_phone = models.CharField(u"Домашний телефон", max_length=15, blank=True)
        mobile_phone = models.CharField(u"Мобильный телефон", max_length=15, blank=True)
        email = models.EmailField(u'E-mail', max_length=50, blank=True, null=True)
        
        #work_address = models.ForeignKey(City, related_name="work_address", null=True, default=None)
        work_address_street = models.CharField(u"Рабочий адрес", max_length=100, 
                                               blank=True, 
                                               help_text=u'Город, улица, дом, квартира')
            
        #home_address = models.ForeignKey(City, related_name="home_address", null=True, default=None)
        home_address_street = models.CharField(u"Домашний адрес", max_length=100, 
                                               blank=True, 
                                               help_text=u'Город, улица, дом, квартира')
        
        class Meta:
            abstract = True
    
        def full_age(self):
            return
         
        def __unicode__(self):
            return u"%s %s %s" % (self.last_name, self.first_name, self.mid_name)
    
    return Person