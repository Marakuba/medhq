# -*- coding: utf-8 -*-

from django.db import connection
from django.template import Template, Context

import pandas as pd


class SqlDataSource(object):
    """
    """
    def __init__(self, query, **kwargs):
        self.query = query
        self.params = kwargs.get('params', [])

    def __call__(self, config, report, **kwargs):
        cursor = connection.cursor()
        cursor.execute(self.prep_query(report.filters), self.params)
        desc = cursor.description
        columns = [col[0] for col in desc]
        rows = cursor.fetchall()
        cursor.close()

        if not rows:
            return None

        df = pd.DataFrame.from_records(rows, columns=columns, coerce_float=True)
        return df

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
