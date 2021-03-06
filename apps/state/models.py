# -*- coding: utf-8 -*-

# Depends on: Staff, Rusgeo, Service
#
#


from constance import config
from django.db import models
from django_extensions.db.fields import UUIDField
import pytils
from pricelist.models import PriceType


#TODO: реквизиты организаций

STATE_TYPES = (
    (u'm', u'Медицинское учреждение'),
    (u'b', u'Собственный филиал'),
    (u'i', u'Страховая компания'),
    (u'j', u'Прочее юридическое лицо'),
    (u'p', u'Медицинский пункт'),
)


class State(models.Model):
    name = models.CharField(u"Рабочее наименование", max_length=200)
    print_name = models.CharField(u"Наименование для печати", max_length=200, default=u'')
    official_title = models.CharField(u"Официальное наименование", max_length=200)
    uuid = UUIDField(auto=False, blank=True)
    #address = models.ForeignKey(City, related_name="work_address", null=True, default=None)
    address_street = models.CharField(u"Адрес", max_length=200, blank=True,
                                      help_text=u'Индекс, регион, населенный пункт, улица, дом')
    post_address = models.CharField(u"Почтовый адрес", max_length=200, blank=True,
                                      help_text=u'Индекс, регион, населенный пункт, улица, дом')
    website = models.URLField(u'Адрес сайта', blank=True, verify_exists=False)
    email = models.EmailField(u'E-mail', blank=True)
    type = models.CharField(u'Тип', max_length=1, choices=STATE_TYPES)
    phones = models.CharField(u'Телефоны', max_length=100, blank=True, null=True)
    fax = models.CharField(u'Факс', max_length=100, blank=True, null=True)
    licenses = models.CharField(u'Лицензии', max_length=150, blank=True, null=True)
    head = models.CharField(u'Руководитель', max_length=150, blank=True, null=True)
    head_title = models.CharField(u'Данные о руководителе в договор', max_length=300, blank=True, null=True)

    inn = models.DecimalField(u'ИНН', max_digits=12, decimal_places=0, blank=True, null=True)
    kpp = models.DecimalField(u'КПП', max_digits=9, decimal_places=0, blank=True, null=True)
    ogrn = models.DecimalField(u'ОГРН', max_digits=15, decimal_places=0, blank=True, null=True)
    bank_details = models.TextField(u'Банковские реквизиты', blank=True, null=True)
    price_type = models.ForeignKey('pricelist.PriceType', null=True, blank=True)

    logo = models.ImageField(u'Логотип', blank=True, null=True, upload_to='uploads/states')

    def __unicode__(self):
        return u"%s" % self.name

    def translify(self):
        return pytils.translit.translify(self.name).upper()

    def save(self, *args, **kwargs):
        if not self.price_type:
            if self.type == 'i':
                try:
                    pt = PriceType.objects.get(id=config.DEFAULT_PRICETYPE_INSURANCE)
                except:
                    raise Exception('Configured DEFAULT_PRICETYPE_INSURANCE type not found')
            elif self.type == 'm':
                try:
                    pt = PriceType.objects.get(id=config.DEFAULT_PRICETYPE_NONCASH)
                except:
                    raise Exception('Configured DEFAULT_PRICETYPE_NONCASH type not found')
            elif self.type == 'b':
                try:
                    pt = PriceType.objects.get(id=config.DEFAULT_PRICETYPE_CORP)
                except:
                    raise Exception('Configured DEFAULT_PRICETYPE_CORP type not found')
            else:
                try:
                    pt = PriceType.objects.get(id=config.DEFAULT_PRICETYPE)
                except:
                    raise Exception('Configured DEFAULT_PRICETYPE type not found')
            self.price_type = pt

        super(State, self).save(*args, **kwargs)

    class Meta:
        verbose_name = u"организация"
        verbose_name_plural = u"организации"
        ordering = ('name',)


class Department(models.Model):
    state = models.ForeignKey(State)
    name = models.CharField(u"Наименование", max_length=200)

    def __unicode__(self):
        return u"%s / %s" % (self.name, self.state)

    class Meta:
        verbose_name = u"отделение/консультация"
        verbose_name_plural = u"отделения/консультации"
