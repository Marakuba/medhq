# -*- coding: utf-8 -*-


from django.db import models
from django.contrib.auth.models import Group, User


class Viewport(models.Model):

    name = models.CharField(u'Название', max_length=50)
    slug = models.SlugField(u'Slug')
    groups = models.ManyToManyField(Group, blank=True, null=True)
    users = models.ManyToManyField(User, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    template = models.CharField(u'Шаблон', max_length=200, blank=True)

    class Meta:
        verbose_name = u'интерфейс'
        verbose_name_plural = u'интерфейсы'

    def __unicode__(self):
        return self.name


SPLITTER_CHOICES = (
    (u'', u'нет'),
    (u'-', u'обычный'),
    (u'->', u'вправо'),
)


class ViewportApp(models.Model):

    viewport = models.ForeignKey(Viewport)
    xtype = models.CharField(u'Приложение', max_length=50)
    is_default = models.BooleanField(default=False)
    tbar_group = models.CharField(u'Группа кнопок', max_length=50, blank=True)
    splitter = models.CharField(u'Разделитель', max_length=3, blank=True, choices=SPLITTER_CHOICES)
    groups = models.ManyToManyField(Group, blank=True, null=True)
    users = models.ManyToManyField(User, blank=True, null=True)
    order = models.IntegerField(u'Порядок', default=0)

    class Meta:
        verbose_name = u'приложение интерфейса'
        verbose_name_plural = u'приложения интерфейсов'
        ordering = ('order',)

    def __unicode__(self):
        return u"%s [%s]" % (self.xtype, self.viewport, )
