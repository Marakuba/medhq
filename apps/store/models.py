# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from mptt.models import MPTTModel
from core.models import Unit
from constance import config
from django.db.models.signals import post_save
from django.template import Context, Template
from state.models import State
from visit.models import OrderedService
from django.db import connection


class Product(MPTTModel):
    """
    Номенклатура
    """
    name = models.CharField(u'Наименование', max_length=150)
    full_name = models.TextField(u'Полное наименование', blank=True, null=True)
    code = models.CharField(u'Код', max_length=60, blank=True, null=True)
    unit = models.ForeignKey(Unit, verbose_name=Unit._meta.verbose_name, null=True, blank=True)
    delivery_period = models.IntegerField(u'Срок доставки', max_length=3, null=True, blank=True)
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
    object_id = models.PositiveIntegerField(blank=True, null=True)
    source = generic.GenericForeignKey('content_type', 'object_id')
    # base_service = models.ForeignKey('service.BaseService')
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
    object_id = models.PositiveIntegerField(blank=True, null=True)
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
    number = models.CharField(u'Номер партии', max_length=30, blank=True, null=True)
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


def on_visit_save(document):
    ordered_services = OrderedService.objects.filter(order=document)
    #Собираем общий список необходимых продуктов из всех ordered_service
    general_list = {}
    for ord_serv in ordered_services:
        prod_list = get_service_products(ord_serv.service)
        for prod in prod_list:
            if prod['product'] in general_list:
                general_list[prod['product']] += prod['count']
            else:
                general_list[prod['product']] = prod['count']
    stores = {}
    for prod_id in general_list.keys():
        #Создаем документы для разных складов, откуда берутся продукты
        store_list = get_product_lots(prod_id, general_list[prod_id])
        for store in store_list:
            if store in stores:
                stores[store['store']] += store['lots']
            else:
                stores[store['store']] = store['lots']
    for store in stores.keys():
        doc = Document.objects.create(store=store, reason_doc=document)
        lot_list = stores[store]
        for item in lot_list:
            #списание
            source_lot = item['lot']
            lot = Lot(product=source_lot.product,
                      number=source_lot.number,
                      expire_date=source_lot.expire_date,
                      document=doc,
                      count=item['count'])
            RegistryItem(lot=lot, count=-lot['count'])


def on_labresult_save(document):
    service = document.equipment_task.ordered_service.service
    #prod_list = [{'product': id, 'count': int}]
    prod_list = get_service_products(service)
    stores = {}
    for prod in prod_list:
        #Создаем документы для разных складов, откуда берутся продукты
        store_list = get_product_lots(prod['id'], prod['count'])
        for store in store_list:
            if store in stores:
                stores[store['store']] += store['lots']
            else:
                stores[store['store']] = store['lots']
    for store in stores.keys():
        doc = Document.objects.create(store=store, reason_doc=document)
        lot_list = stores[store]
        for item in lot_list:
            #списание
            source_lot = item['lot']
            lot = Lot.objects.create(product=source_lot.product,
                                     number=source_lot.number,
                                     expire_date=source_lot.expire_date,
                                     document=doc,
                                     count=item['count'])
            RegistryItem.objects.create(lot=lot, count=-lot['count'])


def check_doc_items(doc_items=[]):
    # Проверить, что в item есть аттрибуты product и total_count
    for item in doc_items:
        if not item.get('product'):
            raise KeyError(u"не указан аттрибут 'product'")
        if not item.get('total_count'):
            raise KeyError(u"не указан аттрибут 'total_count'")


def check_lots(lots=[]):
    pass


def on_receipt_save(shipper, store, doc_items=[], lots=[]):
    if not (shipper or store):
        raise NameError("has not 'shipper' or 'store' parameter, but must be given")
    if not isinstance(shipper, State):
        raise TypeError("shipper must be State instance")
    if not isinstance(store, Store):
        raise TypeError("store must be store.Store instance")
    receipt = Receipt.objects.create(shipper=shipper)
    doc = Document.objects.create(store=store, reason_doc=receipt)
    # проверяем содержимое doc_items и lots
    check_doc_items(doc_items)
    check_lots(lots)
    for item in doc_items:
        prod = Product.objects.get(id=item.get('product'))
        count = sum([lot.get('count', 0) for lot in lots if lot.get('product') == item['product']])
        if count > item.get('total_count'):
            raise ValueError(u"%s: Общая сумма партий больше суммы document_item" % item['product'].name)
        if count < item.get('total_count'):
            recidual = item['total_count']-count
            lot = Lot.objects.create(product=prod,
                                     document=doc,
                                     count=recidual)
            RegistryItem.objects.create(lot=lot, count=recidual)
        DocumentItem.objects.create(product=prod, total_count=item['total_count'], document=doc)
    # Создаем все переданные лоты
    for lot_item in lots:
        prod = Product.objects.get(id=lot_item.get('product'))
        count = lot_item.get('count', 0)
        lot = Lot.objects.create(product=prod,
                                 document=doc,
                                 count=lot_item.get('count', 0),
                                 number=lot_item.get('number', ''),
                                 expire_date=lot_item.get('expire_date', 0))
        RegistryItem.objects.create(lot=lot, count=count)


def on_writeoff_save(store=None, product_list=[]):

    for prod in product_list:
        store_list = get_product_lots(prod.get('product'), prod.get('count'), store)
        #Найденные продукты могут находиться в разных складах. Для каждого склада
        #нужно создать отдельный документ списания
        #Если передан store и на нем не хватает нужных продуктов, то
        #создастся исключение ValueError
        for store in store_list:
            wo_doc = WriteOff.objects.create(store=store.get('store'))
            doc = Document.objects.create(store=store, reason_doc=wo_doc)
            lot_list = store.get('lots')
            #lot_list=['store': Store,
            #          'lots': [{'lot':Lot, 'count':int}]}]
            for item in lot_list:
                source_lot = item['lot']
                lot = Lot.objects.create(product=source_lot.product,
                                         number=source_lot.number,
                                         expire_date=source_lot.expire_date,
                                         document=doc,
                                         count=item['count'])
                RegistryItem.objects.create(lot=lot, count=-lot['count'])


def on_shift_save(document, store, product_list=[]):
    '''store - store_from. store_to указан в document'''
    for prod in product_list:
        store_list = get_product_lots(prod.get('product'), prod.get('count'), store)
        #Возвращен только один склад, так как он передан параметром в get_product_lots
        lot_list = store_list[0].get('lots')
        #lot_list=['store': Store,
        #          'lots': [{'lot':Lot, 'count':int}]}]

        #Создаем документ списания со склада
        writeoff = Document.objects.create(store=store, reason_doc=document)

        #Создаем документ прихода на склад
        receipt = Document.objects.create(store=document.store_to, reason_doc=document)
        for item in lot_list:
            #списание
            source_lot = item['lot']
            lot = Lot.objects.create(product=source_lot.product,
                                     number=source_lot.number,
                                     expire_date=source_lot.expire_date,
                                     document=writeoff,
                                     count=item['count'])
            RegistryItem.objects.create(lot=lot, count=-lot['count'])
            #приход
            lot = Lot.objects.create(product=source_lot.product,
                                     number=source_lot.number,
                                     expire_date=source_lot.expire_date,
                                     document=receipt,
                                     count=item['count'])
            RegistryItem.objects.create(lot=lot, count=lot['count'])


def stock_balance(store=None, product=None):
    query = '''SELECT sum(TRegItem.count)
       FROM public.store_registryitem TRegItem
       left outer join public.store_lot TLot on TLot.id = TRegItem.lot_id%s
       WHERE TLot.product_id = %s
    ''' % (store and ''' left outer join
                            public.store_document TDoc on
                            TLot.document_id=Tdoc.id ''' or '', product.id)
    if store:
        query += ' and TDoc.store_id = %s' % store.id
    cursor = connection.cursor()
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    return results[0][0]


def get_product_lots(product=None, count=0, store=None):
    '''Возвращает имеющиеся партии продуктов, содержащие необходимое их количество.
    Приоритетные лоты - с минимальным оставшимся сроком годности.
    Далее по мере добавления партии на склад
    возвращает массив словарей ['store': Store,
                                'lots': [{'lot':Lot, 'count':int}]}]'''

    query = '''SELECT TDoc.store_id, TLot.id, TLot.expire_date, sum(TRegItem.count)
       FROM public.store_registryitem TRegItem
       left outer join public.store_lot TLot on TLot.id = TRegItem.lot_id
       left outer join public.store_document TDoc on TLot.document_id=Tdoc.id
       WHERE TLot.product_id = %s
       GROUP BY TLot.id, TDoc.store_id, TLot.expire_date
       ORDER BY TLot.expire_date
    ''' % product.id
    cursor = connection.cursor()
    cursor.execute(query)
    results = cursor.fetchall()
    cursor.close()
    return results


def get_service_products(source):
    '''Возвращает список [{'product':id, 'count':int}]'''
    source_cls = source.__class__
    items = Ingredient.objects.all()
    ct = ContentType.objects.get_for_model(source_cls)
    item_ids = items.values_list("object_id", flat=True).filter(content_type=ct, object_id=source.id)
    ingredients = Ingredient.objects.filter(object_id__in=item_ids)
    prod_list = [{'product': i.product.id, 'count': i.count} for i in ingredients]
    return prod_list

SAVE_METHODS = {'visit': on_visit_save,
                'labresult': on_labresult_save,
                'receipt': on_receipt_save,
                'writeoff': on_writeoff_save,
                'shift': on_shift_save}


def get_save_method(doctype):
    return SAVE_METHODS.get(doctype)


def generate_product_code(sender, **kwargs):
    obj = kwargs['instance']
    if not obj.code and config.MATERIAL_CODE_TEMPLATE:
        t = Template(config.MATERIAL_CODE_TEMPLATE)
        c = Context({'service': obj})
        result = t.render(c)
        obj.code = result
        obj.save()


post_save.connect(generate_product_code, sender=Product)
