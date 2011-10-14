# -*- coding: utf-8 -*-

from django.db import connection

class SQLLogMiddleware:

    def process_response ( self, request, response ): 
        time = 0.0
        for q in connection.queries: #@UndefinedVariable
            time += float(q['time'])
        
        print "Queries count:",len(connection.queries) #@UndefinedVariable
        print "Time:", time
        print "Queries explain:"
        for q in connection.queries:
            print q
            print "--------------"

        return response