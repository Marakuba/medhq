# -*- coding: utf-8 -*-

from reporting import register
from reporting.pandas import PandasReport, Config, BaseSource, SqlDataSource, Header,\
    Column, NumberColumn, Totals, Total, Group, Agg

from .models import Calculation
from .utils import get_category_result, get_detail_result


def prep_calculation_data(config, report, **kwargs):
    filters = report.filters
    if 'calculation' in filters and filters['calculation']:
        rows, cols = get_category_result(filters['calculation'])
        return rows, cols


@register('bonus-registry')
class BonusRegistryReport(PandasReport):
    """
    """

    config = Config(
        source=BaseSource(prep_data_func=prep_calculation_data),
        header=Header(
            # Column('referral_id'),
            Column('name'),
            NumberColumn('qorder__referral'),
            NumberColumn('qstaff__staff__referral'),
            NumberColumn('qassigment__referral'),
            NumberColumn('total'),
        ),
        totals=Totals(
            Total('qorder__referral'),
            Total('qstaff__staff__referral'),
            Total('qassigment__referral'),
            Total('total'),
        )
    )

    def filter_legend(self):
        """
        """
        c = Calculation.objects.get(id=self.filters['calculation'])
        return [
            (u'№ документа', c.id),
            (u'Период', u'%s - %s' % (c.start_date.strftime('%d.%m.%Y'), c.end_date.strftime('%d.%m.%Y'))),
            (u'Категория', c.get_category_display()),
        ]


def prep_detail_data(config, report, **kwargs):
    filters = report.filters
    if 'calculation' in filters and filters['calculation']:
        ref_id = filters.get('referral', None)
        rows, cols = get_detail_result(filters['calculation'], ref_id)
        return rows, cols


from reporting.pandas import choices_renderer
from .models import BonusRule


@register('bonus-card')
class BonusCardReport(PandasReport):
    """
    """

    config = Config(
        source=BaseSource(prep_data_func=prep_detail_data),
        header=Header(
            Column('id'),
            Column('source', renderer=choices_renderer(BonusRule.SOURCES)),
            NumberColumn('value'),
            Column('ref_name'),
            Column('serv_name'),
            Column('group_name'),
        ),
        group_by=Group(
            columns=['ref_name', 'source', 'group_name'],
            attrs={
                # 'colspan': 3,
            },
            row_attrs={
                'class': 'group',
            },
            agg=[
                Agg('value', attrs={'class':'number'}),
            ]
        ),
    )

    def filter_legend(self):
        """
        """
        c = Calculation.objects.get(id=self.filters['calculation'])
        return [
            (u'№ документа', c.id),
            (u'Период', u'%s - %s' % (c.start_date.strftime('%d.%m.%Y'), c.end_date.strftime('%d.%m.%Y'))),
            (u'Категория', c.get_category_display()),
        ]
