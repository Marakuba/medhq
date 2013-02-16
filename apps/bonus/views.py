# -*- coding: utf-8 -*-


from annoying.decorators import render_to
from collections import OrderedDict
from django.shortcuts import get_object_or_404

from .models import Calculation
from visit.models import Referral


def _make_card(calculation, referral_id=None):
    items = calculation.calculationitem_set.all()
    if referral_id:
        items = items.filter(referral__id=referral_id)

    results = OrderedDict()
    for item in items:
        n = item.referral.name
        s = item.get_source_display()
        g = item.service_group.name
        if n not in results:
            results[n] = OrderedDict()
        ref = results[n]
        if s not in ref:
            ref[s] = OrderedDict()
        src = ref[s]
        if g not in src:
            src[g] = list()
        results[n][s][g].append(item)

    return results


def allcards(request, calculation_id):
    return


@render_to('bonus/card.html')
def card(request, calculation_id, referral_id):
    calculation = get_object_or_404(Calculation, id=calculation_id)
    items = _make_card(calculation, referral_id)

    details = request.GET.get('details', False)

    return {
        'calculation': calculation,
        'items': items,
        'details': details
    }
