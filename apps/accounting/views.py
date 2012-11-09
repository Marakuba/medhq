# -*- coding: utf-8 -*-
from accounting.models import InvoiceItem, Invoice
from django.shortcuts import get_object_or_404, render_to_response
from django.template.context import RequestContext


def invoice(request, invoice_id):

    items = InvoiceItem.objects.filter(invoice=invoice_id).order_by('patient')
    invoice = get_object_or_404(Invoice, pk=invoice_id)
    d = map(lambda x: (x.service.id, x), items)
    p = {}
    for s, v in d:
        p.setdefault(s, []).append(v)
    invoices = map(lambda x: [x[0], sum(map(lambda y: y.count, x)), \
                    x[0].price * sum(map(lambda y: y.count, x))], p.values())
    total_count = len(invoices)
    total_sum = sum(map(lambda x: x[2], invoices))

    extra_context = {
        'invoices': invoices,
        'contract': invoice.contract,
        'total_count': total_count,
        'total_sum': float(total_sum)
    }

    return render_to_response("print/accounting/invoice.html",
                              extra_context,
                              context_instance=RequestContext(request))
