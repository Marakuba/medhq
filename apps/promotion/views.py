# -*- coding: utf-8 -*-
from promotion.forms import PromotionForm
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required, permission_required
from django.views.decorators.cache import cache_control
from django.template.context import RequestContext
from promotion.models import PromotionItem, Promotion 
import datetime
import csv
from service.models import BaseService
from state.models import State

@login_required
@permission_required('pricelist.add_price')
@cache_control(no_cache=True)
def promo_form(request):
    form = PromotionForm()
    return render_to_response('promotion/upload.html', {'form': form,
                                                      'title':u'Загрузка акций',
                                                      'today':datetime.date.today()}, 
                              context_instance=RequestContext(request))
    
def promo_upload(request):
    promo_id = request.POST.get('promotion')
    state_id = request.POST.get('state')
    error_text = []
    complete_text = []
    
    if not promo_id:
        error_text += [u'Не указана акция']
        return render_to_response('promotion/result.html', {'error_text': error_text}, 
                              context_instance=RequestContext(request))
    else:
        try:
            promotion = Promotion.objects.get(id=promo_id)
        except:
            error_text += [u'Не найдена указанная промо-акция']
            return render_to_response('promotion/result.html', {'error_text': error_text}, 
                              context_instance=RequestContext(request))
    if not state_id:
        error_text += [u'Не указана организация']
        return render_to_response('promotion/result.html', {'error_text': error_text}, 
                              context_instance=RequestContext(request))
    else:
        try:
            state = State.objects.get(id=state_id)
        except:
            error_text += [u'Не найдена указанная организация']
            return render_to_response('promotion/result.html', {'error_text': error_text}, 
                              context_instance=RequestContext(request))
    try:
        file = request.FILES[u'file']
        data = csv.reader(file,delimiter=',')
    except:
        error_text += [u'Не указан файл с услугами либо указан файл неверного формата (Код услуги, Наименование услуги)']
        return render_to_response('promotion/result.html', {'error_text': error_text}, 
                              context_instance=RequestContext(request))
    complete_text += [u'Завершено']
    complete_text += [u'Добавлены следующие услуги:']
    for row in data:
        service_id = row[0]
        try:
            service = BaseService.objects.get(id=service_id)
            PromotionItem.objects.get_or_create(base_service=service,promotion=promotion,execution_place=state,count=1)
            complete_text += ["%s" % row[1]]
        except:
            error_text += [u'Услуга "%s" не найдена' % row[1]]
            
    # print error_text
        
    return render_to_response('promotion/result.html', {'error_text': error_text,'complete_text':complete_text}, 
                              context_instance=RequestContext(request))