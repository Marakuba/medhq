# -*- coding: utf-8 -*-


from django import forms


class Results(object):
    """
    """

    def __init__(self, report, *args, **kwargs):

        self.report = report
        self.config = self.report.config(self.report, *args, **kwargs)

        self.report.results = self.config.get('data')
        self.report.totals = self.config.get('totals')


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
