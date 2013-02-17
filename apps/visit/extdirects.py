from extdirect.django.decorators import remoting
from direct.providers import remote_provider
import simplejson

from visit.models import Visit, OrderedService
from lab.utils import make_lab
from state.models import State
from patient.models import InsurancePolicy


@remoting(remote_provider, len=1, action='visit', name='toLab')
def to_lab(request):
    """
    """
    data = simplejson.loads(request.raw_post_data)
    ids = data['data'][0]
    object_list = OrderedService.objects.filter(id__in=ids)
    for obj in object_list:
        make_lab(obj)
    return dict(success=True, data='some data')


@remoting(remote_provider, len=1, action='visit', name='setPaymentType')
def set_payment_type(request):
    data = simplejson.loads(request.raw_post_data)
    params = data['data'][0]
    visit_id = params['id']
    payer = params['payer'] or None
    policy = params['insurance_policy'] or None
    try:
        visit = Visit.objects.get(id=visit_id)
    except:
        return dict(success=False, data="cannot find visit %s" % visit_id)

    if policy:
        try:
            policy = InsurancePolicy.objects.get(id=policy)
        except:
            return dict(success=False, data="cannot find policy %s" % policy)

    if payer:
        try:
            payer = State.objects.get(id=params['payer'])
        except:
            return dict(success=False, data="cannot find payer %s" % params['payer'])
    try:
        visit.payment_type = params['ptype']
        visit.payer = payer
        visit.insurance_policy = policy
        visit.save()
    except:
        return dict(
            success=False,
            data="cannot update visit %s: [payment_type: %s, payer: %s, policy: %s]"
                    % (visit_id, params['ptype'], params['payer'], params['insurance_policy'])
        )

    services = OrderedService.objects.filter(order=visit)
    for service in services:
        service.save()
    return dict(success=True, data='visit saved')
