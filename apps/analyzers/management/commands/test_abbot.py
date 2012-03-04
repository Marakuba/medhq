# -*- coding: utf-8 -*-

from django.core.management.base import NoArgsCommand
from LIS.adapters import AbbotAdapter

class Command(NoArgsCommand):
    
    def calc_checksum(self, message, cs):
        ord_sum = 0
        for ch in message:
            ord_sum += ord(ch)
        ord_sum += 16
        h = hex(ord_sum)[-2:].upper()
        return h==cs
    
    def handle_noargs(self, **options):
        messages = [
#                ['1H|\^&|||ARCHITECT^7.01^F5260044206^H1P1O1R1C1Q1L1|||||||P|1|20120217144954','2A'],
#                ['2P|1|||||||U','F8'],
#                ['3O|1|38704|38704^S473^1|^^^651^_B-hCG^UNDILUTED^P|R||||||||||||||||||||F','49',],
#                ['4R|1|^^^651^_B-hCG^UNDILUTED^P^06918JN00^14567^^F|> 15000.00|mIU/mL||>||F||ADMIN^ADMIN||20120217144954|i1SR02762','F9',],
#                ['5R|2|^^^651^_B-hCG^UNDILUTED^P^06918JN00^14567^^I|Positive|||||F||ADMIN^ADMIN||20120217144954|i1SR02762','3E'],
#                ['6R|3|^^^651^_B-hCG^UNDILUTED^P^06918JN00^14567^^P|2423973|RLU||||F||ADMIN^ADMIN||20120217144954|i1SR02762','55'],
#                ['7L|1','40'],
#                ['1H|\^&|||ARCHITECT^7.01^F5260044206^H1P1O1R1C1Q1L1|||||||P|1|20120217152219','23',],
#                ['2P|1|||||||U','F8',],
#                ['3O|1|38704|38704^S473^1|^^^651^_B-hCG^1:15^P|R||||||||||||||||||||F','6C',],
#                ['4R|1|^^^651^_B-hCG^1:15^P^06918JN00^14567^^F|40314.63|mIU/mL||||F||ADMIN^ADMIN||20120217152219|i1SR02762','88'],
#                ['5R|2|^^^651^_B-hCG^1:15^P^06918JN00^14567^^I|Positive|||||F||ADMIN^ADMIN||20120217152219|i1SR02762','5A'],
#                ['6R|3|^^^651^_B-hCG^1:15^P^06918JN00^14567^^P|743783|RLU||||F||ADMIN^ADMIN||20120217152219|i1SR02762','43'],
#                ['7L|1','40'],
#                ['1H|\^&|||ARCHITECT^7.01^F5260044206^H1P1O1R1C1Q1L1|||||||P|1|20120121090357','21'],
#                ['2P|1|||||||U','F8'],
#                ['3O|1|1412 eremyan|1412 eremyan^F996^4|^^^651^_B-hCG^1:15^P|R||||||||||||||||||||F','B8'],
#                ['4R|1|^^^651^_B-hCG^1:15^P^02928JN00^07816^^F|87816.00|mIU/mL||||R||FSE||20111219105437|i1SR02762','49'],
#                ['5R|2|^^^651^_B-hCG^1:15^P^02928JN00^07816^^I|Positive|||||R||FSE||20111219105437|i1SR02762','12'],
#                ['6R|3|^^^651^_B-hCG^1:15^P^02928JN00^07816^^P|1447618|RLU||||R||FSE||20111219105437|i1SR02762','2A'],
#                ['7L|1','40'],
                '1H|\^&|||ARCHITECT^7.01^F5260044206^H1P1O1R1C1Q1L1|||||||P|1|20120225131842|21',
                '2Q|1|^0000040735||^^^ALL||||||||O|27',
                '3L|1|3C'
        ]
        
        adapter = AbbotAdapter(messages)
        
        print adapter.is_query
