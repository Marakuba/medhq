# -*- coding: utf-8 -*-

from webapp.base import BaseWebApp, register


@register('cardlabordergrid')
class CardLabOrderGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/lab/models.js',
        'app/lab/card/LabOrderGrid.js',
    ]


@register('resultapp')
class ResultApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/lab/resultapp/ResultGrid.js',
        'app/lab/resultapp/ResultApp.js',
    ]


@register('invoicegrid')
class InvoiceGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/invoice/models.js',
        'app/invoice/InvoiceForm.js',
        'app/invoice/InvoiceGrid.js',
        'app/invoice/InvoiceItemGrid.js',
        'app/invoice/InvoiceTab.js'
    ]


@register('samplingeditor')
class SamplingEditorApp(BaseWebApp):

    js = [
        'app/lab/sampling/TubeTree.js',
        'app/lab/sampling/TubeWindow.js',
        'app/lab/sampling/FreeGrid.js',
        'app/lab/sampling/ServiceGrid.js',
        'app/lab/sampling/Editor.js',
    ]


@register('labboard')
class LabBoardApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'libs/growl/js/ext/ux/Growl.js',
        'app/lab/models.js',
        'app/lab/fields/InputList.js',
        'app/lab/search/SearchWindow.js',
        'app/lab/result/widget/BaseColumn.js',
        'app/lab/result/widget/BasePlain.js',
        'app/lab/result/ResultCard.js',
        'app/lab/laborder/LabOrderGrid.js',
        'app/lab/laborder/LabBoard.js',
    ]
    css = {
        'all': [
            'libs/growl/css/ext/ux/Growl.css',
        ]
    }
    depends_on = ['barcodepackage', ]


@register('investigationgrid')
class InvestigationgridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/lab/models.js',
        'app/lab/investigation/InvestigationGrid.js',
    ]


@register('labregisterapp')
class LabRegisterApp(BaseWebApp):

    verbose_name = u'Реестр тестов'
    cmp_type = 'action'
    js = [
        'app/lab/register/RegisterApp.js',
    ]


@register('samplescanner')
class SampleScannerApp(BaseWebApp):

    verbose_name = u'Проверка образца'
    cmp_type = 'action'
    js = [
        'app/lab/scanner/ScannerWindow.js',
    ]


@register('equipmenttaskgrid')
class EquipmentTaskGridApp(BaseWebApp):

    verbose_name = u'Задания'
    cmp_type = 'action'
    js = [
        'app/lab/equipment/EquipmentTaskGrid.js',
    ]


@register('equipmentassaygrid')
class EquipmentAssayGridApp(BaseWebApp):

    verbose_name = u'Исследования'
    cmp_type = 'action'
    js = [
        'app/lab/equipment/EquipmentAssayGrid.js',
    ]


@register('equipmentgrid')
class EquipmentGridApp(BaseWebApp):

    verbose_name = u'Анализаторы'
    cmp_type = 'action'
    js = [
        'app/lab/equipment/EquipmentGrid.js',
    ]


@register('labresultloaderapp')
class ResultLoaderApp(BaseWebApp):

    verbose_name = u'Загрузка результатов'
    cmp_type = 'action'
    js = [
        'app/lab/result/loader/ResultLoaderApp.js',
    ]


@register('analysiseditorapp')
class AnalysisEditorApp(BaseWebApp):

    verbose_name = u'Редактор тестов'
    cmp_type = 'action'
    js = [
        'extjs/ux/MultiSelect.js',
        'extjs/ux/ItemSelector.js',
        'libs/underscore-min.js',
        'app/lab/models.js',
        'app/lab/analysiseditor/AnalysisEditorApp.js',
        'app/lab/analysiseditor/RefRangeChangeForm.js',
        'app/lab/analysiseditor/InputListChangeForm.js',
        'app/lab/analysiseditor/AnalysisProfileGrid.js',
    ]
    css = {
        'all': [
            'extjs/ux/css/MultiSelect.css',
        ]
    }
    depends_on = ['service-panel', 'webapp3', ]


@register('labemailtaskgrid')
class LabEmailTaskApp(BaseWebApp):

    verbose_name = u'Отправка email'
    cmp_type = 'action'
    js = [
        'libs/growl/js/ext/ux/Growl.js',
        'app/lab/email/EmailHistoryGrid.js',
        'app/lab/email/EmailHistoryWindow.js',
        'app/lab/email/EmailTaskGrid.js',
    ]
    css = {
        'all': [
            'libs/growl/css/ext/ux/Growl.css',
        ]
    }
