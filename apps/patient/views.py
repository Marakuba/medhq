
from patient.models import Patient, Contract
from django.views.generic.simple import direct_to_template
from django.shortcuts import get_object_or_404, render_to_response
from django.template.context import RequestContext


def contractPrint(request, contract_id):

    contract = get_object_or_404(Contract, id=contract_id)

    ec = {
        'patient': contract.patient,
        'contract': contract
    }

    template = contract.contract_type.template or 'print/patient/contract.html'

    return render_to_response(template, ec,
                              context_instance=RequestContext(request))


def acceptancePrint(request, patient_id):

    patient = Patient.objects.get(id=patient_id)

    ec = {
        'patient': patient,
        'state': request.active_profile.department.state
    }

    return direct_to_template(request=request,
                              template="print/patient/agreement.html",
                              extra_context=ec)
