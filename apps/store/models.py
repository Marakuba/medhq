# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
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


class Store(models.Model):
    """
    Склад
    """
    name = models.CharField(u'Наименование', max_length=150)
    state = models.ForeignKey('state.State')

    def __unicode__(self):
        return '%s. %s' % (self.name, self.state.name)

    class Meta:
        verbose_name = u"Склад"
        verbose_name_plural = u"Склады"
        ordering = ('id',)


class Ingredient(models.Model):
    """
    Склад
    """
    content_type = models.ForeignKey(ContentType, blank=True, null=True)
    source = generic.GenericForeignKey('content_type', 'object_id')
    product = models.ForeignKey(Product)
    count = models.PositiveIntegerField(u'Количество', default=0)

    def __unicode__(self):
        return '%s' % (self.id)

    class Meta:
        verbose_name = u"Иегредиент"
        verbose_name_plural = u"Ингредиенты"
        ordering = ('id',)


class Receipt(models.Model):
    """Поступление товара
    """
    created = models.DateTimeField(u'Создано', auto_now_add=True)
    shipper = models.ForeignKey('state.State', null=True, blank=True)
    store = models.ForeignKey(Store)

    def __unicode__(self):
        return '%s. %s' % (self.created, self.shipper.name)

    class Meta:
        verbose_name = u"Поступление материала"
        verbose_name_plural = u"Документы поступления материала"
        ordering = ('id',)


class WriteOff(models.Model):
    """Списание товара
    """
    created = models.DateTimeField(u'Создано', auto_now_add=True)

    def __unicode__(self):
        return '%s. %s' % (self.created, self.shipper.name)

    class Meta:
        verbose_name = u"Списание материалов"
        verbose_name_plural = u"Документы списания материалов"
        ordering = ('id',)


class ProductShift(models.Model):
    """Перемещение
    """
    created = models.DateTimeField(u'Создано', auto_now_add=True)
    store_from = models.ForeignKey(Store, related_name='store_from')
    store_to = models.ForeignKey(Store, related_name='store_to')

    def __unicode__(self):
        return '%s. %s' % (self.created, self.shipper.name)

    class Meta:
        verbose_name = u"Перемещение материалов"
        verbose_name_plural = u"Документы перемещения материалов"
        ordering = ('id',)


class Document(models.Model):
    created = models.DateTimeField(u'Создано', auto_now_add=True)
    store = models.ForeignKey(Store)
    content_type = models.ForeignKey(ContentType, blank=True, null=True)
    reason_doc = generic.GenericForeignKey('content_type', 'object_id')

    class Meta:
        verbose_name = ('Документ')
        verbose_name_plural = ('Документы')
        ordering = ('id',)

    def __unicode__(self):
        return "%s" % self.id


class DocumentItem(models.Model):
    document = models.ForeignKey(Document)
    product = models.ForeignKey(Product, blank=True, null=True)
    total_count = models.IntegerField(u'Общее количество', default=0)

    class Meta:
        verbose_name = ('Позиция документа')
        verbose_name_plural = ('Позиция документа')

    def __unicode__(self):
        return "%s" % self.id


class Lot(models.Model):
    document = models.ForeignKey(Document)
    product = models.ForeignKey(Product, blank=True, null=True)
    count = models.IntegerField(u'Количество', default=0)
    number = models.CharField(u'Номер партии', blank=True, null=True)
    expire_date = models.PositiveIntegerField(u'Срок годности', default=0)

    class Meta:
        verbose_name = ('Партия')
        verbose_name_plural = ('Партии')

    def __unicode__(self):
        return "%s" % self.id


class RegistryItem(models.Model):
    created = models.DateTimeField(u'Создано', auto_now_add=True)
    lot = models.ForeignKey(Lot)
    count = models.IntegerField(u'Количество', default=0)

    class Meta:
        verbose_name = ('Позиция учета')
        verbose_name_plural = ('Позиции учета')

    def __unicode__(self):
        return "%s" % self.id


def on_visit_save(*args, **kwargs):
    pass


def on_labresult_save(*args, **kwargs):
    pass


def on_receipt_save(*args, **kwargs):
    pass


def on_writeoff_save(*args, **kwargs):
    pass


def on_shift_save(*args, **kwargs):
    pass


def stock_balance(store=None, product=None):
    pass


def get_product_lots(product=None, count=0, store=None):
    pass


def get_service_products(service):
    pass


DOC_SAVE_METHODS = (('visit', on_visit_save),
                    ('labresult', on_labresult_save),
                    ('receipt', on_receipt_save),
                    ('writeoff', on_writeoff_save),
                    ('shift', on_shift_save))


def get_save_method(doctype):
    pass


def generate_product_code(sender, **kwargs):
    obj = kwargs['instance']
    if not obj.code and config.MATERIAL_CODE_TEMPLATE:
        t = Template(config.MATERIAL_CODE_TEMPLATE)
        c = Context({'service': obj})
        result = t.render(c)
        obj.code = result
        obj.save()


post_save.connect(generate_product_code, sender=Product)
