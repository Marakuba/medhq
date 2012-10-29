# -*- coding: utf-8 -*-

"""
    
"""
from django.core.management.base import BaseCommand
from examination.models import CardTemplate, ExaminationCard,\
    Card, Template, FieldSet
import simplejson
from assistant.models import ExamAssistant
from visit.models import OrderedService
from django.db import transaction

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        serv = OrderedService.objects.all()
        print "Выбираем уникальные старые новые карты осмотра..."
        orders_without_ecard = []  # #[p for p in serv if len(p.card_set.all()) > len(p.examinationcard_set.all())]
        
        new_cards = []
        for o in orders_without_ecard:
            new_cards += o.card_set.all()
        print "Было %s уникальных старых новых карт осмотра " % len(new_cards)
            
        new_tpls = Template.objects.all()
        print "Было %s старых новых шаблонов " % len(new_tpls)
        
        print "Конвертируем аттрибуты старых новых карт..."
        attrs_from_newcard = [new_to_new(card) for card in new_cards]
        
        print "Конвертируем аттрибуты старых новых шаблонов..."
        attrs_from_newtpl = [new_to_new(tpl) for tpl in new_tpls]
#        
        print "Удаляем новые карты осмотра..."
        Card.objects.all().delete()
        
        print "Удаляем новые шаблоны..."
        Template.objects.all().delete()
        
        print "Конвертируем старые карты осмотра и шаблоны..."
        count = []
        for models in [[CardTemplate,Template],[ExaminationCard,Card]]:
            err_count = 0
            added_count = 0
            objects = models[0].objects.all()
            print "Было %s %s " % (len(objects),models[1]._meta.object_name)
            with transaction.commit_manually():
                for obj in objects:
                    try:
                        attributes = get_attributes(obj)
                        new_obj = models[1].objects.create(**attributes)
                        if hasattr(obj,'assistant') and getattr(obj,'assistant'):
                            ExamAssistant.objects.create(assistant =  obj.assistant, card = new_obj)
                        if hasattr(obj,'created'):
                            new_obj.created = attributes['created']
                            new_obj.save()
                        added_count += 1
                    except Exception, err:
                        transaction.rollback()
                        err_count += 1
                        print 'Error! %s %s %s' % (err_count, models[1]._meta.object_name,obj.__unicode__())
                        print err
                        return
                    else:
                        transaction.commit()

            count.append(added_count)
                    
        print 'Converted %s card(s)' % (count[0])
        print 'Converted %s template(s)' % (count[1])
        
        print "Создаем недостающие новые карты осмотра..."
        for attrs in attrs_from_newcard:
            try:
                card = Card.objects.create(**attrs)
                if hasattr(card,'assistant') and getattr(card,'assistant'):
                        ExamAssistant.objects.create(assistant =  card.assistant, card = card)
            except Exception, err:
                print "Не удалось сконвертировать старую новую карту %s order %s" % (attrs['name'],attrs['ordered_service'])
                print err
                
        print "Создаем старые новые шаблоны"
        for attrs in attrs_from_newtpl:
            try:
                tpl = Template.objects.create(**attrs)
            except:
                print "Не удалось сконвертировать старый новый шаблон %s" % (attrs['name'])
                
        print "Конвертация завершена."
                
                
def make_ticket(xtype='textticket',
                title='',
                value='',
                section='anamnesis',
                required=False,
                fixed=False,
                unique=False,
                printable=True,
                private=False,
                title_print=True):
    
    try:
        Fsection = FieldSet.objects.get(name=section)
        order = Fsection.order
    except:
        order = 10000
    
    ticket = {
        'xtype':xtype,
        'printable':printable,
        'private':private,
        'title':title,
        'title_print':title_print,
        'value':value,
        'required':required,
        'unique':unique,
        'section':section,
        'order':order
    }
    return ticket
    
def convert_data(obj):
    data = {'tickets':[]}
    
#            print_name
    ttl = obj.print_name or obj.name
    if not ttl and hasattr(obj, 'ordered_service'):
        ttl = obj.ordered_service.service.name
    ticket = make_ticket(xtype='titleticket',
                         value=ttl,
                         section='name',
                         unique=True,
                         required=True,
                         fixed=True)
    data['tickets'].append(ticket)
    
    if hasattr(obj, 'equipment') and getattr(obj, 'equipment'):
        rend = [u"<strong>Выполнено на оборудовании:</strong> %s" % obj.equipment.name, ]
        if obj.area:
            rend.append(u"<strong>Область исследованияя:</strong> %s" % obj.area)
        if obj.scan_mode:
            rend.append(u"<strong>Режим сканирования:</strong> %s" % obj.scan_mode)
        if obj.thickness:
            rend.append(u"<strong>Толщина реконструктивного среза:</strong> %s" % obj.thickness)
        if obj.width:
            rend.append(u"<strong>Ширина/шаг, мм:</strong> %s" % obj.width)
        if obj.contrast_enhancement:
            rend.append(u"<strong>Контрастное усиление:</strong> %s" % obj.contrast_enhancement)
        value = {
                    '_raw': {
                        'equipment': obj.equipment.name,
                        'area': obj.area,
                        'scan_mode': obj.scan_mode,
                        'thickness': obj.thickness,
                        'width': obj.width,
                        'contrast_enhancement': obj.contrast_enhancement
                    },
                    '_code': {

                    },
                    '_rendered': "<br>".join(rend)
                 }
        ticket = make_ticket(
                             xtype='equipticket',
                             value=value,
                             section='equipment',
                             title='Выполнено на оборудовании')
        data['tickets'].append(ticket)

    if hasattr(obj,'complaints') and getattr(obj,'complaints'):
        ticket = make_ticket(
                             value=obj.complaints, 
                             section = 'complaints',
                             title='Жалобы')
        data['tickets'].append(ticket)
        
    if hasattr(obj,'anamnesis') and getattr(obj,'anamnesis'):
        ticket = make_ticket(
                             value=obj.anamnesis, 
                             section = 'anamnesis',
                             title='Анамнез')
        data['tickets'].append(ticket) 
        
    if hasattr(obj,'objective_data') and getattr(obj,'objective_data'):
        ticket = make_ticket(
                             value=obj.objective_data, 
                             section = 'status',
                             title='Объективные данные',
                             title_print=False)
        data['tickets'].append(ticket)
        
    if hasattr(obj,'psycho_status') and getattr(obj,'psycho_status'):
        ticket = make_ticket(
                             value=obj.psycho_status, 
                             section = 'status',
                             title='Психологический статус')
        data['tickets'].append(ticket)  
        
    if hasattr(obj,'gen_diag') and getattr(obj,'gen_diag'):
        ticket = make_ticket(
                             value=obj.gen_diag, 
                             section = 'diagnosis',
                             title='Основной диагноз')
        data['tickets'].append(ticket) 
        
    if hasattr(obj,'complication') and getattr(obj,'complication'):
        ticket = make_ticket(
                             value=obj.complication, 
                             section = 'complication',
                             title='Осложнения')
        data['tickets'].append(ticket) 
        
    if hasattr(obj,'ekg') and getattr(obj,'ekg'):
        ticket = make_ticket(
                             value=obj.ekg, 
                             section = 'ecg',
                             title='ЭКГ')
        data['tickets'].append(ticket) 
        
    if hasattr(obj,'mbk_diag') and getattr(obj,'mbk_diag'):
        value = {
                    '_resource_uri': '/api/v1/dashboard/icd10/%s' % obj.mbk_diag.id,
                    '_name': obj.mbk_diag.__unicode__(),
                    '_rendered': u'<div>%s</div>' % obj.mbk_diag.name
                }
        ticket = make_ticket(
                             xtype='icdticket',
                             value=value,
                             section='diagnosis',
                             title='Диагноз МКБ')
        data['tickets'].append(ticket)


    if hasattr(obj,'concomitant_diag') and getattr(obj,'concomitant_diag'):
        ticket = make_ticket(
                             value=obj.concomitant_diag, 
                             section = 'diagnosis',
                             title='Сопутствующий диагноз')
        data['tickets'].append(ticket) 
        
    if hasattr(obj,'clinical_diag') and getattr(obj,'clinical_diag'):
        ticket = make_ticket(
                             value=obj.clinical_diag, 
                             section = 'diagnosis',
                             title='Клинический диагноз')
        data['tickets'].append(ticket) 
        
    if hasattr(obj,'treatment') and getattr(obj,'treatment'):
        ticket = make_ticket(
                             value=obj.treatment, 
                             section = 'conclusion',
                             title='Лечение')
        data['tickets'].append(ticket)
        
    if hasattr(obj,'referral') and getattr(obj,'referral'):
        ticket = make_ticket(
                             value=obj.referral, 
                             section = 'conclusion',
                             title='Направление')
        data['tickets'].append(ticket)
        
    if hasattr(obj,'conclusion') and getattr(obj,'conclusion'):
        ticket = make_ticket(
                             value=obj.conclusion, 
                             section = 'conclusion',
                             title='Заключение')
        data['tickets'].append(ticket)
        
    if hasattr(obj,'disease') and getattr(obj,'disease'):
        ticket = make_ticket(
                             value=obj.disease, 
                             section = 'anamnesis',
                             title='Характер заболевания')
        data['tickets'].append(ticket)
        
    if hasattr(obj,'history') and getattr(obj,'history'):
        ticket = make_ticket(
                             value=obj.history, 
                             section = 'anamnesis',
                             title='История заболевания')
        data['tickets'].append(ticket) 
        
    if hasattr(obj,'extra_service') and getattr(obj,'extra_service'):
        ticket = make_ticket(
                             value=obj.extra_service, 
                             section = 'other',
                             title='Дополнительные услуги')
        data['tickets'].append(ticket) 
    for i,d in enumerate(data['tickets']):
        d['pos'] = i
    return data
        
#        Переводит аттрибуты старого объекта в аттрибуты нового
def get_attributes(obj):
    attrs = {}
    data = simplejson.dumps(convert_data(obj))
    attrs['data'] = data
    if hasattr(obj,'created') and getattr(obj,'created'):
        attrs['created'] = obj.created
    if hasattr(obj,'modified') and getattr(obj,'modified'):
        attrs['modified'] = obj.modified
    if hasattr(obj,'print_date') and getattr(obj,'print_date'):
        attrs['print_date'] = obj.print_date
    attrs['name'] = obj.name or obj.print_name
    if hasattr(obj,'ordered_service') and getattr(obj,'ordered_service'):
        attrs['ordered_service'] = obj.ordered_service
        if not attrs['name']:
            attrs['name'] = obj.ordered_service.service.name
    if hasattr(obj,'staff') and getattr(obj,'staff'):
        attrs['staff'] = obj.staff and obj.staff.staff
    return attrs

#        Конвертирует данные старой новой карты(сконвертированной уже однажды когда-то) в данные новой карты
def convert_new_data(obj):
    
    old_data = simplejson.loads(obj.data or '[]') or []
    new_data = {'tickets':[{
                'xtype':'textticket',
                'section':'section' in section.keys() and section['section'] or '',
                'title':'title' in ticket.keys() and ticket['title'] or '',
                'printable':'printable' in ticket.keys() and ticket['printable'] or '',
                'private':'private' in ticket.keys() and ticket['private'] or '',
                'pos':'pos' in ticket.keys() and ticket['pos'] or 0,
                'value':'text' in ticket.keys() and ticket['text'] or ''
                } for section in old_data for ticket in section['tickets']]
    }
    if hasattr(obj,'mbk_diag') and getattr(obj,'mbk_diag'):
        value = {
                    '_resource_uri': '/api/v1/dashboard/icd10%s' % obj.mkb_diag.id,
                    '_name': obj.mkb_diag.name,
                    '_rendered': u'<div>%s</div>' % obj.mbk_diag.name
                }
        ticket = make_ticket(
                             xtype='icdticket',
                             value=value,
                             section='diagnosis',
                             title='Диагноз МКБ')
        new_data['tickets'].append(ticket)

    if hasattr(obj, 'equipment') and getattr(obj, 'equipment'):
        rend = [u"<strong>Выполнено на оборудовании:</strong> %s" % obj.equipment.name, ]
        if obj.area:
            rend.append(u"<strong>Область исследованияя:</strong> %s" % obj.area)
        if obj.scan_mode:
            rend.append(u"<strong>Режим сканирования:</strong> %s" % obj.scan_mode)
        if obj.thickness:
            rend.append(u"<strong>Толщина реконструктивного среза:</strong> %s" % obj.thickness)
        if obj.width:
            rend.append(u"<strong>Ширина/шаг, мм:</strong> %s" % obj.width)
        if obj.contrast_enhancement:
            rend.append(u"<strong>Контрастное усиление:</strong> %s" % obj.contrast_enhancement)
        value = {
                    '_raw': {
                        'equipment': obj.equipment.name,
                        'area': obj.area,
                        'scan_mode': obj.scan_mode,
                        'thickness': obj.thickness,
                        'width': obj.width,
                        'contrast_enhancement': obj.contrast_enhancement
                    },
                    '_code': {

                    },
                    '_rendered': "<br>".join(rend)

                 }
        ticket = make_ticket(
                             xtype='equipticket',
                             value=value,
                             section='equipment',
                             title='Выполнено на оборудовании')
        new_data['tickets'].append(ticket)
    return new_data

def new_to_new(obj):
    attrs = {}
    data = simplejson.dumps(convert_new_data(obj))
    attrs['data'] = data
    attrs['created'] = obj.created
    attrs['modified'] = obj.modified
    if hasattr(obj,'print_date') and getattr(obj,'print_date'):
        attrs['print_date'] = obj.print_date
    attrs['name'] = obj.name or obj.print_name
    if hasattr(obj,'ordered_service') and getattr(obj,'ordered_service'):
        attrs['ordered_service'] = obj.ordered_service
    return attrs