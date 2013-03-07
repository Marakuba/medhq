# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.contenttypes import generic
from mptt.models import MPTTModel
from core.models import Unit
from constance import config
from django.db.models.signals import post_save
from django.template import Context, Template


class Product(MPTTModel):
    """
    Номенклатура
    """
    name = models.CharField(u'Наименование', max_length=150)
    full_name = models.TextField(u'Полное наименование', blank=True, null=True)
    code = models.CharField(u'Код', max_length=60, blank=True, null=True)
    unit = models.ForeignKey(Unit, verbose_name=Unit._meta.verbose_name, null=True, blank=True)
    delivery_period = models.PositiveIntegerField(u'Срок доставки', max_length=3, null=True, blank=True)
    is_group = models.BooleanField(u'Группа', default=False)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children')

    def __unicode__(self):
        return self.name

    class Meta:
        verbose_name = u"Продукт"
        verbose_name_plural = u"Продукт"
        ordering = ('name',)


def generate_product_code(sender, **kwargs):
    obj = kwargs['instance']
    if not obj.code and config.MATERIAL_CODE_TEMPLATE:
        t = Template(config.MATERIAL_CODE_TEMPLATE)
        c = Context({'service': obj})
        result = t.render(c)
        obj.code = result
        obj.save()


post_save.connect(generate_product_code, sender=Product)
