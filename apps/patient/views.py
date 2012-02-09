# Create your views here.
from direct.providers import remote_provider
from extdirect.django.decorators import remoting
import simplejson
from patient.models import Patient


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
        'balance':patient.balance,
        'discount_name':d and d.__unicode__() or u'0%',
        'discount':d and d.value or 0
    }
    return dict(success=True, data=data)