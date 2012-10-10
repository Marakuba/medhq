# -*- coding: utf-8 -*-

"""
"""

from django.db import models
from examination.models import Card
from staff.models import Position
from django.db.models.signals import post_save

class ExamAssistant(models.Model):
    """
    """
    card = models.ForeignKey(Card)
    assistant = models.ForeignKey(Position)
    
    def __unicode__(self):
        return u"%s, %s" % (self.assistant, self.card)
    
    class Meta:
        verbose_name = u'ассистент осмотра'
        verbose_name_plural = u'ассистенты осмотров'
        ordering = ('-card__created',)
        unique_together = ['card','assistant']
        


def create_assistant(sender, **kwargs):
    card = kwargs['instance']
    tickets = card.get_data()['tickets']
    for t in tickets:
        if t['xtype']=='assitantticket':
            assistant_id = t['value']['resource_uri'].split('/')[-1]
            try:
                assistant = Position.objects.get(id=assistant_id)
            except:
                continue
            ExamAssistant.objects.get_or_create(card=card, assistant=assistant)


#post_save.connect(create_assistant, sender=Card)
        