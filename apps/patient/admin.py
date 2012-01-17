# -*- coding: utf-8 -*-

from django.contrib import admin
from django.conf import settings
from patient.models import Patient, Contract, InsurancePolicy
from core.admin import OperatorAdmin, TabbedMedia
from django.conf.urls.defaults import patterns, url
from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404, redirect, render_to_response
from django.core.urlresolvers import reverse
from django.contrib.admin.util import unquote
from lab.models import LabOrder
from django.http import HttpResponse

class InsurancePolicyInlineAdmin(admin.TabularInline):
    model = InsurancePolicy

RESPONSE_TPL = """
<script type="text/javascript">
    parent.patient_id = "%(id)s";
    parent.patient_label = "%(label)s";
    parent.patient_desc = "%(desc)s";
    parent.$.fancybox.close();
</script>
"""

class PatientAdmin(OperatorAdmin, TabbedMedia):

    fieldsets = (
        (u'Личные данные',{
            'fields':('last_name','first_name','mid_name','birth_day','gender'),
        }),
        (u'Маркетинговая информация',{
            'fields':('discount','doc','initial_account','hid_card','ad_source'),
        }),
        (u'Контакты и адрес',{
            'fields':('mobile_phone','work_phone','home_phone','home_address_street','work_address_street','email'),
        }),
    )
    list_display = ('zid','full_name','birth_day','billed_account','operator',)
    search_fields = ['last_name','first_name','mid_name']
    inlines = [InsurancePolicyInlineAdmin]

    def response_add(self, request, obj, post_url_continue='../%s/'):
        if request.POST.has_key("_popup"):
            attrs = {
                'id': obj._get_pk_val(),
                'label': obj.full_name(),
                'obj':obj,
                'desc': u'PID %s, д.р.: %s' % (obj.zid(),obj.birth_day)
            }
            return render_to_response("admin/patient/patient/response.html", attrs) 
        return super(PatientAdmin, self).response_add(request, obj, post_url_continue=post_url_continue)

    def change_view(self, request, object_id, extra_context=None):
        "The 'change' admin view for this model."

        obj = self.get_object(request, unquote(object_id))   
        extra_context = {'results':LabOrder.objects.filter(visit__patient=obj)}
        return super(PatientAdmin, self).change_view(request, object_id, extra_context=extra_context)
        
         
    def contract_detail(self, request, object_id):
        """
        """
        patient = get_object_or_404(Patient, pk=object_id)
        if request.method=='POST':
            if not patient.get_contract():
                new_contract = Contract.objects.create(patient=patient)
            return redirect(reverse('admin:contract', args=(patient.id,)))
        extra_context = {
            'patient':patient,
        }
        return direct_to_template(request, "print/patient/contract_detail.html", extra_context=extra_context)
    
    def print_contract(self, request, object_id):
        """
        """
        state = request.active_profile.department.state
        patient = get_object_or_404(Patient, pk=object_id)
        contract = patient.get_contract()
        extra_context = {
            'state':state,
            'patient':patient,
            'contract':contract
        }
        return direct_to_template(request, "print/patient/contract.html", extra_context=extra_context)
    
    def print_agreement(self, request, object_id):
        """
        """
        patient = get_object_or_404(Patient, pk=object_id)
        contract = patient.get_contract()
        extra_context = {
            'patient':patient,
            'contract':contract,
            'f':patient.is_f() and u"а" or u"",
            'ff':patient.is_f() and u"на" or u"ен"
        }
        return direct_to_template(request, "print/patient/agreement.html", extra_context=extra_context)
    
    def print_card(self, request, object_id):
        """
        """
        state = request.active_profile.department.state
        patient = get_object_or_404(Patient, pk=object_id)
        contract = patient.get_contract()
        extra_context = {
            'state':state,
            'patient':patient,
            'contract':contract,
            'f':patient.is_f() and u"а" or u"",
            'ff':patient.is_f() and u"на" or u"ен"
        }
        return direct_to_template(request, "print/patient/card_face.html", extra_context=extra_context)
    
    def print_card_face(self, request, object_id):
        """
        """
#        patient = get_object_or_404(Patient, pk=object_id)
#        contract = patient.get_contract()
        extra_context = {
#            'patient':patient,
#            'contract':contract,
#            'f':patient.is_f() and u"а" or u"",
#            'ff':patient.is_f() and u"на" or u"ен"
        }
        return direct_to_template(request, "print/patient/card_face.html", extra_context=extra_context)
    
    
    def get_urls(self):
        urls = super(PatientAdmin, self).get_urls()
        my_urls = patterns('',
            url(r'^(?P<object_id>\d+)/contract/$', self.contract_detail, name="contract"),
            url(r'^(?P<object_id>\d+)/print_contract/$', self.print_contract, name="print_contract"),
            url(r'^(?P<object_id>\d+)/print_agreement/$', self.print_agreement, name="print_agreement"),
            url(r'^(?P<object_id>\d+)/print_card/$', self.print_card, name="print_card"),
            url(r'^(?P<object_id>\d+)/print_card_face/$', self.print_card_face, name="print_card_face"),
        )
        return my_urls + urls

    
admin.site.register(Patient, PatientAdmin)
admin.site.register(Contract)
admin.site.register(InsurancePolicy)