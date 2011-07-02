# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
from patient.models import Patient


class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        patients = Patient.objects.all()
        
        for patient in patients:
            patient.update_account()