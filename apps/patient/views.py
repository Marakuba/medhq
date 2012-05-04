# Create your views here.
from direct.providers import remote_provider
from extdirect.django.decorators import remoting
import simplejson
from patient.models import Patient, Agreement, Contract
from django.views.generic.simple import direct_to_template
from state.models import State
from django.shortcuts import get_object_or_404, render_to_response
from annoying.decorators import render_to
from django.template.context import RequestContext

@remoting(remote_provider, len=1, action='patient', name='updatePatientInfo')
def update_patient_info(request):
    data = simplejson.loads(request.raw_post_data)
    patient_id = data['data'][0]
    patient = Patient.objects.get(id=patient_id)
    patient.update_account()
    patient.updBalance()
    d = patient.discount
    data = {
        'billed_account':patient.billed_account,
        'balance':"%.2f" % patient.balance,
        'discount_name':d and d.__unicode__() or u'0%',
        'discount':d and d.id or None
    }
    return dict(success=True, data=data)


def contractPrint(request, contract_id):

    contract = get_object_or_404(Contract, id=contract_id)
    
    ec = {
        'contract':contract
    }
    
    template = contract.contract_type.template or 'print/patient/contract.html'

    return render_to_response(template, ec,
                              context_instance=RequestContext(request))


def acceptancePrint(request,patient_id):
    
    patient = Patient.objects.get(id=patient_id)
    
    ec = {
        'patient':patient,
        'state':request.active_profile.department.state
    }
    
    return direct_to_template(request=request, 
                              template="print/patient/agreement.html",
                              extra_context=ec)

    
@remoting(remote_provider, len=1, action='patient', name='setAcceptedDate')
def set_accepted_date(request):
    data = simplejson.loads(request.raw_post_data)
    patient_id = data['data'][0]['patient']
    state_id = data['data'][0]['state']
    success = True

    try:
        state = State.objects.get(id=state_id)
        patient = Patient.objects.get(id=patient_id)
        agreement = Agreement.objects.create(patient=patient,state=state)
        data = {'accepted':agreement.accepted.strftime("%m/%d/%Y %H:%M:%S")} 

    except:
        success = False
        data = {}
    
    
    return dict(success=success, data=data)
