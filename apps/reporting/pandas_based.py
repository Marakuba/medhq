# -*- coding: utf-8 -*-

from django.db import connection
from django import forms
from django.template import Template, Context


import pandas as pd
import numpy as np

try:
    from collections import OrderedDict
except:
    from ordereddict import OrderedDict  #@Reimport


class Config(object):
    """
    """

    def __init__(self, source, header, *args, **kwargs):
        self.source = source
        self.header = header
        self.totals = kwargs.get('totals', None)
        self.opts = kwargs

    def __call__(self, report, **kwargs):
        results, cols = self.prep_data(report)

        if not results:
            return []
        na = self.opts.get('na', '0')
        df = pd.DataFrame(results, columns=cols).fillna(na)

        self.series = OrderedDict()

        for col in df:
            self.series[col] = [df[col]]

        # for cfg in self.values:
        #     if isinstance(cfg, basestring):
        #         cfg = {
        #             'values': cfg,
        #             'aggfunc': np.sum
        #         }
        #     p = pd.pivot_table(df,
        #         values=cfg['values'],
        #         rows=self.rows,
        #         cols=self.cols,
        #         aggfunc=cfg['aggfunc'])

        #     self.series[cfg['values']] = []
        #     for col in p:
        #         self.series[cfg['values']].append(p[col].fillna(na))

        results = {
            'data': self.header(self),
            'totals': None
        }

        # if self.totals:
        #     results['totals'] = self.totals(self)

        return results

    def prep_data(self, report, *args, **kwargs):
        return self.source(self, report, **kwargs)


class GroupingConfig(object):
    """
    """

    def __init__(self, *args, **kwargs):
        pass


class PivotConfig(Config):
    """
    """

    def __init__(self, source, rows, cols, values, header, *args, **kwargs):
        self.source = source
        self.rows = rows
        self.cols = cols
        self.values = values
        self.header = header
        if 'totals' in kwargs:
            self.totals = kwargs['totals']
            del kwargs['totals']
        else:
            self.totals = None
        self.opts = kwargs

    def __call__(self, report, **kwargs):
        results, cols = self.prep_data(report)
        if not results:
            return []
        na = self.opts.get('na', '0')
        df = pd.DataFrame(results, columns=cols).fillna(na)

        self.series = OrderedDict()

        for cfg in self.values:
            if isinstance(cfg, basestring):
                cfg = {
                    'values': cfg,
                    'aggfunc': np.sum
                }
            p = pd.pivot_table(df,
                values=cfg['values'],
                rows=self.rows,
                cols=self.cols,
                aggfunc=cfg['aggfunc'])

            self.series[cfg['values']] = []
            for col in p:
                self.series[cfg['values']].append(p[col].fillna(na))

        results = {
            'data': self.header(self),
            'totals': self.totals and self.totals(self)
        }

        return results



        # p = pd.pivot_table(df,
        #     values='total_count',
        #     rows=['dep_name', 'state_name'],
        #     cols=['payment_type', ],
        #     aggfunc=np.sum)

        # for col in p.fillna('0'):
        #     series.append(p[col])

        # p2 = pd.pivot_table(df,
        #     values='total_price',
        #     rows=['dep_name', 'state_name'],
        #     cols=['payment_type', ],
        #     aggfunc=np.sum)

        # for col in p2.fillna('0'):
        #     series.append(p2[col])

        # df2 = pd.DataFrame(series).fillna('0')

        # data = []

        # for k, v in df2.iteritems():
        #     row = []
        #     row.extend(list(k))
        #     row.extend(list(v.values))
        #     data.append(row)

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
        self.attrs = attrs
        self.current = 0
        self.high = len(row) - 1

    def __iter__(self):
        return self

    def next(self):
        if self.current > self.high:
            raise StopIteration
        else:
            self.current += 1
            c = self.current - 1
            return DataCell(self.row[c], self.attrs[c])


class Header(object):
    """
    """
    def __init__(self, *args, **kwargs):
        self.headers = args

    def __call__(self, config):
        self.columns = []
        self.config = config

        data = {}

        for k, series in self.config.series.iteritems():
            for val in series:
                key = "%s_%s" % (k, val.name)
                data[key] = val
                # print dir(val.index)
                # for ix, vals in val.iteritems():
                #     print type(ix)

        self.df = pd.DataFrame(data)

        # print [ix[1] for ix in df.index.values][0]

        for header in self.headers:
            self.columns.extend(header(self))

        columns = [col[0][0] for col in self.columns]

        data = [col[1] for col in self.columns]

        data = dict(zip(columns, data))

        attrs = [col[2] for col in self.columns]
        # print index

        # pprint.pprint(self.columns)

        self.results = pd.DataFrame(data, columns=columns)

        return [DataRow(row, attrs) for ix, row in self.results.iterrows()]


class PivotRows(object):
    """
    """
    def __init__(self, titles=None):
        self.titles = titles or {}

    def __call__(self, header):
        result = []
        for n in header.df.index.names:
            title = self.titles.get(n, None)
            row = PivotRow(n, title)
            result.extend(row(header))
        return result


class PivotRow(object):
    """
    """
    def __init__(self, row, title=None):
        self.row = row
        self.title = title or row

    def __call__(self, header):
        vals = header.df.index.values
        try:
            i = header.df.index.names.index(self.row)
            return [[
                [self.row, self.title],
                [ix[i] for ix in vals],
                {}
            ]]
        except ValueError:
            pass
        return []


class PivotResults(object):
    """
    """
    def __init__(self):
        pass

    def __call__(self, header):
        result = []
        return result


class PivotResult(object):
    """
    """
    def __init__(self, row, title=None, aliases=None, attrs=None):
        self.row = row
        self.title = title or row
        self.aliases = aliases or {}
        self.attrs = attrs or {}

    def __call__(self, header):
        result = []
        sr = header.config.series[self.row]
        for i, s in enumerate(sr):
            # print "%s_%s" % (self.row, s.name)
            result.append([
                [u'%s_%s' % (self.row, i), (self.title, self.aliases.get(s.name, s.name))],
                list(s.values),
                self.attrs
            ])
        return result


class Column(object):
    """
    """
    renderer = lambda v, row: v

    def __init__(self, col, title=None, attrs=None, renderer=None):
        self.col = col
        self.title = title
        self.attrs = attrs or {}
        if renderer:
            self.renderer = renderer

    def __call__(self, header):
        result = []
        sr = header.config.series[self.col]
        for i, s in enumerate(sr):
            # print "%s_%s" % (self.col, s.name)
            # print list(s.values)
            result.append([
                [u'%s_%s' % (self.col, i), (self.title, )],
                list(s.values),
                self.attrs
            ])
        return result


class SqlDataSource(object):
    """
    """
    def __init__(self, query, **kwargs):
        self.query = query

    def __call__(self, config, report, **kwargs):
        cursor = connection.cursor()
        cursor.execute(self.prep_query(report.filters))
        desc = cursor.description
        cols = [col[0] for col in desc]
        results = cursor.fetchall()
        cursor.close()
        return results, cols

    def prep_query(self, filters=None):
        self.filters = filters or {}

        t = Template(self.query)
        c = Context(self.filters)
        query = t.render(c)
        return query


class ConfigDataSource(object):
    """
    """
    def __init__(self, config, **kwargs):
        pass

    def get(self):
        pass


class Total(object):
    """
    """
    def __init__(self, column, *args, **kwargs):
        self.column = column
        self.aggfunc = kwargs.get('aggfunc', np.sum)

    def __call__(self, config):
        #print config.header.results[self.column].sum()
        pass


class Totals(object):
    """
    """

    def __init__(self, *args, **kwargs):
        self.position = kwargs.get('position', 'top')
        self.totals = []
        for total in args:
            if isinstance(total, basestring):
                self.totals.append(Total(total))
            elif isinstance(total, Total):
                self.totals.append(total)
            else:
                continue

    def __call__(self, config):
        for total in self.totals:
            total(config)


class Results(object):
    """
    """

    def __init__(self, report, *args, **kwargs):

        self.report = report
        self.config = self.report.config(self.report, *args, **kwargs)

        self.report.results = self.config['data']
        self.report.totals = self.config['totals']


class PandasReport(object):
    """
    """

    config = None

    def __init__(self, *args, **kwargs):
        """
        """
        self.request = 'request' in kwargs and kwargs['request'] or None
        if 'formclass' in kwargs:
            self.formclass = kwargs['formclass']
        self.build_filters(*args, **kwargs)

        # entry point
        Results(self, *args, **kwargs)

        # self.results = self.config(self, *args, **kwargs)

    def build_filters(self, *args, **kwargs):
        if 'filters' in kwargs:
            self.filters = kwargs['filters']
        elif 'request_filters' in kwargs:
            if not self.request:
                raise Exception('Request instance must be specified!')
            r = getattr(self.request, kwargs['request_filters'])
            params = dict(r.items())
            self.filters = dict(filter(lambda x: x[1] is not u'', params.items()))
        else:
            self.filters = {}

        if self.formclass:
            form = self.formclass(self.filters)
            if not form.is_valid():
                raise Exception('Filter data is not valid!')

    def filter_legend(self):
        if not self.formclass:
            return []

        form = self.formclass(self.filters)
        dh = []
        for field_id, field in form.fields.items():
            dh.append((field_id, field.label))

        np = []
        for key, values in self.filters.items():
            if isinstance(form.fields[key], forms.ChoiceField):
                d = dict(form.fields[key].choices)
                params = self.filters[key]
                if isinstance(form.fields[key], forms.ModelChoiceField):
                    params = int(params)
                np.append((key, d.get(params)))
            else:
                np.append((key, self.filters[key]))

        return self.chkeys(dict(np), dict(dh)).items()

    def chkeys(self, d1, d2):
        return dict((d2[key], value) for (key, value) in d1.items())
