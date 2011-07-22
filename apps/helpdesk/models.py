# -*- coding: utf-8 -*-

"""
"""
from core.models import make_operator_object
from django.db import models
from django.utils.encoding import smart_unicode


class IssueType(models.Model):
    """
    """
    name = models.CharField(u'Наименование', max_length=200)
    
    def __unicode__(self):
        return smart_unicode(self.name)
    
    class Meta:
        verbose_name = u'класс тикета'
        verbose_name_plural = u'классы тикетов'
        ordering = ('name',)

ISSUE_LEVELS = (
    (0,u'Обычный'),
    (1,u'Средний'),
    (2,u'Критический'),
)

ISSUE_STATUSES = (
    (0,u'Открыт'),
    (1,u'Закрыт'),
    (2,u'Отклонен'),
)

class Issue(make_operator_object('issue')):
    """
    """
    type = models.ForeignKey(IssueType)
    level = models.PositiveIntegerField(u'Уровень критичности', choices=ISSUE_LEVELS, default=0)
    title = models.CharField(u'Заголовок', max_length=200)
    description = models.TextField(u'Описание тикета')
    status = models.PositiveIntegerField(u'Статус', choices=ISSUE_STATUSES, default=0)


class IssueFeed(make_operator_object('feed')):
    """
    """
    issue = models.ForeignKey(Issue)
    text = models.CharField(u'текст сообщения', max_length=300)