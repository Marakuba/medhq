from templatetag_sugar.parser import Constant, Name, Optional, Variable
from templatetag_sugar.register import tag
from django import template
register = template.Library()

@tag(register,[Variable(),Optional([Variable()]),Optional([Constant("as"), Name()])])
def get_report_as_list(context, report, header=False, asvar=None):
    if asvar:
        context[asvar] = report.as_list(header=header)
        return ""
    else:
        return report.as_list(node=None,header=header)