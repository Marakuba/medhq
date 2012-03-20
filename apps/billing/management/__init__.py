# -*- coding: utf-8 -*-
from django.db.models.signals import pre_save, post_save
from billing.models import Payment

def myFunc(sender, **kwargs):
    #if not sender.is_income:
    #    sender.amount = -sender.amount
    #print sender.is_income
    pass
    #self.account.setSum()

pre_save.connect(myFunc, sender=Payment)