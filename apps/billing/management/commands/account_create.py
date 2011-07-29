# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
from interlayer.models import ClientItem
from billing.models import Account, ClientAccount
from patient.models import Patient

class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        patients = Patient.objects.all()
        for p in patients:
            if not p.client_item:
                cl_item = ClientItem.objects.create()
                p.client_item = cl_item
                p.save()
                acc = Account.objects.create()
                cl_acc = ClientAccount.objects.create(client_item = cl_item, account = acc)