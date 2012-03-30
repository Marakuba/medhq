# -*- coding: utf-8 -*-
from django.db import models, transaction
from django.utils.encoding import smart_unicode
from core.models import make_operator_object
import datetime
from django.core.exceptions import ObjectDoesNotExist
from visit.models import OrderedService
from staff.models import Position, Staff
from service.models import ICD10, BaseService
from django.conf import settings
from mptt.models import MPTTModel

import Image
import simplejson

SECTIONS = (
    (u'anamnesis',u'УЗИ'),
    (u'к',u'Консультация'),
    (u'п',u'Процедурный кабинет'),
    (u'д',u'Другое'),
)

class Equipment(models.Model):
    """
    """
    name = models.CharField(u'Название', max_length=300)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'оборудование'
        verbose_name_plural = u'оборудование'
    

class TemplateGroup(models.Model):
    """
    Шаблон карты обследования
    """
    name = models.TextField(u'Наименование', null=True, blank=True)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'Группа шаблонов'
        verbose_name_plural = u'Группы шаблонов'


class CardTemplate(models.Model):
    """
    Шаблон карты обследования
    """
    staff = models.ForeignKey(Position, null=True, blank=True, verbose_name=u'Врач')
    name = models.TextField(u'Рабочее наименование', null=True, blank=True)
    print_name = models.TextField(u'Заголовок для печати', null=True, blank=True)
    complaints = models.TextField(u'Жалобы', null=True, blank=True)
    anamnesis = models.TextField(u'Анамнез', null=True, blank=True)
    objective_data = models.TextField(u'Объективные данные', null=True, blank=True)
    psycho_status = models.TextField(u'Психологический статус', null=True, blank=True)
    gen_diag = models.TextField(u'Основной диагноз', null=True, blank=True)
    complication = models.TextField(u'Осложнения', null=True, blank=True)
    ekg = models.TextField(u'ЭКГ', null=True, blank=True)
    mbk_diag = models.ForeignKey(ICD10, null=True, blank=True)
    concomitant_diag= models.TextField(u'Сопутствующий диагноз', null=True, blank=True)
    clinical_diag = models.TextField(u'Клинический диагноз', null=True, blank=True)
    treatment = models.TextField(u'Лечение', null=True, blank=True)
    referral = models.TextField(u'Направление', null=True, blank=True)
    conclusion = models.TextField(u'Заключение', null=True, blank=True)
    group = models.ForeignKey(TemplateGroup, null=True, blank=True)
    equipment = models.ForeignKey(Equipment, verbose_name=u'Оборудование', null=True, blank=True)
    area = models.TextField(u'Область исследования', null=True, blank=True)
    scan_mode = models.TextField(u'Режим сканирования', null=True, blank=True)
    thickness = models.TextField(u'Толщина реконструктивного среза', null=True, blank=True)
    width = models.TextField(u'ширина/шаг', null=True, blank=True)
    contrast_enhancement = models.TextField(u'Контрастное усиление', null=True, blank=True)
    
    def __unicode__(self):
        return self.name
    
    class Meta:
        verbose_name = u'Шаблон карты осмотра'
        verbose_name_plural = u'Шаблоны карты осмотра'
        ordering = ('group','staff','name')

        
class ExaminationCard(models.Model):
    """
    Карта обследования
    """
    name = models.TextField(u'Рабочее наименование', null=True, blank=True)
    print_name = models.TextField(u'Заголовок для печати', null=True, blank=True)
    created = models.DateTimeField(u'Дата создания', auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    print_date = models.DateTimeField(u'Время печати', blank=True, null=True)
    ordered_service = models.ForeignKey(OrderedService,blank=True, null=True)
    disease = models.TextField(u'Характер заболевания', null=True, blank=True)
    complaints = models.TextField(u'Жалобы', null=True, blank=True)
    history = models.TextField(u'История настоящего заболевания', null=True, blank=True)
    anamnesis = models.TextField(u'Анамнез', null=True, blank=True)
    objective_data = models.TextField(u'Объективные данные', null=True, blank=True)
    psycho_status = models.TextField(u'Психологический/неврологический статус', null=True, blank=True)
    gen_diag = models.TextField(u'Основной диагноз', null=True, blank=True)
    mbk_diag = models.ForeignKey(ICD10, null=True, blank=True, related_name='mkb')
    diagnosis = models.TextField(u'Диагноз', null=True, blank=True)
    icd = models.ForeignKey(ICD10, null=True, blank=True)
    complication= models.TextField(u'Осложнения', null=True, blank=True)
    ekg = models.TextField(u'ЭКГ', null=True, blank=True)
    concomitant_diag= models.TextField(u'Сопутствующий диагноз', null=True, blank=True)
    clinical_diag = models.TextField(u'Клинический диагноз', null=True, blank=True)
    treatment = models.TextField(u'Лечение', null=True, blank=True)
    referral = models.TextField(u'Направление', null=True, blank=True)
    extra_service = models.TextField(u'Дополнительные услуги', null=True, blank=True)
    conclusion = models.TextField(u'Заключение', null=True, blank=True)
    comment = models.TextField(u'Примечание', null=True, blank=True)
    equipment = models.ForeignKey(Equipment, verbose_name=u'Оборудование', null=True, blank=True)
    area = models.TextField(u'Область исследования', null=True, blank=True)
    scan_mode = models.TextField(u'Режим сканирования', null=True, blank=True)
    thickness = models.TextField(u'Толщина реконструктивного среза', null=True, blank=True)
    width = models.TextField(u'ширина/шаг', null=True, blank=True)
    contrast_enhancement = models.TextField(u'Контрастное усиление', null=True, blank=True)
    assistant = models.ForeignKey(Position, verbose_name=u'Лаборант', null=True, blank=True)
    
    def convertData(self):
        field_set = FieldSet.objects.all()
        sections = [fs.name for fs in field_set]
        fields = [
            {'section':'anamnesis','tickets':[]},
            {'section':'diagnosis','tickets':[]},
            {'section':'complaints','tickets':[]},
            {'section':'examination','tickets':[]},
            {'section':'treatment','tickets':[]},
            {'section':'referral','tickets':[]},
            {'section':'conclusion','tickets':[]},
            {'section':'other','tickets':[]}
        ]
        printed_fields = self.comment.split(',')
        
        def insertToOther(ticket):
            if not 'other' in sections:
                FieldSet.objects.create(name='other',order=1000,title=u'Дополнительно')
                sections.append('other')
            fields[7]['tickets'].append(ticket)
                
        if self.anamnesis:
            ticket = {'title':u'Общий анамнез','printable':'anamnesis' in printed_fields,'private':False,'text':self.anamnesis}
            if 'anamnesis' in sections:
                fields[0]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.disease:
            ticket = {'title':u'Характер заболевания','printable':'disease' in printed_fields,'private':False,'text':self.disease}
            if 'anamnesis' in sections:
                fields[0]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.complaints:
            ticket = {'title':u'Жалобы','printable':'complaints' in printed_fields,'private':False,'text':self.complaints}
            if 'complaints' in sections:
                fields[2]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.history:
            ticket = {'title':u'История настоящего заболевания','printable':'history' in printed_fields,'private':False,'text':self.history}
            if 'anamnesis' in sections:
                fields[0]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.objective_data:
            ticket = {'title':u'Объективные данные','printable':'objective_data' in printed_fields,'private':False,'text':self.objective_data}
            if 'anamnesis' in sections:
                fields[0]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.psycho_status:
            ticket = {'title':u'Психологический/неврологический статус','printable':'psycho_status' in printed_fields,'private':False,'text':self.psycho_status}
            if 'anamnesis' in sections:
                fields[0]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.gen_diag:
            ticket = {'title':u'Основной диагноз','printable':'gen_diag' in printed_fields,'private':False,'text':self.gen_diag}
            if 'diagnosis' in sections:
                fields[1]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.diagnosis:
            ticket = {'title':u'Диагноз','printable':'diagnosis' in printed_fields,'private':False,'text':self.diagnosis}
            if 'diagnosis' in sections:
                fields[1]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.complication:
            ticket = {'title':u'Осложнения','printable':'complication' in printed_fields,'private':False,'text':self.complication}
            if 'complication' in sections:
                fields[0]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.concomitant_diag:
            ticket = {'title':u'Сопутствующий диагноз','printable':'concomitant_diag' in printed_fields,'private':False,'text':self.concomitant_diag}
            if 'diagnosis' in sections:
                fields[1]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.clinical_diag:
            ticket = {'title':u'Клинический диагноз','printable':'clinical_diag' in printed_fields,'private':False,'text':self.clinical_diag}
            if 'diagnosis' in sections:
                fields[1]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.treatment:
            ticket = {'title':u'Лечение','printable':'treatment' in printed_fields,'private':False,'text':self.treatment}
            if 'treatment' in sections:
                fields[4]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                    
        if self.referral:
            ticket = {'title':u'Направление','printable':'referral' in printed_fields,'private':False,'text':self.referral}
            if 'referral' in sections:
                fields[5]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                
        if self.conclusion:
            ticket = {'title':u'Заключение','printable':'conclusion' in printed_fields,'private':False,'text':self.conclusion}
            if 'conclusion' in sections:
                fields[6]['tickets'].append(ticket)
            else:
                insertToOther(ticket)
                
        if self.extra_service:
            ticket = {'title':u'Дополнительные услуги','printable':'extra_service' in printed_fields,'private':False,'text':self.extra_service}
            insertToOther(ticket)
                
        data = [p for p in fields if p['tickets']]
        return data
    
    def getAttributes(self):
        attrs = {}
        data = simplejson.dumps(self.convertData())
        attrs['data'] = data
        attrs['name'] = self.name or self.ordered_service.service.name
        attrs['print_name'] = self.print_name or self.ordered_service.service.name
        attrs['print_date'] = self.print_date
        attrs['ordered_service'] = self.ordered_service
        attrs['mkb_diag'] = self.mbk_diag
        attrs['assistant'] = self.assistant
        attrs['equipment'] = self.equipment
        attrs['area'] = self.area
        attrs['scan_mode'] = self.scan_mode
        attrs['thickness'] = self.thickness
        attrs['width'] = self.width
        attrs['contrast_enhancement'] = self.contrast_enhancement
        return attrs
        
    
    def save(self, *args, **kwargs):
        if not self.id:
            attributes = self.getAttributes()
            Card.objects.create(**attributes)
        super(ExaminationCard, self).save(*args, **kwargs)
        
    
    def __unicode__(self):
        return "%s - %s - %s" % (self.created.strftime("%d/%m/%Y"),self.name or self.print_name,self.ordered_service.order.patient.short_name())
    
    class Meta:
        verbose_name = u'Карта осмотра'
        verbose_name_plural = u'Карты осмотра'
        ordering = ('-id',)

class ExaminationDetail(models.Model):
    exam_card = models.OneToOneField(ExaminationCard)
    equipment = models.ForeignKey(Equipment, verbose_name=u'Оборудование', null=True, blank=True)
    area = models.TextField(u'Область исследования', null=True, blank=True)
    scan_mode = models.TextField(u'Режим сканирования', null=True, blank=True)
    thickness = models.TextField(u'Толщина реконструктивного среза', null=True, blank=True)
    width = models.TextField(u'ширина/шаг', null=True, blank=True)
    contrast_enhancement = models.TextField(u'Контрастное усиление', null=True, blank=True)
    
    def __unicode__(self):
        return self.exam_card.name
    
    class Meta:
        verbose_name = u'Дополнительная информация карты осмотра'
        verbose_name_plural = u'Дополнительная информация карты осмотра'
        ordering = ('-id',)
        
class Card(models.Model):
    name = models.TextField(u'Рабочее наименование', null=True, blank=True)
    print_name = models.TextField(u'Заголовок для печати', null=True, blank=True)
    created = models.DateTimeField(u'Дата создания', auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    print_date = models.DateTimeField(u'Время печати', blank=True, null=True)
    ordered_service = models.ForeignKey(OrderedService,blank=True, null=True)
    mkb_diag = models.ForeignKey(ICD10, null=True, blank=True)
    assistant = models.ForeignKey(Position, verbose_name=u'Лаборант', null=True, blank=True)
    data = models.TextField(u'Данные', null=True, blank=True)
    equipment = models.ForeignKey(Equipment, verbose_name=u'Оборудование', null=True, blank=True)
    area = models.TextField(u'Область исследования', null=True, blank=True)
    scan_mode = models.TextField(u'Режим сканирования', null=True, blank=True)
    thickness = models.TextField(u'Толщина реконструктивного среза', null=True, blank=True)
    width = models.TextField(u'ширина/шаг', null=True, blank=True)
    contrast_enhancement = models.TextField(u'Контрастное усиление', null=True, blank=True)
    deleted = models.BooleanField(u'Удалено', default=False)
    
    
    def __unicode__(self):
        return "%s - %s - %s" % (self.created.strftime("%d/%m/%Y"),self.name or self.print_name,self.ordered_service.order.patient.short_name())
    
    class Meta:
        verbose_name = u'Карта осмотра'
        verbose_name_plural = u'Карты осмотра'
        ordering = ('-id',)
        
class Template(models.Model):
    name = models.TextField(u'Рабочее наименование', null=True, blank=True)
    print_name = models.TextField(u'Заголовок для печати', null=True, blank=True)
    created = models.DateTimeField(u'Дата создания', auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    print_date = models.DateTimeField(u'Время печати', blank=True, null=True)
    base_service = models.ForeignKey(BaseService, null=True, blank=True)
    staff = models.ForeignKey(Staff, null=True, blank=True)
    data = models.TextField(u'Данные', null=True, blank=True)
    equipment = models.ForeignKey(Equipment, verbose_name=u'Оборудование', null=True, blank=True)
    area = models.TextField(u'Область исследования', null=True, blank=True)
    scan_mode = models.TextField(u'Режим сканирования', null=True, blank=True)
    thickness = models.TextField(u'Толщина реконструктивного среза', null=True, blank=True)
    width = models.TextField(u'ширина/шаг', null=True, blank=True)
    contrast_enhancement = models.TextField(u'Контрастное усиление', null=True, blank=True)
    deleted = models.BooleanField(u'Удалено', default=False)
    
    
class Glossary(MPTTModel):
    parent = models.ForeignKey('self', null=True, blank=True)
    base_service = models.ForeignKey(BaseService, null=True, blank=True)
    template = models.ForeignKey(Template, null=True, blank=True)
    staff = models.ForeignKey(Staff, null=True, blank=True)
    section = models.TextField(u'Раздел', null=True, blank=True)
    text = models.TextField(u'Текст', null=True, blank=True)
    
    def __unicode__(self):
        return "%s %s" % (self.id, self.text)
    
    class Meta:
        verbose_name = u'Глоссарий'
        verbose_name_plural = u'Глоссарий'
        ordering = ('-id',)
        
class FieldSet(models.Model):
    name = models.TextField(u'Имя')
    order = models.IntegerField(u'Порядок', unique = True)
    title = models.TextField(u'Заголовок')
    active = models.BooleanField(u'Активно',default=True)
    
    def __unicode__(self):
        return self.title
    
    class Meta:
        verbose_name = u'Набор полей'
        verbose_name_plural = u'Наборы полей'
        ordering = ('order',)
        
class SubSection(models.Model):
    section = models.ForeignKey(FieldSet)
    title = models.TextField(u'Заголовок')
    
    def __unicode__(self):
        return self.title
    
    class Meta:
        verbose_name = u'Подраздел'
        verbose_name_plural = u'Подразделы'
        ordering = ('title',)

class DICOM(models.Model):
    """
    """
    examination_card = models.ForeignKey(ExaminationCard)
    dicom_file = models.FileField(u'DICOM файл', max_length=500, upload_to=settings.MEDIA_ROOT / 'dicom')
    
    def get_image(self):
        
        import dicom
        ds = dicom.read_file(self.dicom_file)
        
        bits = ds.BitsAllocated
        samples = ds.SamplesperPixel
        if bits == 8 and samples == 1:
            mode = "L"
        elif bits == 8 and samples == 3:
            mode = "RGB"
        elif bits == 16:
            mode = "I;16" # not sure about this -- PIL source says is 'experimental' and no documentation. Also, should bytes swap depending on endian of file and system??
        else:
            raise TypeError, "Don't know PIL mode for %d BitsAllocated and %d SamplesPerPixel" % (bits, samples)
        # PIL size = (width, height)
        size = (ds.Columns, ds.Rows)
        
        im = Image.frombuffer(mode, size, ds.PixelData, "raw", mode, 0, 1)

        return im
    
    def get_image_url(self):
        return u"%sdicom/img/dcm_%s.png" % (settings.STATIC_URL, self.id)
    
    def get_image_path(self):
        return settings.MEDIA_ROOT / 'dicom' / 'img' / "dcm_%s.png" % self.id
    
    def save(self, *args, **kwargs):
        super(DICOM, self).save(*args, **kwargs)
        img = self.get_image()
        img.convert('L').save(self.get_image_path())

