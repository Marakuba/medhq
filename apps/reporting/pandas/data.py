# -*- coding: utf-8 -*-

import pandas as pd
import numpy as np


class Column(object):
    """
    """

    def_attrs = {}
    fillna = None

    def __init__(self, col, title=None, attrs=None, renderer=None, fillna=None):
        self.col = col
        self.title = title

        self.attrs = self.def_attrs.copy()
        if attrs:
            self.attrs.update(attrs)

        if fillna:
            self.fillna = fillna
        self.renderer = renderer

    def __call__(self, header):
        s = header.config.df[self.col]
        if self.fillna is not None:
            s = s.fillna(self.fillna)
        if self.renderer:
            s = s.apply(self.renderer)

        result = [
            [u'%s' % (self.col, ), (self.title, )],
            list(s.values),
            self.attrs
        ]

        return result


class NumberColumn(Column):
    """
    """
    fillna = 0
    def_attrs = {
        'class': 'number'
    }


class DataCell(object):
    """
    """
    def __init__(self, value, attrs, *args, **kwargs):
        self.value = value
        self._attrs = attrs

    def attrs(self):
        return " ".join([u'%s="%s"' % (a, v) for a, v in self._attrs.iteritems()])

    def __unicode__(self):
        return unicode(self.value)


class DataRow(object):
    """
    """
    def __init__(self, row, attrs, *args, **kwargs):
        self.row = list(row)
        self._attrs = attrs
        self.current = 0
        self.high = len(row) - 1
        self.row_attrs = kwargs.get('row_attrs', {})

    def __iter__(self):
        return self

    def next(self):
        if self.current > self.high:
            raise StopIteration
        else:
            self.current += 1
            c = self.current - 1
            return DataCell(self.row[c], self._attrs[c])

    def attrs(self):
        #  class="{% cycle 'row1' 'row2' %}"
        return " ".join([u'%s="%s"' % (a, v) for a, v in self.row_attrs.iteritems()])


class Header(object):
    """
    """
    def __init__(self, *args, **kwargs):
        self.headers = args

    def __call__(self, config):
        self.columns = []
        self.config = config

        for header in self.headers:
            self.columns.append(header(self))

        columns = [col[0][0] for col in self.columns]
        data = [col[1] for col in self.columns]
        data = dict(zip(columns, data))
        attrs = [col[2] for col in self.columns]

        df = pd.DataFrame(data, columns=columns)

        return df, attrs

    def __len__(self):
        return len(self.headers)


class Total(object):
    """
    """
    def __init__(self, column, *args, **kwargs):
        self.column = column
        self.aggfunc = kwargs.get('aggfunc', np.sum)
        self.attrs = kwargs.get('attrs', {'class': 'number'})

    def __call__(self, config):
        return self.aggfunc(config.df[self.column])


class Totals(object):
    """
    """

    def __init__(self, *args, **kwargs):
        self.label = kwargs.get('label', u'Итого:')
        self.label_attrs = kwargs.get('label_attrs', {})
        self.position = kwargs.get('position', 'top')
        self.auto_colspan = kwargs.get('auto_colspan', True)
        self.opts = kwargs
        self.totals = []
        for total in args:
            if isinstance(total, basestring):
                self.totals.append(Total(total))
            elif isinstance(total, Total):
                self.totals.append(total)
            else:
                continue

    def __call__(self, config):
        totals = [(total(config), total.attrs) for total in self.totals]
        data = [t[0] for t in totals]
        attrs = [t[1] for t in totals]
        if 'hide_label' not in self.opts:
            if self.auto_colspan and 'colspan' not in self.label_attrs:
                self.label_attrs['colspan'] = config.visible_cols_len() - len(self.totals)
            data.insert(0, self.label)
            attrs.insert(0, self.label_attrs)
        row = DataRow(data, attrs, row_attrs={'class': 'footer'})
        return row


class Group(object):
    """
    """

    def __init__(self, columns, agg=None, attrs=None, auto_colspan=True, **kwargs):
        self.columns = columns
        self.agg = agg or []
        self.attrs = attrs or {}
        self.auto_colspan = auto_colspan
        self.row_attrs = kwargs.get('row_attrs', {})
        self.opts = kwargs

    def __call__(self, config):
        pass

    def __len__(self):
        return len(self.columns)

    def get_funcs(self):
        cfg = dict([(agg.column, agg.aggfunc) for agg in self.agg])
        return cfg

    def get_attrs(self, config):
        if self.auto_colspan and 'colspan' not in self.attrs:
            self.attrs['colspan'] = len(config.header) - len(self.columns) - len(self.agg)
        return self.attrs


class Agg(object):
    """
    """

    def __init__(self, column, aggfunc=None, attrs=None, **kwargs):
        self.column = column
        self.aggfunc = aggfunc or np.sum
        self.attrs = attrs or {}
        self.opts = kwargs
