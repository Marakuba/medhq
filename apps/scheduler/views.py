# -*- coding: utf-8 -*-
from scheduler.models import Preorder
from annoying.decorators import render_to


@render_to("print/scheduler/asgmtlist.html")
def asgmt_list(request):
    id_list = request.POST.get('id_list')
    id_list = reversed(id_list.split(","))
    preorders = Preorder.objects.filter(id__in=id_list)
    total_price = 0
    total_count = 0
    for preorder in preorders:
        total_count += preorder.count
        total_price += preorder.count * preorder.price - preorder.get_discount()
    ctx = {
        'preorders': preorders,
        'promotion': preorders[0].promotion,
        'patient': preorders[0].patient,
        'created': preorders[0].created,
        'total_price': total_price,
        'total_count': total_count
    }

    return ctx
