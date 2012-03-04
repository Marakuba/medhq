# -*- coding: utf-8 -*-

from django.core.management.base import NoArgsCommand
from lab.models import LabOrder
from analyzers.adapters import AbbotAdapter

class Command(NoArgsCommand):
    
    def handle_noargs(self, **options):
        msg = [
            [
                '1H|\^&|||ARCHITECT^7.01^F5260044206^H1P1O1R1C1Q1L1|||||||P|1|20120217144954|2A',
                '2P|1|||||||U|F8',
                '3O|1|1379 levchenko|1379 levchenko^S473^1|^^^651^_B-hCG^UNDILUTED^P|R||||||||||||||||||||F|49',
                '4R|1|^^^651^_B-hCG^UNDILUTED^P^06918JN00^14567^^F|> 15000.00|mIU/mL||>||F||ADMIN^ADMIN||20120217144954|i1SR02762|F9',
                '5R|2|^^^651^_B-hCG^UNDILUTED^P^06918JN00^14567^^I|Positive|||||F||ADMIN^ADMIN||20120217144954|i1SR02762|3E',
                '6R|3|^^^651^_B-hCG^UNDILUTED^P^06918JN00^14567^^P|2423973|RLU||||F||ADMIN^ADMIN||20120217144954|i1SR02762|55',
                '7L|1|40',
            ],[
                '1H|\^&|||ARCHITECT^7.01^F5260044206^H1P1O1R1C1Q1L1|||||||P|1|20120217152219|23',
                '2P|1|||||||U|F8',
                '3O|1|1379 levchenko|1379 levchenko^S473^1|^^^651^_B-hCG^1:15^P|R||||||||||||||||||||F|6C',
                '4R|1|^^^651^_B-hCG^1:15^P^06918JN00^14567^^F|40314.63|mIU/mL||||F||ADMIN^ADMIN||20120217152219|i1SR02762|88',
                '5R|2|^^^651^_B-hCG^1:15^P^06918JN00^14567^^I|Positive|||||F||ADMIN^ADMIN||20120217152219|i1SR02762|5A',
                '6R|3|^^^651^_B-hCG^1:15^P^06918JN00^14567^^P|743783|RLU||||F||ADMIN^ADMIN||20120217152219|i1SR02762|43',
                '7L|1|40'
            ]
        ]

