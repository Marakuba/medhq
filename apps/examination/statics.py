# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('examordergrid')
class ExamOrderGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/data/RestStore.js',
        'app/form/ClearableComboBox.js',
        'app/form/LazyComboBox.js',
        'app/ux/GSearchField.js',
        'app/ux/InputTextMask.js',

        'app/examination/models.js',

        'app/examination/examorder/ExamOrderGrid.js',
    ]
    depends_on = ['webapp3', ]
