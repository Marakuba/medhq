# -*- coding: utf-8 -*-

"""
"""
from django.db import connection

def require_lock(*tables):
    def _lock(func):
        def _do_lock(*args,**kws):
            #lock tables
            cursor = connection.cursor()
            cursor.execute("LOCK TABLE %s " % ','.join(tables))
            try:
                result = func(*args,**kws)
            except Exception,e:
                raise Exception(e)
            else:
                return result
            finally:
                #unlock tables
                #cursor.execute("UNLOCK TABLE")
                if cursor:cursor.close()

        return _do_lock
    return _lock

'''
    example:

    @require_lock(table_A,table_B)
    fuc(args):
        pass
'''