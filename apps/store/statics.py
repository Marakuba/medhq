# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('productmanager')
class StoreApp(BaseWebApp):

    cmp_type = 'action'
    verbose_name = u'Управление материалами'
    js = [
        'app/ux/GSearchField.js',
        'app/ux/remotetree/js/Ext.ux.tree.TreeFilterX.js',
        'app/store/models.js',
        'app/choices/unit/UnitChoiceGrid.js',
        'app/choices/unit/UnitChoiceWindow.js',
        'app/store/productmanager/ProductTree.js',
        'app/store/productmanager/ProductForm.js',
        'app/store/productmanager/SelectedItemGrid.js',
        'app/store/productmanager/ProductManager.js',
        'app/store/ProductApp.js',
    ]
    depends_on = ['webapp3', ]
