# -*- coding: utf-8 -*-


from reporting import register, SqlReport


@register('corp-patient-service-register-byservice')
class CorpPatientServiceRegister(SqlReport):
    fields = [{
        'name': 'payer',
    }, {
        'name': 'state',
    }, {
        'name': 'patient',
    }, {
        'name': 'polis',
        'hidden': True
    }, {
        'name': 'num',
        'hidden': True
    }, {
        'name': 'created',
    }, {
        'name': 'code',
    }, {
        'name': 'serv',
    }, {
        'name': 'price',
    }, {
        'name': 'cnt',
    }, {
        'name': 'sum',
    }, {
        'name': 'discount',
    }, {
        'name': 'clean_price',
    }, ]

    groups = [{
        'name': 'payer',
        'field': 'payer',
        'colspan': 4,
        'cssCls': 'group1',
        'aggr': [{
            'name': '1count',
            'field': 'cnt',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2sum',
            'field': 'sum',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }]
    }, {
        'name': 'state',
        'field': 'state',
        'colspan': 4,
        'cssCls': 'group2',
        'aggr': [{
            'name': '1count',
            'field': 'cnt',
            'cssCls': 'group2',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2sum',
            'field': 'sum',
            'cssCls': 'group2',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'cssCls': 'group2',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'cssCls': 'group2',
            'func': 'sum',
            'scope': 'data'
        }]
    }, {
        'name': 'patient',
        'field': 'patient',
        'cssCls': 'group3',
        'colspan': 4,
        'aggr': [{
            'name': '1count',
            'field': 'cnt',
            'cssCls': 'group3',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2sum',
            'field': 'sum',
            'cssCls': 'group3',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'cssCls': 'group3',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'cssCls': 'group3',
            'func': 'sum',
            'scope': 'data'
        }]
    }]

    totals = {
        'verbose': u'Всего:',
        'colspan': 4,
        'aggr': [{
            'name': '1count',
            'field': 'cnt',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2sum',
            'field': 'sum',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'func': 'sum',
            'scope': 'data'
        }]
    }


@register('corp-patient-service-register-bypatient')
class CorpPatientServiceRegisterByPatient(CorpPatientServiceRegister):
    fields = [{
        'name': 'payer',
    }, {
        'name': 'state',
    }, {
        'name': 'patient',
    }, {
        'name': 'cnt',
    }, {
        'name': 'sum',
    }, {
        'name': 'discount',
    }, {
        'name': 'clean_price',
    }, ]

    groups = [{
        'name': 'payer',
        'field': 'payer',
        'colspan': 1,
        'cssCls': 'group1',
        'aggr': [{
            'name': '1count',
            'field': 'cnt',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2sum',
            'field': 'sum',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }]
    }, {
        'name': 'state',
        'field': 'state',
        'colspan': 1,
        'cssCls': 'group2',
        'aggr': [{
            'name': '1______count',
            'field': 'cnt',
            'cssCls': 'group2',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2________sum',
            'field': 'sum',
            'cssCls': 'group2',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'cssCls': 'group2',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'cssCls': 'group2',
            'func': 'sum',
            'scope': 'data'
        }]
    }]

    totals = {
        'verbose': u'Всего:',
        'colspan': 1,
        'aggr': [{
            'name': '1count',
            'field': 'cnt',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2sum',
            'field': 'sum',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'func': 'sum',
            'scope': 'data'
        }]
    }


@register('corp-patient-service-register-bystate')
class CorpPatientServiceRegisterByState(CorpPatientServiceRegister):
    fields = [{
        'name': 'payer',
    }, {
        'name': 'state',
    }, {
        'name': 'cnt',
    }, {
        'name': 'sum',
    }, {
        'name': 'discount',
    }, {
        'name': 'clean_price',
    }, ]

    groups = [{
        'name': 'payer',
        'field': 'payer',
        'colspan': 1,
        'cssCls': 'group1',
        'aggr': [{
            'name': '1count',
            'field': 'cnt',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2sum',
            'field': 'sum',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'cssCls': 'group1',
            'func': 'sum',
            'scope': 'data'
        }]
    }]

    totals = {
        'verbose': u'Всего:',
        'colspan': 1,
        'aggr': [{
            'name': '1count',
            'field': 'cnt',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '2sum',
            'field': 'sum',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '3___discount',
            'field': 'discount',
            'func': 'sum',
            'scope': 'data'
        }, {
            'name': '4clean_price',
            'field': 'clean_price',
            'func': 'sum',
            'scope': 'data'
        }]
    }