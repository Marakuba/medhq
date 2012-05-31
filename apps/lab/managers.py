# -*- coding: utf-8 -*-

"""
"""
from django.db import models

class ResultManager(models.Manager):
    
    def active(self):
        return self.filter(analysis__hidden=False)