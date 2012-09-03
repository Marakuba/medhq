# -*- coding: utf-8 -*-

from django.db import connection
from django.http import HttpResponse
import logging

class SQLLogMiddleware:

    def process_response ( self, request, response ): 
        time = 0.0
        for q in connection.queries: #@UndefinedVariable
            time += float(q['time'])
        
        print "Queries count:",len(connection.queries) #@UndefinedVariable
        print "Time:", time
#        print "Queries explain:"
#        for q in connection.queries:
#            print q
#            print "--------------"

        return response
    

from datetime import datetime
import cProfile
import os
import StringIO

class InstrumentMiddleware(object):
    def process_request(self, request):
#        if 'profile' in request.REQUEST:
#            request.profiler = cProfile.Profile()
#            request.profiler.enable()
            
        request.profiler = cProfile.Profile()
        request.profiler.enable()

    def process_response(self, request, response):
        if hasattr(request, 'profiler'):
            request.profiler.disable()
            stamp = (request.META['REMOTE_ADDR'], datetime.now())
            request.profiler.dump_stats('/tmp/%s-%s.pro' % stamp)
            import pstats
            stream = StringIO.StringIO()
            stats = pstats.Stats('/tmp/%s-%s.pro' % stamp, stream=stream)
#            stats.strip_dirs()
            stats.sort_stats('time')
            stats.print_stats(12)
            stats.print_callers(12)
            stats.print_callees(12)
            os.remove('/tmp/%s-%s.pro' % stamp)
#            response._container[0] += "<pre>"+stream.getvalue()+"</pre>"
            f = open('/tmp/dump-%s-%s.pro' % stamp, 'w')
            f.writelines(stream.getvalue())
            stream.close()
        return response
    
