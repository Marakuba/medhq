# -*- coding: utf-8 -*-


import pandas as pd
import numpy as np

from .data import DataRow


class Config(object):
    """
    """

    def __init__(self, source, header, *args, **kwargs):
        self.source = source
        self.header = header
        self.totals = kwargs.get('totals', None)
        self.group_by = kwargs.get('group_by', None)
        self.opts = kwargs

    def __call__(self, report, **kwargs):
        self.df = self.source(self, report, **kwargs)

        if self.df is None:
            return {'data': None}

        df, attrs = self.header(self)

        data = []

        if self.group_by:

            grouped = df.groupby(self.group_by.columns)
            aggrs = grouped.agg(self.group_by.get_funcs())
            # print aggrs

            for name, group in grouped:

                row = [name]
                group_attrs = [self.group_by.get_attrs(self)]
                group_agg = aggrs.ix[name]
                for agg in self.group_by.agg:
                    row.append(group_agg[agg.column])
                    group_attrs.append(agg.attrs)

                data.append(DataRow(row, group_attrs, row_attrs=self.group_by.row_attrs))

                data.extend(self.get_plain_data(group.drop(self.group_by.columns, axis=1), attrs))

        else:
            data = self.get_plain_data(df, attrs)

        results = {
            'df': df,
            'data': data,
            'totals': None
        }

        if self.totals:
            results['totals'] = self.totals(self)
            if self.totals.position == 'top' or self.totals.position == 'both':
                results['data'].insert(0, results['totals'])
            elif self.totals.position == 'bottom' or self.totals.position == 'both':
                results['data'].append(results['totals'])

        return results

    def get_plain_data(self, df, attrs):

        return [DataRow(row, attrs) for ix, row in df.iterrows()]

    def visible_cols_len(self):
        cols = len(self.header)
        if self.group_by:
            cols -= len(self.group_by)
        return cols
