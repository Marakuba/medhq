# -*- coding: utf-8 -*-

import simplejson
try:
    from collections import OrderedDict
except:
    from ordereddict import OrderedDict

from webapp.base import BaseWebApp, register
from .models import FieldSet, SubSection, Questionnaire
from .widgets import get_widget


@register('examordergrid')
class ExamOrderGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'libs/tiny_mce/tiny_mce.js',
        'libs/tiny_mce/langs/ru.js',
        'libs/tiny_mce/themes/advanced/editor_template.js',
        'libs/tiny_mce/themes/advanced/langs/ru.js',
        'libs/tiny_mce/plugins/pagebreak/editor_plugin.js',
        'libs/tiny_mce/plugins/style/editor_plugin.js',
        'libs/tiny_mce/plugins/layer/editor_plugin.js',
        'libs/tiny_mce/plugins/table/editor_plugin.js',
        'libs/tiny_mce/plugins/advhr/editor_plugin.js',
        'libs/tiny_mce/plugins/advimage/editor_plugin.js',
        'libs/tiny_mce/plugins/advlink/editor_plugin.js',
        'libs/tiny_mce/plugins/media/editor_plugin.js',
        'libs/tiny_mce/plugins/emotions/editor_plugin.js',
        'libs/tiny_mce/plugins/iespell/editor_plugin.js',
        'libs/tiny_mce/plugins/insertdatetime/editor_plugin.js',
        'libs/tiny_mce/plugins/preview/editor_plugin.js',
        'libs/tiny_mce/plugins/searchreplace/editor_plugin.js',
        'libs/tiny_mce/plugins/print/editor_plugin.js',
        'libs/tiny_mce/plugins/paste/editor_plugin.js',
        'libs/tiny_mce/plugins/directionality/editor_plugin.js',
        'libs/tiny_mce/plugins/noneditable/editor_plugin.js',
        'libs/tiny_mce/plugins/visualchars/editor_plugin.js',
        'libs/tiny_mce/plugins/nonbreaking/editor_plugin.js',
        'libs/tiny_mce/plugins/xhtmlxtras/editor_plugin.js',
        'libs/tiny_mce/plugins/template/editor_plugin.js',
        'libs/tiny_mce/themes/advanced/langs/ru.js',
        'libs/Ext.ux.TinyMCE.min.js',

        'app/data/RestStore.js',
        'app/form/ClearableComboBox.js',
        'app/form/LazyComboBox.js',
        'app/ux/InputTextMask.js',
        'app/ux/GSearchField.js',

        'app/examination/models.js',
        'app/scheduler/models.js',

        'app/examination/patient/PatientHistoryTreeGrid.js',
        'app/examination/patient/PatientHistoryPanel.js',
        'app/examination/patient/PatientHistory.js',

        'app/examination/startpanel/StartView.js',
        'app/examination/startpanel/StartPanel.js',
        'app/examination/startpanel/CardStartPanel.js',
        'app/examination/startpanel/TemplateStartPanel.js',

        'app/examination/questionnaire/QuestEditor.js',
        'app/examination/questionnaire/QuestPreviewPanel.js',
        'app/examination/questionnaire/QuestApp.js',

        'app/examination/tickets/Ticket.js',

        'app/examination/tickets/text/TextTicket.js',
        'app/examination/tickets/text/TextTicketEditor.js',

        'app/examination/tickets/title/TitleTicket.js',

        'app/examination/tickets/icd/IcdTicket.js',
        'app/examination/tickets/icd/IcdTicketEditor.js',

        'app/examination/tickets/asgmt/AsgmtTicket.js',
        'app/examination/tickets/asgmt/PreorderInlineGrid.js',
        'app/examination/tickets/asgmt/AsgmtTicketEditor.js',

        'app/examination/tickets/questionnaire/QuestionnaireTicketEditor.js',

        'app/examination/tickets/TicketTab.js',
        'app/examination/cards/CardTicketTab.js',
        'app/examination/templates/TplTicketTab.js',

        'app/examination/cards/CardApp.js',

        'app/examination/examorder/ExamOrderGrid.js',
    ]

    css = {
        'all': [
            'app/examination/css/examination.css',
        ]
    }

    depends_on = ['webapp3', 'glossaryeditor', ]

    def options(self, *args, **kwargs):
        request = kwargs['request']
        section_scheme = OrderedDict()
        sections = FieldSet.objects.all()
        required_tickets = []
        for sec in sections:
            subsecs = SubSection.objects.filter(section=sec.id)
            section_scheme[sec.name] = {
                'order': sec.order,
                'title': sec.title,
                'name': sec.name,
                'items': []
            }
            for subsec in subsecs:
                widget = get_widget(subsec.widget)(request, subsec.title, '')
                ticket = {
                    'title': subsec.title,
                    'order': sec.order,
                    'xtype': subsec.widget,
                    'value': '',
                    'printable': True,
                    'title_print': True,
                    'private': False,
                    'section': sec.name,
                    'fixed': getattr(widget, 'fixed', False),
                    'required': getattr(widget, 'required', False),
                    'unique': getattr(widget, 'unique', False)
                }
                if ticket['required']:
                    required_tickets.append(ticket)
                else:
                    section_scheme[sec.name]['items'].append(ticket)
        quests = Questionnaire.objects.all()
        questionnaires = [{'name':quest.name,
                          'code':quest.code
                          } for quest in quests]
        return {
            'section_scheme': simplejson.dumps(section_scheme),
            'questionnaires': simplejson.dumps(questionnaires),
            'required_tickets': simplejson.dumps(required_tickets)
        }


@register('glossaryeditor')
class GlossayEditorApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/ux/remotetree/js/Ext.ux.form.ThemeCombo.js',
        'app/ux/remotetree/js/Ext.ux.HttpProvider.js',
        'app/ux/remotetree/js/Ext.ux.IconMenu.js',
        'app/ux/remotetree/js/Ext.ux.menu.IconMenu.js',
        'app/ux/remotetree/js/Ext.ux.ThemeCombo.js',
        'app/ux/remotetree/js/Ext.ux.Toast.js',
        'app/ux/remotetree/js/Ext.ux.tree.RemoteTreePanel.js',
        'app/ux/remotetree/js/Ext.ux.tree.TreeFilterX.js',
        'app/ux/remotetree/js/WebPage.js',

        'app/ux/DropDownList.js',

        'app/examination/glossary/EditNodeWindow.js',
        'app/examination/glossary/XGlossaryTree.js',
        'app/examination/glossary/GlossaryTree.js',
        'app/examination/glossary/GlossaryPanel.js',
        'app/examination/glossary/GlossaryEditor.js',
    ]


@register('conclusionapp')
class ConclusionApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/examination/cards/CardGrid.js',
        'app/examination/conclusion/ConclApp.js',
    ]


@register('templateapp')
class TemplateApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/examination/templates/TemplateApp.js',
    ]
    depends_on = ['service-panel', ]


@register('stafftemplates')
class StaffTemplatesApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/examination/templates/TmpGrid.js',
        'app/examination/templates/StaffTemplates.js',
    ]


@register('trashapp')
class TrashApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/examination/cards/CardGrid.js',
        'app/examination/templates/TmpGrid.js',
        'app/examination/trash/TrashApp.js',
    ]


@register('cardexamgrid')
class CardExamGridApp(BaseWebApp):

    cmp_type = 'action'
    js = [
        'app/examination/models.js',
        'app/examination/patient/card/ExamCardGrid.js',
    ]
