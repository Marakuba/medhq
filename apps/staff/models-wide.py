# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User

from rusgeo.models import City





class HighSchool(models.Model):
    name = models.CharField(u"Наименование", max_length=200)
    
    def __unicode__(self):
        return u"%s" % self.name
    
    class Meta:
        verbose_name = u"ВУЗ"
        verbose_name_plural = u"ВУЗы"
        

class Speciality(models.Model):
    name = models.CharField(u"Наименование", max_length=200)
    
    def __unicode__(self):
        return u"%s" % self.name
    
    class Meta:
        verbose_name = u"Специальности"
        verbose_name_plural = u"Специальности"
        
class Staff(models.Model):
    
    user = models.ForeignKey(User, verbose_name=u"Пользователь")
    #mediacal_state = models.ForeignKey(MedicalState, null=True, default=None)
    #department = models.ForeignKey(Department, null=True, default=None)
    #position = models.ForeignKey(Position, null=True, default=None)
    #position_start_date = models.DateField(u"С какого года", null=True, blank=True)

    high_school = models.ForeignKey(HighSchool, verbose_name=u"ВУЗ", null=True, default=None)
    speciality = models.ForeignKey(Speciality, verbose_name=u"Специальность", null=True, default=None)
    high_school_end_date = models.PositiveIntegerField(u"Год окончания", null=True, blank=True)
    medical_experience = models.CharField(u"Общемедицинский стаж", max_length=2, blank=True)
    spec_experience = models.CharField(u"Стаж работы по специальности", max_length=2, blank=True)
    #clinic_experience = models.CharField(u"Стаж работы в ЖК (амбулаторная помощь)", max_length=2, blank=True)
    #gynecology_experience = models.CharField(u"Стаж работы в гинекологическом отделении", max_length=2, blank=True)
    #maternity_experience = models.CharField(u"Стаж работы в родильном доме", max_length=2, blank=True)
    
        
    def __unicode__(self):
        return u"%s %s" % (self.user.first_name, self.user.last_name)
    
    class Meta:
        verbose_name = u"Персонал"
        verbose_name_plural = u"Персонал"
        

GRADUATES = (
    (u'А',u'Аспирантура'),
    (u'И',u'Интернатура'),
    (u'О',u'Ординатура'),
)

class Graduate(models.Model):
    staff = models.ForeignKey(Staff) 
    type = models.CharField(u"Тип заведения", max_length=1, choices=GRADUATES)
    speciality = models.ForeignKey(Speciality)
    high_school = models.ForeignKey(HighSchool)
    start_date = models.DateField(u"Дата начала")
    end_date = models.DateField(u"Дата окончания")
    
    def __unicode__(self):
        return u"%s" % self.staff.user.first_name
    
    class Meta:
        verbose_name = u"Аспирантура"
        verbose_name_plural = u"Аспирантура"
        

class Employment(models.Model):
    staff = models.ForeignKey(Staff)
    #medical_state = models.ForeignKey(MedicalState)
    #position = models.ForeignKey(Position)
    start_date = models.DateField(u"Дата начала")
    end_date = models.DateField(u"Дата окончания")
    
    def __unicode__(self):
        return u"%s" % self.staff.user.first_name
    
    class Meta:
        verbose_name = u"Место работы"
        verbose_name_plural = u"Места работы"
        
CERTIFICATES = (
    (u"Н", u"Получен"),
    (u"П", u"Подтвержден"),
)

class Certificate(models.Model):
    staff = models.ForeignKey(Staff)
    status = models.CharField(u"Статус", max_length=1, choices=CERTIFICATES)
    speciality = models.ForeignKey(Speciality)
    place = models.ForeignKey(City)
    out_date = models.DateField(u"Дата выдачи")
    number = models.CharField(u"Номер документа", max_length=10)
    
    def __unicode__(self):
        return u"%s" % self.staff.user.first_name
    
    class Meta:
        verbose_name = u"Сертификация"
        verbose_name_plural = u"Сертификация"
        
        
QUALIFICATIONS = (
    (u"Н", u"Получен"),
    (u"П", u"Подтвержден"),
)

class Qualification(models.Model):
    staff = models.ForeignKey(Staff)
    stage = models.CharField(max_length=1, choices=QUALIFICATIONS)
    speciality = models.ForeignKey(Speciality)
    place = models.ForeignKey(City)
    date = models.DateField(u"Дата выдачи")
    
    def __unicode__(self):
        return u"%s" % self.staff.user.first_name
    
    class Meta:
        verbose_name = u"Квалификация"
        verbose_name_plural = u"Квалификации"
        

DEGREES = (
    (u"К", u"к.м.н."),
    (u"Д", u"д.м.н."),
    (u"Ц", u"Доцент"),
    (u"П", u"Профессор"),
)

class AcademicDegree(models.Model):
    staff = models.ForeignKey(Staff)
    degree = models.CharField(u"Ученая степень/ученое звание", max_length=1, choices=DEGREES)
    date = models.DateField(u"Дата присвоения")
    
    
    def __unicode__(self):
        return u"%s" % self.staff.user.first_name
    
    class Meta:
        verbose_name = u"Ученая степень"
        verbose_name_plural = u"Ученые степени"
        
    
    
    