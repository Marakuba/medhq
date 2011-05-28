# -*- coding: utf-8 -*-


from django.db import models
from django.contrib.auth.models import User
from core.models import make_person_object
from state.models import Department

class Staff(make_person_object('staff')):
    """
    """

    user = models.OneToOneField(User, related_name='staff_user', verbose_name=u"Пользователь", 
                                null=True, blank=True)
    high_school = models.CharField(u"ВУЗ", blank=True, max_length=200)
    speciality = models.CharField(u"Специальность", blank=True, max_length=100)
    high_school_end_date = models.PositiveIntegerField(u"Год окончания", null=True, blank=True)
    medical_experience = models.CharField(u"Общемедицинский стаж", max_length=2, blank=True)
    spec_experience = models.CharField(u"Стаж работы по специальности", max_length=2, blank=True)
    #position = models.CharField(u'Должность', max_length=50)
        
    def full_name(self):
        return u"%s %s %s" % (self.last_name, self.first_name, self.mid_name)
    
    def short_name(self):
        return u"%s %s.%s" % (self.last_name, self.first_name[0].capitalize(), self.mid_name and u" %s." % self.mid_name[0].capitalize() or u'')
    
    def __unicode__(self):
        return self.full_name()
    
    def zid(self):
        return str(self.id).zfill(5)
    
    class Meta:
        verbose_name = u"Персонал"
        verbose_name_plural = u"Персонал"
        ordering = ('last_name','first_name',)
        

class Position(models.Model):
    """
    """
    department = models.ForeignKey(Department, verbose_name=u'Отделение')
    staff = models.ForeignKey(Staff)
    title = models.CharField(u'Должность', max_length=50)

    class Meta:
        verbose_name = u'должность'
        verbose_name_plural = u'должности'
        ordering = ('staff__last_name','staff__first_name')
        
    def __unicode__(self):
        return u"%s, %s" % (self.staff.short_name(), self.title)
    
    @property
    def state(self):
        return self.department.state.id
    
    @property
    def profile(self):
        return u"%s, %s" % (self.department.state, self.title) 


    
    