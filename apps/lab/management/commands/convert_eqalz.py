# -*- coding: utf-8 -*-

"""
"""
from django.core.management.base import BaseCommand
from lab.models import EquipmentAssay, EquipmentAnalysis


class Command(BaseCommand):

    def handle(self, *args, **options):
        """
        """
        assays = EquipmentAssay.objects.all()
        for assay in assays:
            analyses = assay.service.analysis_set.all()
            try:
                analysis = analyses[0]
                equipment_analysis, created = EquipmentAnalysis.objects.get_or_create(analysis=analysis)
                assay.equipment_analysis = equipment_analysis
                assay.save()
                print "Assay %s updated" % assay
            except:
                print "Cannot fetch 1-st analysis in %s :(" % assay.service