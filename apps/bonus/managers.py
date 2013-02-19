# -*- coding: utf-8 -*-


from django.db import models


class BonusRuleManager(models.Manager):

    def active(self):
        return self.filter(is_active=True)
