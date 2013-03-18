# -*- coding: utf-8 -*-
from django.utils import unittest
from django.test.client import Client
from django.test import TestCase
from store.models import Product, Document, DocumentItem, Lot, RegistryItem, Store,\
    Receipt, WriteOff, ProductShift, on_visit_save, on_labresult_save, on_receipt_save,\
    on_writeoff_save, on_shift_save, get_save_method, stock_balance, get_product_lots,\
    get_service_products
import factory
from core.tests import UnitFactory


class StoreFactory(factory.Factory):
    FACTORY_FOR = Store

    name = factory.Sequence(lambda n: 'store{0}'.format(n))


class ProductFactory(factory.Factory):
    FACTORY_FOR = Store

    unit = factory.SubFactory(UnitFactory)
    name = factory.Sequence(lambda n: 'store{0}'.format(n))
    delivery_period = 10


class StoreUnitTest(TestCase):
    def setUp(self):
        self.unit1 = UnitFactory()
        self.prod1 = ProductFactory()
        self.prod2 = ProductFactory()
        self.prod3 = ProductFactory()
        self.store1 = StoreFactory()
        self.store2 = StoreFactory()

    def test_product_autocode(self):
        product = Product.objects.create(name='prod1', unit=self.unit1)
        # После создания продукта должен заполняться код
        self.assertEqual(product.code == '', False)

    def test_get_save_func(self):
        '''Получение функции обработки сохранения документа
           По типу документа должна вернуть соответствующую функцию
           обработки сохранения
        '''
        func = get_save_method('receipt')
        self.assertEqual(func, on_receipt_save)
        func = get_save_method('visit')
        self.assertEqual(func, on_visit_save)
        func = get_save_method('labresult')
        self.assertEqual(func, on_labresult_save)
        func = get_save_method('writeoff')
        self.assertEqual(func, on_writeoff_save)
        func = get_save_method('shift')
        self.assertEqual(func, on_shift_save)

    def test_income_product_without_lots_and_items(self):
        receipt_doc = Receipt.objects.create()
        save_method = get_save_method('receipt')
        item_list = []
        lot_list = []
        save_method(doc=receipt_doc, store=self.store1, items=item_list, lots=lot_list)
        # Должен создасться Document без DocumentItem, Lot, RegistryItem
        docs = Document.objects.filter(document=receipt_doc)
        self.assertEqual(len(docs), 1)
        doc = docs[0]
        self.assertEqual(doc.store, self.store1)
        doc_items = DocumentItem.objects.filter(document=doc)
        self.assertEqual(len(doc_items), 0)
        lots = Lot.objects.filter(document=doc)
        self.assertEqual(len(lots), 0)

    def test_income_product_without_lots(self):
        receipt_doc = Receipt.objects.create()
        save_method = get_save_method('receipt')
        item_list = [{'id': self.prod1.id, 'total_count': 10},
                     {'id': self.prod2.id, 'total_count': 30},
                     {'id': self.prod3.id, 'total_count': 15}]
        lot_list = []
        save_method(doc=receipt_doc, store=self.store1, items=item_list, lots=lot_list)
        docs = Document.objects.filter(document=receipt_doc)
        self.assertEqual(len(docs), 1)
        doc = docs[0]
        self.assertEqual(doc.store, self.store1)
        doc_items = DocumentItem.objects.filter(document=doc)
        self.assertEqual(len(doc_items), 3)
        doc_items = DocumentItem.objects.filter(document=doc, product=self.prod1)
        self.assertEqual(len(doc_items), 1)
        doc_item = doc_items[0]
        self.assertEqual(doc_item.total_count, 10)
        doc_items = DocumentItem.objects.filter(document=doc, product=self.prod2)
        self.assertEqual(len(doc_items), 1)
        doc_item = doc_items[0]
        self.assertEqual(doc_item.total_count, 30)
        doc_items = DocumentItem.objects.filter(document=doc, product=self.prod3)
        self.assertEqual(len(doc_items), 1)
        doc_item = doc_items[0]
        self.assertEqual(doc_item.total_count, 15)
        lots = Lot.objects.filter(document=doc)
        self.assertEqual(len(lots), 0)

    def test_income_product_without_items(self):
        receipt_doc = Receipt.objects.create()
        save_method = get_save_method('receipt')
        '''Пусть будет такой список лотов, без doc_item'''
        lot_list = [{'id': self.prod1.id, 'count': 3, 'number': '111'},
                    {'id': self.prod1.id, 'count': 7, 'number': '112'},
                    {'id': self.prod2.id, 'count': 10, 'number': '121'},
                    {'id': self.prod2.id, 'count': 10, 'number': '122'},
                    {'id': self.prod2.id, 'count': 5, 'number': '123'},
                    {'id': self.prod2.id, 'count': 5, 'number': '124'},
                    {'id': self.prod3.id, 'count': 4, 'number': '131'},
                    {'id': self.prod3.id, 'count': 6, 'number': '132'}]
        save_method(doc=receipt_doc, store=self.store1, lots=lot_list)
        docs = Document.objects.filter(document=receipt_doc)
        '''должен создасться только 1 документ'''
        self.assertEqual(len(docs), 1)
        doc = docs[0]
        self.assertEqual(doc.store, self.store1)
        lots = Lot.objects.filter(document=doc)
        '''проверка на количество созданных лотов'''
        self.assertEqual(len(lots), 8)
        lots = Lot.objects.filter(document=doc, product=self.prod2)
        self.assertEqual(len(lots), 4)
        lots = Lot.objects.filter(number='111')
        self.assertEqual(len(lots), 1)
        lot = lots[0]
        self.assertEqual(lot.product, self.prod1)
        self.assertEqual(lot.count, 3)
        lots = Lot.objects.filter(number='121')
        self.assertEqual(len(lots), 1)
        lot = lots[0]
        '''проверка на содержимое лота'''
        self.assertEqual(lot.product, self.prod2)
        self.assertEqual(lot.count, 10)
        '''проверка создания registry_item'''
        regs = RegistryItem.objects.filter(lot__document=doc)
        self.assertEqual(len(regs), 8)
        '''все registry_item должны быть положительными'''
        positive = True
        for reg in regs:
            if reg.count < 0:
                positive = False
        self.assertEqual(positive, True)

        regs = RegistryItem.objects.filter(lot=lot)
        self.assertEqual(len(regs), 1)
        self.assertEqual(regs[0].count, 10)

    def test_income_product(self):
        receipt_doc = Receipt.objects.create()
        save_method = get_save_method('receipt')
        item_list = [{'id': self.prod1.id, 'total_count': 10},
                     {'id': self.prod2.id, 'total_count': 30},
                     {'id': self.prod3.id, 'total_count': 15}]
        lot_list = [{'id': self.prod1.id, 'count': 3, 'number': '111'},
                    {'id': self.prod1.id, 'count': 7, 'number': '112'},
                    {'id': self.prod2.id, 'count': 10, 'number': '121'},
                    {'id': self.prod2.id, 'count': 10, 'number': '122'},
                    {'id': self.prod2.id, 'count': 5, 'number': '123'},
                    {'id': self.prod2.id, 'count': 5, 'number': '124'},
                    {'id': self.prod3.id, 'count': 4, 'number': '131'},
                    {'id': self.prod3.id, 'count': 6, 'number': '132'}]

        save_method(doc=receipt_doc, store=self.store1, items=item_list, lots=lot_list)
        docs = Document.objects.filter(document=receipt_doc)
        self.assertEqual(len(docs), 1)
        doc = docs[0]
        self.assertEqual(doc.store, self.store1)
        doc_items = DocumentItem.objects.filter(document=doc)
        self.assertEqual(len(doc_items), 3)
        doc_items = DocumentItem.objects.filter(document=doc, product=self.prod1)
        self.assertEqual(len(doc_items), 1)
        doc_item = doc_items[0]
        self.assertEqual(doc_item.total_count, 10)
        doc_items = DocumentItem.objects.filter(document=doc, product=self.prod2)
        self.assertEqual(len(doc_items), 1)
        doc_item = doc_items[0]
        self.assertEqual(doc_item.total_count, 30)
        doc_items = DocumentItem.objects.filter(document=doc, product=self.prod3)
        self.assertEqual(len(doc_items), 1)
        doc_item = doc_items[0]
        self.assertEqual(doc_item.total_count, 15)
        self.assertEqual(stock_balance(product=self.prod3), 15)
        lots = Lot.objects.filter(document=doc)
        self.assertEqual(len(lots), 0)

        lots = Lot.objects.filter(document=doc)
        '''проверка на количество созданных лотов'''
        self.assertEqual(len(lots), 8)
        lots = Lot.objects.filter(document=doc, product=self.prod2)
        self.assertEqual(len(lots), 4)
        lots = Lot.objects.filter(number='111')
        self.assertEqual(len(lots), 1)
        lot = lots[0]
        self.assertEqual(lot.product, self.prod1)
        self.assertEqual(lot.count, 3)
        lots = Lot.objects.filter(number='121')
        self.assertEqual(len(lots), 1)
        lot = lots[0]
        '''проверка на содержимое лота'''
        self.assertEqual(lot.product, self.prod2)
        self.assertEqual(lot.count, 10)
        '''проверка создания registry_item'''
        regs = RegistryItem.objects.filter(lot__document=doc)
        self.assertEqual(len(regs), 8)
        '''все registry_item должны быть положительными'''
        positive = True
        for reg in regs:
            if reg.count < 0:
                positive = False
        self.assertEqual(positive, True)
        regs = RegistryItem.objects.filter(lot=lot)
        self.assertEqual(len(regs), 1)
        self.assertEqual(regs[0].count, 10)
        '''количество продуктов во всех лотах должно быть
           равным общему количеству продукта'''
        # для prod1
        items = DocumentItem.objects.filter(document=doc, product=self.prod1)
        lots = Lot.objects.filter(document=doc, product=self.prod1)
        lot_count = sum(map(lambda x: x.count, lots))
        self.assertEqual(items[0].total_count, lot_count)
        # для prod2
        items = DocumentItem.objects.filter(document=doc, product=self.prod2)
        lots = Lot.objects.filter(document=doc, product=self.prod2)
        lot_count = sum(map(lambda x: x.count, lots))
        self.assertEqual(items[0].total_count, lot_count)
        # для prod3
        items = DocumentItem.objects.filter(document=doc, product=self.prod3)
        lots = Lot.objects.filter(document=doc, product=self.prod3)
        lot_count = sum(map(lambda x: x.count, lots))
        self.assertEqual(items[0].total_count, lot_count)

    def test_get_service_products(self):
        '''Получение списка продуктов для услуги визита либо лабораторного результата'''
        pass

    def test_outcome_product_from_visit(self):
        pass

    def test_outcome_product_from_lab_result(self):
        pass

    def test_outcome_product_from_write_off(self):
        receipt_doc = Receipt.objects.create()
        save_method = get_save_method('receipt')
        item_list = [{'id': self.prod1.id, 'total_count': 10},
                     {'id': self.prod2.id, 'total_count': 30},
                     {'id': self.prod3.id, 'total_count': 15}]
        save_method(doc=receipt_doc, store=self.store1, items=item_list)
        writeoff_doc = WriteOff.objects.create()
        products = [{'id': self.prod1.id, 'count': 5},
                    {'id': self.prod2.id, 'count': 9}]
        save_method = get_save_method('writeoff')
        save_method(document=writeoff_doc, product_list=products)
        # Допустим, каждого продукта в базе не более 1 лота
        lot_prod1 = Lot.objects.filter(product=self.prod1)
        reg_prod1 = RegistryItem.filter(lot=lot_prod1)
        self.assertEqual(reg_prod1.count, -5)
        lot_prod2 = Lot.objects.filter(product=self.prod2)
        reg_prod2 = RegistryItem.filter(lot=lot_prod2)
        self.assertEqual(reg_prod2.count, -9)

    def test_get_product_lots(self):
        '''Возвращает имеющиеся партии продуктов, содержащие необходимое количество.
        Приоритетные лоты - с минимальным оставшимся сроком годности.
        Далее по мере добавления партии на склад'''
        receipt_doc = Receipt.objects.create()
        save_method = get_save_method('receipt')
        item_list = [{'id': self.prod1.id, 'total_count': 10},
                     {'id': self.prod2.id, 'total_count': 30},
                     {'id': self.prod3.id, 'total_count': 15}]
        lot_list = [{'id': self.prod1.id, 'count': 3, 'number': '111'},
                    {'id': self.prod1.id, 'count': 7, 'number': '112', 'expire_date': 3},
                    {'id': self.prod2.id, 'count': 10, 'number': '121'},
                    {'id': self.prod2.id, 'count': 10, 'number': '122', 'expire_date': 8},
                    {'id': self.prod2.id, 'count': 5, 'number': '123'},
                    {'id': self.prod2.id, 'count': 5, 'number': '124', 'expire_date': 5},
                    {'id': self.prod3.id, 'count': 4, 'number': '131'},
                    {'id': self.prod3.id, 'count': 6, 'number': '132'}]
        save_method(doc=receipt_doc, store=self.store1, items=item_list, lots=lot_list)
        #столько же заносим в store2
        lot_list = [{'id': self.prod1.id, 'count': 3, 'number': '211'},
                    {'id': self.prod1.id, 'count': 7, 'number': '212', 'expire_date': 3},
                    {'id': self.prod2.id, 'count': 10, 'number': '221'},
                    {'id': self.prod2.id, 'count': 10, 'number': '222', 'expire_date': 8},
                    {'id': self.prod2.id, 'count': 5, 'number': '223'},
                    {'id': self.prod2.id, 'count': 5, 'number': '224', 'expire_date': 5},
                    {'id': self.prod3.id, 'count': 4, 'number': '231'},
                    {'id': self.prod3.id, 'count': 6, 'number': '232'}]
        save_method(doc=receipt_doc, store=self.store2, items=item_list, lots=lot_list)
        lot111 = Lot.objects.get(number='111', product=self.prod1)
        lot112 = Lot.objects.get(number='112', product=self.prod1)
        lot121 = Lot.objects.get(number='121', product=self.prod2)
        lot122 = Lot.objects.get(number='122', product=self.prod2)
        lot123 = Lot.objects.get(number='123', product=self.prod2)
        lot124 = Lot.objects.get(number='124', product=self.prod2)
        # lot131 = Lot.objects.get(number='131', product=self.prod3)
        # lot132 = Lot.objects.get(number='132', product=self.prod3)
        lot211 = Lot.objects.get(number='211', product=self.prod1)
        lot212 = Lot.objects.get(number='212', product=self.prod1)
        lot221 = Lot.objects.get(number='221', product=self.prod2)
        lot222 = Lot.objects.get(number='222', product=self.prod2)
        lot223 = Lot.objects.get(number='223', product=self.prod2)
        lot224 = Lot.objects.get(number='224', product=self.prod2)
        lot231 = Lot.objects.get(number='231', product=self.prod3)
        lot232 = Lot.objects.get(number='232', product=self.prod3)

        lots = get_product_lots(product=self.prod1, count=2)
        self.assertEqual(lots, [{'lot': lot112, 'count': 2}])

        lots = get_product_lots(product=self.prod1, count=18)
        self.assertEqual(lots, [{'lot': lot112, 'count': 7},
                                {'lot': lot212, 'count': 7},
                                {'lot': lot111, 'count': 3},
                                {'lot': lot211, 'count': 1}])

        lots = get_product_lots(product=self.prod2, count=26, store=self.store1)
        self.assertEqual(lots, [{'lot': lot124, 'count': 5},
                                {'lot': lot122, 'count': 10},
                                {'lot': lot121, 'count': 10},
                                {'lot': lot123, 'count': 1}])

        lots = get_product_lots(product=self.prod2, count=26, store=self.store2)
        self.assertEqual(lots, [{'lot': lot224, 'count': 5},
                                {'lot': lot222, 'count': 10},
                                {'lot': lot221, 'count': 10},
                                {'lot': lot223, 'count': 1}])

        #Провека того, что неуказанные лоты создаются автоматически
        lots = get_product_lots(product=self.prod3, count=15, store=self.store2)
        l = Lot.objects.get(product=self.prod3, count=5, document__store=self.store2)
        self.assertEqual(lots, [{'lot': lot231, 'count': 4},
                                {'lot': lot232, 'count': 6},
                                {'lot': l, 'count': 5}])

        # Если достаточного количества продуктов на складах нет,
        # должна вернуться ошибка
        with self.assertRaises(ValueError):
            get_product_lots(product=self.prod1, count=21)
            get_product_lots(product=self.prod2, count=61)
            get_product_lots(product=self.prod3, count=31)
            get_product_lots(product=self.prod3, count=16, store=self.store2)

    def test_shift(self):
        # Внесем продукты в store1
        receipt_doc = Receipt.objects.create()
        save_method = get_save_method('receipt')
        item_list = [{'id': self.prod1.id, 'total_count': 10},
                     {'id': self.prod2.id, 'total_count': 30},
                     {'id': self.prod3.id, 'total_count': 15}]
        lot_list = [{'id': self.prod1.id, 'count': 3, 'number': '111'},
                    {'id': self.prod1.id, 'count': 7, 'number': '112'},
                    {'id': self.prod2.id, 'count': 10, 'number': '121'},
                    {'id': self.prod2.id, 'count': 10, 'number': '122'},
                    {'id': self.prod2.id, 'count': 5, 'number': '123'},
                    {'id': self.prod2.id, 'count': 5, 'number': '124'},
                    {'id': self.prod3.id, 'count': 4, 'number': '131'},
                    {'id': self.prod3.id, 'count': 6, 'number': '132'}]

        save_method(doc=receipt_doc, store=self.store1, items=item_list, lots=lot_list)
        #Сделаем перемещение из store1 в store2
        shift_doc = ProductShift.objects.create(store_to=self.store2)
        products = [{'id': self.prod1.id, 'count': 5},
                    {'id': self.prod2.id, 'count': 9}]
        save_method = get_save_method('shift')
        save_method(document=shift_doc, product_list=products, store=self.store1)
        # Теперь эти продукты должны быть в store2, а в store1 продуктов должно быть меньше
        p1_count_store1 = stock_balance(product=self.prod1, store=self.store1)
        p1_count_store2 = stock_balance(product=self.prod1, store=self.store2)
        p2_count_store1 = stock_balance(product=self.prod2, store=self.store1)
        p2_count_store2 = stock_balance(product=self.prod2, store=self.store2)
        self.assertEqual(p1_count_store1, 5)
        self.assertEqual(p1_count_store2, 5)
        self.assertEqual(p2_count_store1, 21)
        self.assertEqual(p2_count_store2, 9)

    def test_diff_lot(self):
        '''Тестирование возможности списания продукта с разных партий'''
        # Вносим первоначальные данные
        receipt_doc = Receipt.objects.create()
        save_method = get_save_method('receipt')
        item_list = [{'id': self.prod1.id, 'total_count': 10},
                     {'id': self.prod2.id, 'total_count': 30},
                     {'id': self.prod3.id, 'total_count': 15}]
        lot_list = [{'id': self.prod1.id, 'count': 3, 'number': '111'},
                    {'id': self.prod1.id, 'count': 7, 'number': '112'},
                    {'id': self.prod2.id, 'count': 10, 'number': '121', 'expire_date': 10},
                    {'id': self.prod2.id, 'count': 10, 'number': '122'},
                    {'id': self.prod2.id, 'count': 5, 'number': '123'},
                    {'id': self.prod2.id, 'count': 5, 'number': '124', 'expire_date': 5},
                    {'id': self.prod3.id, 'count': 4, 'number': '131'},
                    {'id': self.prod3.id, 'count': 6, 'number': '132'}]
        save_method(doc=receipt_doc, store=self.store1, items=item_list, lots=lot_list)
        writeoff_doc = WriteOff.objects.create()
        products = [{'id': self.prod1.id, 'count': 5},
                    {'id': self.prod2.id, 'count': 9}]
        save_method = get_save_method('writeoff')
        save_method(document=writeoff_doc, product_list=products)
        self.assertEqual(stock_balance(product=self.prod1), 5)
        self.assertEqual(stock_balance(product=self.prod2), 21)
