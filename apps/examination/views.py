# -*- coding: utf-8 -*-
from django.template import Context, loader
from django.conf import settings
from examination.models import ExaminationCard
from django.contrib.contenttypes.models import ContentType
from django.views.generic.simple import direct_to_template
import simplejson
from django.http import HttpResponse, HttpResponseBadRequest
from django.shortcuts import render_to_response, get_object_or_404

def cardPrint(request,card_id):
    card = get_object_or_404(ExaminationCard, pk=card_id)
    ec = {
            'card':card
    }
    return direct_to_template(request=request, 
                              template="print/exam/exam_card.html",
                              extra_context=ec)
