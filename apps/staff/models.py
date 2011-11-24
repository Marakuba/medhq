# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User
from core.models import make_person_object
from state.models import Department
import datetime
from tagging.fields import TagField
from south.modelsinspector import add_introspection_rules

add_introspection_rules([], ["^tagging\.fields\.TagField"])

TIMESLOTS =(
            (1,15),
            (2,20),
            (3,25),
            (4,30),
            (5,40)
            )

ROUTINES = (
            ('00',u'любые дни'),
            ('10',u'четные дни'),
            ('20',u'нечетные дни'),
            ('01',u'любые, 1-я смена'),
            ('02',u'любые, 2-я смена'),
            ('11',u'четные, 1-я смена'),
            ('12',u'четные, 2-я смена'),
            ('21',u'нечетные, 1-я смена'),
            ('22',u'нечетные, 2-я смена')
            )


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
    
    objects = models.Manager()
    
    def get_position(self):
        if not hasattr(self,'_position'):
            p = self.position_set.all()
            self._position = len(p) and p[0] or None
        return self._position.title
        
    def full_name(self):
        return u"%s %s %s%s" % (self.last_name, self.first_name, self.mid_name, self.get_position() and u', %s' % self.get_position() or u'')
    
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
    
    def short_name(self):
        return self.staff.short_name()
    
    @property
    def state(self):
        return self.department.state.id
    
    @property
    def profile(self):
        return u"%s, %s" % (self.department.state, self.title) 
    

class Doctor(models.Model):
    """
    """
    staff = models.OneToOneField(Staff)
    comment = models.TextField(u'Комментарий', blank = True, null = True)
    timeslot = models.PositiveIntegerField(u'Базовый интервал', default = 4, choices = TIMESLOTS)
    routine = models.CharField(u'Режим работы', default = '00', choices = ROUTINES, max_length=2)
    am_session_starts = models.TimeField(u'время начала первой смены', blank = True, null = True)
    am_session_ends = models.TimeField(u'время окончания первой смены', blank = True, null = True)
    pm_session_starts = models.TimeField(u'время начала второй смены', blank = True, null = True)
    pm_session_ends = models.TimeField(u'время окончания второй смены', blank = True, null = True)
    work_days = TagField()
    room = models.PositiveIntegerField(u'Hомер комнаты', blank = True, null = True)
    


    
    