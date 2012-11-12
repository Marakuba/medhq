# -*- coding: utf-8 -*-

def none_to_empty(bundle):
    for k in bundle.data.keys():
        if bundle.data[k] is None:
            bundle.data[k] = ""
    return bundle
    