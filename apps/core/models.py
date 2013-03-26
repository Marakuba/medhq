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
    ('1', u'Паспорт гражданина РФ'),
    ('2', u'Заграничный паспорт'),
)
GENDER_TYPES = (
    (u'М', u'Мужской'),
    (u'Ж', u'Женский'),
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

        guardian = models.CharField(u'Законный представитель', max_length=200, blank=True)

        id_card_type = models.CharField(u'тип документа', max_length=1,
                                        choices=IDCardTypes, blank=True, null=True)
        id_card_series = models.CharField(u'серия', max_length=6, blank=True, null=True)
        id_card_number = models.CharField(u'номер', max_length=10, blank=True, null=True)
        id_card_issue_date = models.DateField(u'Дата выдачи', blank=True, null=True)
        id_card_org = models.CharField(u"кем выдано", max_length=500, blank=True, null=True)

        class Meta:
            abstract = True

        def full_age(self):
            return

        def __unicode__(self):
            return u"%s %s %s" % (self.last_name, self.first_name, self.mid_name)

    return Person


class Unit(models.Model):
    """
    Единицы измерения
    """
    name = models.CharField(u'Название', max_length=100)

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = u'ед.изм.'
        verbose_name_plural = u'ед.изм.'
        ordering = ('name',)
