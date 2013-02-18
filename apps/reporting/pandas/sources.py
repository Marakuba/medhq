# -*- coding: utf-8 -*-

from django.db import connection
from django.template import Template, Context

import pandas as pd


class BaseSource(object):
    """
    """
    def __init__(self, prep_data_func=None, **kwargs):
        self.params = kwargs.get('params', [])
        self.prep_data_func = prep_data_func

    def __call__(self, config, report, **kwargs):
        if self.prep_data_func:
            rows, columns = self.prep_data_func(config, report, **kwargs)
        else:
            rows, columns = self.prep_data(config, report, **kwargs)
        if not rows:
            return None
        df = pd.DataFrame.from_records(rows, columns=columns, coerce_float=True)
        return df

    def prep_data(self, config, report, **kwargs):
        """
        """
        raise Exception("Must be implemented or prep_data_func pass")


class SqlDataSource(BaseSource):
    """
    """
    def prep_data(self, config, report, **kwargs):
        cursor = connection.cursor()
        cursor.execute(self.prep_query(report.filters), self.params)
        desc = cursor.description
        columns = [col[0] for col in desc]
        rows = cursor.fetchall()
        cursor.close()

        return rows, columns

    def prep_query(self, filters=None):
        query = self.params.get('query')
        self.filters = filters or {}
        t = Template(query)
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
