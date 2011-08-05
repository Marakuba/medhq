# -*- coding: utf-8 -*-

from django.db.models.aggregates import Count, Sum
from visit.models import OrderedService, Visit
from reporting import register, Report
from visit.settings import PAYMENT_TYPES
from visit.forms import CashReportForm, LabReportForm
from django.conf import settings

class VrachReport(Report):
    verbose_name = u'Врач - количество,сумма..'
    query_str = "\
SELECT \
  Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'., '||Tpstf.title as staff, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum,  \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
 %s\
GROUP BY \
  Tstaff.last_name ,Tstaff.first_name ,Tstaff.mid_name, Tpstf.title \
ORDER BY \
    staff " % (Report.base_wuery_from_where)
    #..
    
    def make(self,results):

        ttv = results
        #...
        t = []
        t.append(ttv)
        t.append(sum(map(lambda x: x[1],ttv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],ttv)))                  #results.0.2
#        t.append(sum(map(lambda x: x[3],ttv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],ttv)))                  #results.0.2
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),ttv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt
    
class VrachRefrlPntUslReport(Report):
    verbose_name = u'<<Врач - Кто направил>> - пациент,услуга..'
    query_str = "\
SELECT \
  Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'., '||Tpstf.title as staff, \
  Trefrl.name as refrl, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt,    \
  Tpolis.number as polis, \
  Tvis.id as num, \
  Tserv.id ||' - '||Tserv.name as serv, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
 %s \
GROUP BY \
  Tstaff.last_name ,Tstaff.first_name ,Tstaff.mid_name, Tpstf.title \
  ,Trefrl.name \
  ,Tvis.created \
  ,Tpolis.number \
  ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tserv.id \
  ,Tserv.name \
ORDER BY  \
    staff, refrl, created, pnt, polis ,num ,serv" % (Report.base_wuery_from_where)
    #..
    
    def make(self,results):

        #
        vl = self.struct(results)
        #..
        for f1 in vl:
            f1[1] = self.struct(f1[1])

        ttv = map(lambda x:[
                x[0]   
#                ,'Oplata'
                ,sum(map(lambda x: sum(map(lambda x:x[5],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[6],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:0 if x[7] == None else x[7],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[6] - (0 if x[7] == None else x[7]),x[1])) ,x[1]))                
                ,map(lambda x: [
                    x[0]
#                    ,'Mesto'
                    ,sum(map(lambda x:x[5],x[1]))
                    ,sum(map(lambda x:x[6],x[1]))
                    ,sum(map(lambda x:0 if x[7] == None else x[7],x[1]))
                    ,sum(map(lambda x:x[6] - (0 if x[7] == None else x[7]),x[1]))
                    ,x[1]
                    ]
                ,x[1])
            ]
        ,vl)
        
        #...
        t = []
        t.append(ttv)
        t.append(sum(map(lambda x: x[1],ttv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],ttv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],ttv)))                  #results.0.2
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),ttv)))                  #results.0.3
        tt = []
        tt.append(t)
        return tt

class VrachPntUslReport(Report):
    verbose_name = u'<< Врач >> - пациент,услуга..'
    query_str = "\
SELECT \
  Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'., '||Tpstf.title as staff, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt,    \
  Tpolis.number as polis, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tserv.id ||' - '||Tserv.name as serv, \
  TTvis.price as price, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
 %s \
GROUP BY \
  Tstaff.last_name ,Tstaff.first_name ,Tstaff.mid_name, Tpstf.title \
  ,Tvis.created \
  ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tpolis.number \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price \
ORDER BY  \
    staff,pnt,polis, created ,num ,serv" % (Report.base_wuery_from_where)
    #..
    
    def make(self,results):
        #..
        vl = self.struct(results)
        #..
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[6],x[1]))  # gr.1
            ,sum(map(lambda y: y[7],x[1]))  # gr.2
            ,sum(map(lambda y: 0 if y[8] == None else y[8],x[1]))  # gr.2
            ,sum(map(lambda y: y[7] - (0 if y[8] == None else y[8]),x[1]))  # gr.2
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),tvv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt
    

class StaffDailyReport(Report):
    verbose_name = u'Отчет за смену'
    query_str = "\
SELECT \
  Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'.' as staff, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt,    \
  Tpolis.number as polis, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tserv.name as serv, \
  TTvis.price as price, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price, \
  Tvis.payment_type \
 %s  \
GROUP BY \
  Tstaff.last_name ,Tstaff.first_name ,Tstaff.mid_name \
  ,Tvis.created \
  ,Tvis.id \
  ,Tvis.payment_type \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tpolis.number \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price \
ORDER BY  \
    staff,pnt,polis, created ,num ,serv" % (Report.base_wuery_from_where)
    #..
    
    
    def make(self,results):
        #..
        
        vl = self.struct(results)
        print vl
        #..
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[6],x[1]))  # gr.1
            ,sum(map(lambda y: y[7],x[1]))  # gr.2
            ,sum(map(lambda y: 0 if y[8] == None else y[8],x[1]))  # gr.2
            ,sum(map(lambda y: y[7] - (0 if y[8] == None else y[8]),x[1]))
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[4],tvv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt
    




class RreferalUslSumReport(Report):
    verbose_name = u'<<Кто направил>> - услуга,колич.,сумма,15%, 20% (без УЗИ)'
    query_str = "\
SELECT \
  Trefrl.name as refrl, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum,  \
  round(sum(TTvis.count*TTvis.price*0.15),2) as s15,\
  round(sum(TTvis.count*TTvis.price*0.20),2) as s20, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s %s \
GROUP BY \
  Trefrl.name  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY  \
   serv ,cost " % (Report.base_wuery_from_where,Report.bq_notexists_uzi)
    #..
    
    def make(self,results):

        vl = self.struct(results)
        #...
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[2],x[1]))  # gr.1
            ,sum(map(lambda y: y[3],x[1]))  # gr.2
            ,sum(map(lambda y: y[4],x[1]))  # gr.3
            ,sum(map(lambda y: y[5],x[1]))  # gr.4
            ,sum(map(lambda y: 0 if y[6] == None else y[6],x[1]))  # gr.4
            ,sum(map(lambda y: y[3] - (0 if y[6] == None else y[6]),x[1]))  # gr.4
            ,x[1:]                          # gr.5!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[3],tvv)))                  #results.0.3
        t.append(sum(map(lambda x: x[4],tvv)))                  #results.0.4
        t.append(sum(map(lambda x: 0 if x[5] == None else x[5],tvv)))                  #results.0.4
        t.append(sum(map(lambda x: x[2] - (0 if x[5] == None else x[5]),tvv)))                  #results.0.4
        tt = []
        tt.append(t)
        return tt

class RreferalUslSumReportOnlyUZI(Report):
    verbose_name = u'<<Кто направил>> - услуга,колич.,сумма,10% (только УЗИ)'
    query_str = "\
SELECT \
  Trefrl.name as refrl, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum,  \
  round(sum(TTvis.count*TTvis.price*0.10),2) as s10, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s %s \
GROUP BY \
  Trefrl.name  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY  \
   serv ,cost " % (Report.base_wuery_from_where,Report.bq_exists_uzi)
    #..
    
    def make(self,results):

        vl = self.struct(results)
        #...
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[2],x[1]))  # gr.1
            ,sum(map(lambda y: y[3],x[1]))  # gr.2
            ,sum(map(lambda y: y[4],x[1]))  # gr.3
            ,sum(map(lambda y: 0 if y[5] == None else y[5],x[1]))  # gr.3            
            ,sum(map(lambda y: y[3] - (0 if y[5] == None else y[5]),x[1]))  # gr.3            
            ,x[1:]                          # gr.5!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[3],tvv)))                  #results.0.3
        t.append(sum(map(lambda x: 0 if x[4] == None else x[4],tvv)))                  #results.0.3
        t.append(sum(map(lambda x: x[2] - (0 if x[4] == None else x[4]),tvv)))                  #results.0.3
        tt = []
        tt.append(t)
        return tt

class RreferalUslSumReportOnlyLAB(RreferalUslSumReport):
    verbose_name = u'<<Кто направил>> - услуга,колич.,сумма,15%, 20% (только Лаборатория)'
    query_str = "\
SELECT \
  Trefrl.name as refrl, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum,  \
  round(sum(TTvis.count*TTvis.price*0.15),2) as s15,\
  round(sum(TTvis.count*TTvis.price*0.20),2) as s20, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s %s\
GROUP BY \
  Trefrl.name  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY  \
   serv ,cost " % (Report.base_wuery_from_where,Report.bq_exists_lab)
#YYYY-MM-DD HH24:MI
#  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
class PaymentPatientReport(Report):
    verbose_name = u'<<Форма оплаты>> - дата,№,пациент,услуга,кол-во, сумма'
    query_str = "\
SELECT \
  Tvis.payment_type as pmt, \
  to_char(Tvis.created,'DD-MM-YYYY') as created, \
  Tvis.id as num, \
  Tpnt.last_name ||' '|| Tpnt.first_name || ' ' || Tpnt.mid_name || ' ' as pnt, \
  Tserv.id ||' - '||Tserv.name as serv, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Tvis.payment_type \
  ,Tvis.created \
 ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tserv.id \
  ,Tserv.name \
ORDER BY \
   pmt ,created ,pnt ,serv " % (Report.base_wuery_from_where)

    def make(self,results):
        #..
        vl = self.struct_and_chkeys(results,dict(PAYMENT_TYPES))
        #..
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[4],x[1]))  # gr.1
            ,sum(map(lambda y: y[5],x[1]))  # gr.2
            ,sum(map(lambda y: 0 if y[6] == None else y[6],x[1]))  # gr.2
            ,sum(map(lambda y: y[5] - (0 if y[6] == None else y[6]),x[1]))  # gr.2
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),tvv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt   

class PlaceFilialPatientReport(Report):
    verbose_name = u'<<Место выполнения (филиал)>> - дата,№,пациент,услуга,кол-во, сумма'
    query_str = "\
SELECT \
  Tstate.name as place, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tserv.id ||' - '||Tserv.name as serv, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Tstate.name \
  ,Tvis.created \
 ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tserv.id \
  ,Tserv.name \
ORDER BY \
   place ,created ,pnt ,serv " % (Report.base_wuery_from_where)

    def make(self,results):
        #..
        vl = self.struct(results)
        #..
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[4],x[1]))  # gr.1
            ,sum(map(lambda y: y[5],x[1]))  # gr.2
            ,sum(map(lambda y: 0 if y[6] == None else y[6],x[1]))  # gr.2
            ,sum(map(lambda y: y[5] - (0 if y[6] == None else y[6]),x[1]))  # gr.2
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),tvv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt    

class PlaceOfficePatientReport(PlaceFilialPatientReport):
    verbose_name = u'<<Место выполнения (ОФИС)>> - дата,№,пациент,услуга,кол-во, сумма'
    query_str = "\
SELECT \
  Tstgr.name as place, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tserv.id ||' - '||Tserv.name as serv, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Tstgr.name \
  ,Tvis.created \
 ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tserv.id \
  ,Tserv.name \
ORDER BY \
   place ,created ,pnt ,serv " % (Report.base_wuery_from_where)

class PatientPlaceFilialUslSumReport(Report):
    verbose_name = u'<<Пациент - Место выполнения (филиал)>> - дата, № приема, услуга, колич., цена, сумма'
    query_str = "\
SELECT \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tstate.name as place, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name   \
  ,Tstate.name  \
  ,Tvis.created \
  ,Tvis.id  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY \
  place, pnt, created, num, serv, cost " % (Report.base_wuery_from_where)
   #..
   
    def make(self,results):

        #
        vl = self.struct(results)
        #..
        for f1 in vl:
            f1[1] = self.struct(f1[1])

        ttv = map(lambda x:[
            vl.index(x)+1
            ,x[0]   
            ,sum(map(lambda x: sum(map(lambda x:x[4],x[1])) ,x[1]))                
            ,sum(map(lambda x: sum(map(lambda x:x[5],x[1])) ,x[1]))                
            ,sum(map(lambda x: sum(map(lambda x:0 if x[6] == None else x[6],x[1])) ,x[1]))                
            ,sum(map(lambda x: sum(map(lambda x:x[5] - (0 if x[6] == None else x[6]),x[1])) ,x[1]))                
            ,map(lambda x: [
                x[0]
                ,sum(map(lambda x:x[4],x[1]))
                ,sum(map(lambda x:x[5],x[1]))
                ,sum(map(lambda x:0 if x[6] == None else x[6],x[1]))
                ,sum(map(lambda x:x[5] - (0 if x[6] == None else x[6]),x[1]))
                ,x[1]
                ]
            ,x[1])
        ],vl)
        
        return {
            'list': ttv,
            'totalcount':sum(map(lambda x: x[2],ttv)),
            'totalsum':sum(map(lambda x: x[3],ttv)),
            'totaldisc':sum(map(lambda x: 0 if x[4] == None else x[4],ttv)),
            'total':sum(map(lambda x: x[3] - (0 if x[4] == None else x[4]),ttv))
        }
        

class PatientPlaceFilialUslSumLabOnlyReport(Report):
    verbose_name = u'<<Пациент - Место выполнения (филиал), только лаборатория>> - дата, № приема, услуга, колич., цена, сумма'
    query_str = "\
SELECT \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tstate.name as place, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s %s \
GROUP BY \
  Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name   \
  ,Tstate.name  \
  ,Tvis.created \
  ,Tvis.id  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY \
  place, pnt, created, num, serv, cost " % (Report.base_wuery_from_where, Report.bq_exists_lab)
   #..
   
    def make(self,results):

        #
        vl = self.struct(results)
        #..
        for f1 in vl:
            f1[1] = self.struct(f1[1])

        ttv = map(lambda x:[
            vl.index(x)+1
            ,x[0]   
            ,sum(map(lambda x: sum(map(lambda x:x[4],x[1])) ,x[1]))                
            ,sum(map(lambda x: sum(map(lambda x:x[5],x[1])) ,x[1]))                
            ,sum(map(lambda x: sum(map(lambda x:0 if x[6] == None else x[6],x[1])) ,x[1]))                
            ,sum(map(lambda x: sum(map(lambda x:x[5] - (0 if x[6] == None else x[6]),x[1])) ,x[1]))                
            ,map(lambda x: [
                x[0]
                ,sum(map(lambda x:x[4],x[1]))
                ,sum(map(lambda x:x[5],x[1]))
                ,sum(map(lambda x:0 if x[6] == None else x[6],x[1]))
                ,sum(map(lambda x:x[5] - (0 if x[6] == None else x[6]),x[1]))
                ,x[1]
                ]
            ,x[1])
        ],vl)
        
        return {
            'list': ttv,
            'totalcount':sum(map(lambda x: x[2],ttv)),
            'totalsum':sum(map(lambda x: x[3],ttv)),
            'totaldisc':sum(map(lambda x: 0 if x[4] == None else x[4],ttv)),
            'total':sum(map(lambda x: x[3] - (0 if x[4] == None else x[4]),ttv)) 
        }


class PatientPlaceOfficeUslSumReport(PatientPlaceFilialUslSumReport):
    verbose_name = u'<<Пациент - Место выполнения (ОФИС)>> - дата, № приема, услуга, колич., цена, сумма'
    query_str = "\
SELECT \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tstgr.name as place, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name   \
  ,Tstgr.name  \
  ,Tvis.created \
  ,Tvis.id  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY \
  place, pnt, created, num, serv, cost " % (Report.base_wuery_from_where)
  
  

class PatientPlaceOfficeUslSumLabOnlyReport(PatientPlaceFilialUslSumReport):
    verbose_name = u'<<Пациент - Место выполнения (ОФИС)>> - дата, № приема, услуга, колич., цена, сумма'
    query_str = "\
SELECT \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tstgr.name as place, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s %s \
GROUP BY \
  Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name   \
  ,Tstgr.name  \
  ,Tvis.created \
  ,Tvis.id  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY \
  place, pnt, created, num, serv, cost " % (Report.base_wuery_from_where, Report.bq_exists_lab)
#-------------------------------------------------------------------------------

class PaymentPlaceServReport(Report):
    verbose_name = u'Форма оплаты - Место выполнения - Услуга'
    query_str = "SELECT \
          Tvis.payment_type as pmt, \
          Tstate.name as state, \
          Tserv.id ||' - '||Tserv.name as serv, \
          TTvis.price as cost, \
          sum(TTvis.count) as cnt, \
          sum(TTvis.count * TTvis.price) as sum, \
          round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
          sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
        % s \
        group by \
          Tvis.payment_type,Tstate.name,Tserv.id,TTvis.price,Tserv.name \
        order by \
           pmt,state,cost, serv" % (Report.base_wuery_from_where)
    #..

    
    def make(self,results):

        #
        vl = self.struct_and_chkeys(results,dict(PAYMENT_TYPES))
        #..
        for f1 in vl:
            f1[1] = self.struct(f1[1])

        ttv = map(lambda x:[
                x[0]   
#                ,'Oplata'
                ,sum(map(lambda x: sum(map(lambda x:x[2],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[3],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:0 if x[4] == None else x[4],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[3] - (0 if x[4] == None else x[4]),x[1])) ,x[1]))                
                ,map(lambda x: [
                    x[0]
#                    ,'Mesto'
                    ,sum(map(lambda x:x[2],x[1]))
                    ,sum(map(lambda x:x[3],x[1]))
                    ,sum(map(lambda x:0 if x[4] == None else x[4],x[1]))
                    ,sum(map(lambda x:x[3] - (0 if x[4] == None else x[4]),x[1]))
                    ,x[1]
                    ]
                ,x[1])
            ]
        ,vl)
        
        #...
        t = []
        t.append(ttv)
        t.append(sum(map(lambda x: x[1],ttv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],ttv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],ttv)))                  #results.0.2
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),ttv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt

class PaymentRefrlSPReport(Report):
    verbose_name = u'Форма оплаты - Кто направил - Пациент,Услуга'
    query_str = "\
SELECT \
  Tvis.payment_type as pmt, \
  Trefrl.name as refrl, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tserv.id ||' - '||Tserv.name as serv, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Tvis.payment_type \
  ,Trefrl.name \
  ,Tvis.created \
 ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tserv.id \
  ,Tserv.name \
ORDER BY \
   pmt \
,  refrl \
  ,created ,pnt ,serv " % (Report.base_wuery_from_where)

    def make(self,results):

        #
        vl = self.struct_and_chkeys(results,dict(PAYMENT_TYPES))
        #..
        for f1 in vl:
            f1[1] = self.struct(f1[1])

        ttv = map(lambda x:[
                x[0]   
#                ,'Oplata'
                ,sum(map(lambda x: sum(map(lambda x:x[4],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[5],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:0 if x[6] == None else x[6],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[5] - (0 if x[6] == None else x[6]),x[1])) ,x[1]))                
                ,map(lambda x: [
                    x[0]
#                    ,'Mesto'
                    ,sum(map(lambda x:x[4],x[1]))
                    ,sum(map(lambda x:x[5],x[1]))
                    ,sum(map(lambda x:0 if x[6] == None else x[6],x[1]))
                    ,sum(map(lambda x:x[5] - (0 if x[6] == None else x[6]),x[1]))
                    ,x[1]
                    ]
                ,x[1])
            ]
        ,vl)
        
        #...
        t = []
        t.append(ttv)
        t.append(sum(map(lambda x: x[1],ttv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],ttv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],ttv)))                  #results.0.2        
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),ttv)))                  #results.0.2        
        tt = []
        tt.append(t)
        return tt

class PaymentRefrlSPReport2(PaymentRefrlSPReport):
    query_str = "\
SELECT \
  Tvis.payment_type as pmt, \
  Trefrl.name as refrl, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tvis.id as num, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tserv.id ||' - '||Tserv.name as serv, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
% s \
GROUP BY \
  Tvis.payment_type \
  ,Trefrl.name \
  ,Tvis.created \
 ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tserv.id \
  ,Tserv.name \
ORDER BY \
   pmt \
,  refrl \
  ,pnt \
  ,num \
  ,created \
  ,serv "    % (Report.base_wuery_from_where)
        
class PriceDinamicReport(Report):
    verbose_name = u'Динамика цен по услугам'
    query_str = "\
SELECT \
Tserv.id ||' - '|| Tserv.name,        \
Tpr.on_date , \
Tstate.name, \
Tpr.price_type, \
(select             \
	t2.value         \
	from             \
	public.pricelist_price t2       \
	where         \
	t2.on_date = (select         \
		max(t1.on_date)         \
		from         \
		public.pricelist_price t1         \
		where             \
		t1.on_date < Tpr.on_date             \
		and t1.extended_service_id  = Tpr.extended_service_id \
		and t1.price_type = Tpr.price_type \
	)         \
	and t2.extended_service_id  = Tpr.extended_service_id \
	and t2.price_type = Tpr.price_type LIMIT 1) as costbefor,       \
Tpr.value      \
FROM       \
public.service_baseservice Tserv        \
join public.service_extendedservice Texserv on Texserv.base_service_id = Tserv.id \
join public.pricelist_price Tpr on Tpr.extended_service_id = Texserv.id         \
join public.state_state Tstate on Tstate.id = Texserv.state_id \
WHERE        \
to_char(Tpr.on_date,'YYYY-MM-DD') BETWEEN '%s' and '%s'            \
%s \
order by         \
Tserv.name,Tpr.on_date "

    #..

    def prep_query_str(self):    
        s_price_type = ''
        if str(self.params['price_type']) is not '':
            s_price_type = "and Tpr.price_type = '%s'"% (self.params['price_type'])

        return self.query_str % (self.params['start_date'],self.params['end_date'],s_price_type)    
    
    def make(self,results):
        tv = map(lambda x: [x[0],x[1:]],results)
        #..
        d = {}
        for k, v in tv:
            d.setdefault(k, []).append(v)

        return self.sort(d)


#------------------------------------------------------------------------------

class VrachiUslSumReport(Report):
    verbose_name = u'Врачи - Услуги - Сумма'
    query_str = " \
SELECT \
  Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'., '||Tpstf.title as staff, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt,  \
  sum(TTvis.count * TTvis.price) as sum,  \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Tstaff.last_name ,Tstaff.first_name ,Tstaff.mid_name, Tpstf.title \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY \
   serv \
   ,cost " % (Report.base_wuery_from_where)
    #..
   
    def make(self,results):

        vl = self.struct(results)
        #...
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[2],x[1]))  # gr.1
            ,sum(map(lambda y: y[3],x[1]))  # gr.2
            ,sum(map(lambda y: 0 if y[4] == None else y[4],x[1]))  # gr.2
            ,sum(map(lambda y: y[3] - (0 if y[4] == None else y[4]),x[1]))  # gr.2
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),tvv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt



class RefrlPntUslReport(Report):
    verbose_name = u'<<Кто направил - пациент >> дата,услуга..'
    query_str = "\
SELECT \
  Trefrl.name as refrl, \
  Tpnt.last_name ||' '|| Tpnt.first_name ||' ' ||Tpnt.mid_name||'' as pnt,     \
  Tpolis.number as polis, \
  Tvis.id as num, \
  to_char(Tvis.created,'DD-MM-YYYY') as created, \
  Tserv.id, \
  Tserv.name as serv,  \
  TTvis.price, \
  sum(TTvis.count) as cnt,  \
  sum(TTvis.count * TTvis.price) as sum,  \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Trefrl.name \
  ,Tpolis.number \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
    ,Tvis.id \
  ,Tvis.created \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price \
ORDER BY \
 refrl \
  ,pnt \
  ,polis \
  ,num \
  ,created \
   ,serv ,TTvis.price " % (Report.base_wuery_from_where)

    
    def make(self,results):

        #
        vl = self.struct(results)
        #..
        for f1 in vl:
            f1[1] = self.struct(f1[1])

        ttv = map(lambda x:[
                x[0]   
#                ,'Oplata'
                ,sum(map(lambda x: sum(map(lambda x:x[6],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[7],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:0 if x[8] == None else x[8],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[7] - (0 if x[8] == None else x[8]),x[1])) ,x[1]))                
                ,map(lambda x: [
                    x[0]
#                    ,'Mesto'
                    ,sum(map(lambda x:x[6],x[1]))
                    ,sum(map(lambda x:x[7],x[1]))
                    ,sum(map(lambda x:0 if x[8] == None else x[8],x[1]))
                    ,sum(map(lambda x:x[7] - (0 if x[8] == None else x[8]),x[1]))
                    ,x[1]
                    ]
                ,x[1])
            ]
        ,vl)
        
        #...
        t = []
        t.append(ttv)
        t.append(sum(map(lambda x: x[1],ttv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],ttv)))                  #results.0.2
        t.append(sum(map(lambda x: 0 if x[3] == None else x[3],ttv)))                  #results.0.2        
        t.append(sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),ttv)))                  #results.0.2        
        tt = []
        tt.append(t)
        return tt

class PatientUslSumReport(Report):
    verbose_name = u'<<Пациент>> - дата, № приема, услуга, колич., цена, сумма'
    query_str = "\
SELECT \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum, \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
%s \
GROUP BY \
  Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name   \
  ,Tvis.created \
  ,Tvis.id  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price  \
ORDER BY \
  pnt, created, num, serv, cost " % (Report.base_wuery_from_where)
   #..
   
    def make(self,results):
        #..
        vl = self.struct(results)
        #..
        tvv = map(lambda x: [
            vl.index(x)+1
            ,x[0]                            # gr.0
            ,sum(map(lambda y: y[4],x[1]))  # gr.1
            ,sum(map(lambda y: y[5],x[1]))  # gr.2
            ,sum(map(lambda y: 0 if y[6] == None else y[6],x[1]))  # gr.2
            ,sum(map(lambda y: y[5] - (0 if y[6] == None else y[6]),x[1]))  # gr.2
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        return {
            'list': tvv,
            'totalcount':sum(map(lambda x: x[2],tvv)),
            'totalsum':sum(map(lambda x: x[3],tvv)),
            'totaldisc':sum(map(lambda x: 0 if x[4] == None else x[4],tvv)),
            'total':sum(map(lambda x: x[3] - (0 if x[4] == None else x[4]),tvv)) 
        }

class KLCReestrReport(Report):
    verbose_name = u'Реестр по закупочным цена КЛЦ'
    query_str = "\
select \
q.created \
,q.pnt \
,q.serv \
,q.cost \
,sum(q.cnt) \
,sum(q.cnt*q.cost) \
from \
	(SELECT \
	Tvis.payment_type as pmt,    \
	to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created,    \
	Tvis.id as num,    \
	Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt,    \
	Tserv.id ||' - '||Tserv.name as serv,    \
	TTvis.count as cnt,    \
	(select  \
		t2.value  \
		from  \
		    public.pricelist_price t2  \
		where  \
		t2.on_date = (select  \
			    max(t1.on_date)  \
			from  \
			public.pricelist_price t1  \
			where  \
			    t1.on_date <=  Tvis.created  \
			    and t1.extended_service_id = Texserv.id  \
			    and t1.price_type = 'z' \
			)  \
		and t2.extended_service_id = Texserv.id  \
		and t2.price_type = 'z' \
	)as cost \
	FROM   public.visit_visit Tvis    \
	left outer join public.visit_orderedservice TTvis on TTvis.order_id = Tvis.id    \
	left outer join public.state_state Tstate on Tstate.id = TTvis.execution_place_id \
	left outer join public.service_baseservice Tserv on Tserv.id = TTvis.service_id    \
	left outer join public.staff_position Tpstf on Tpstf.id = TTvis.staff_id    \
	left outer join public.staff_staff Tstaff on  Tstaff.id = Tpstf.staff_id    \
	left outer join public.patient_patient Tpnt on Tpnt.id = Tvis.patient_id    \
	left outer join public.visit_referral Trefrl on Trefrl.id = Tvis.referral_id     \
	left outer join public.reporting_stategroup_state TTstgr on TTstgr.state_id = TTvis.execution_place_id    \
	left outer join public.reporting_stategroup Tstgr on Tstgr.id = TTstgr.stategroup_id    \
	left outer join public.patient_insurancepolicy Tpolis on Tpolis.id = Tvis.insurance_policy_id \
	left outer join public.service_extendedservice Texserv on Texserv.base_service_id = Tserv.id \
	WHERE   TTvis.count is not null and TTvis.price is not null  \
	and   to_char(Tvis.created,'YYYY-MM-DD') BETWEEN '%s' and '%s' \
  %s %s %s %s %s %s %s %s \
	ORDER BY    pmt ,created ,pnt ,serv  \
) q \
where \
q.cost > 0 \
group by  \
q.created \
,q.pnt \
,q.serv \
,q.cost \
order by  \
q.created \
,q.pnt \
,q.serv \
,q.cost " 
    #..
    
    def make(self,results):

        ttv = results
        #...
        t = []
        t.append(ttv)
        t.append(sum(map(lambda x: x[4],ttv)))                  #results.0.1
        t.append(sum(map(lambda x: x[5],ttv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt

class ServiceLabReport(Report):
    verbose_name = u'Услуги - количество,сумма..только по лаборатории'
    query_str = "\
SELECT \
  Tserv.id ||' - '||Tserv.name as serv, \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum , \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
 %s %s \
GROUP BY \
  Tserv.id \
  ,Tserv.name \
  ,TTvis.price \
ORDER BY \
sum(TTvis.count) desc \
   ,serv asc \
   ,cost " % (Report.base_wuery_from_where,Report.bq_exists_lab)
    #..
    
    def make(self,results):

        return {
            'list': results,
            'totalcount':sum(map(lambda x: x[2],results)),
            'totalsum':sum(map(lambda x: x[3],results)),
            'totaldisc':sum(map(lambda x: 0 if x[4] == None else x[4],results)),
            'total':sum(map(lambda x: x[3] - (0 if x[4] == None else x[4]),results)) 
        }

class ServiceWithoutLabReport(ServiceLabReport):
    verbose_name = u'Услуги - количество,сумма..все кроме лаборатории'
    query_str = "\
SELECT \
  Tserv.id ||' - '||Tserv.name as serv, \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum , \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
 %s %s \
GROUP BY \
  Tserv.id \
  ,Tserv.name \
  ,TTvis.price \
ORDER BY \
sum(TTvis.count * TTvis.price) desc \
,sum(TTvis.count) desc \
   ,serv asc \
   ,cost " % (Report.base_wuery_from_where,Report.bq_notexists_lab)
    #..

class ServiceLabGroupCount(Report):
    verbose_name = u'<<Группы услуг >> услуги - количество,сумма..'
    query_str = "\
SELECT \
Trepbsgp.name as grnam, \
  Tserv.id ||' - '||Tserv.name as serv, \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum , \
  round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as disc,  \
  sum(TTvis.count * TTvis.price) - round(sum(TTvis.count * TTvis.price * (Tvis.discount_value/100)),2) as clean_price \
 %s \
GROUP BY \
    Trepbsgp.name \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price \
ORDER BY \
sum(TTvis.count) desc \
   ,serv asc \
   ,cost " % (Report.base_wuery_from_where)
    #..
    
    def make(self,results):
        #..
        vl = self.struct(results)
        #..
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[2],x[1]))  # gr.1
            ,sum(map(lambda y: y[3],x[1]))  # gr.2
            ,sum(map(lambda y: 0 if y[4] == None else y[4],x[1]))  # gr.2
            ,sum(map(lambda y: y[3] - (0 if y[4] == None else y[4]),x[1]))  # gr.2
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        tvv.sort(key = lambda x: x[1],reverse=1)
        return {
            'list': tvv,
            'totalcount':sum(map(lambda x: x[1],tvv)),
            'totalsum':sum(map(lambda x: x[2],tvv)),
            'totaldisc':sum(map(lambda x: 0 if x[3] == None else x[3],tvv)),
            'total':sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),tvv)) 
        }

class ServiceLabGroupSumm(ServiceLabGroupCount):
    def make(self,results):
        #..
        vl = self.struct(results)
        #..
        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[2],x[1]))  # gr.1
            ,sum(map(lambda y: y[3],x[1]))  # gr.2
            ,sum(map(lambda y: 0 if y[4] == None else y[4],x[1]))  # gr.2
            ,sum(map(lambda y: y[3] - (0 if y[4] == None else y[4]),x[1]))  # gr.2
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        tvv.sort(key=lambda x: x[2],reverse=True)
        return {
            'list': tvv,
            'totalcount':sum(map(lambda x: x[1],tvv)),
            'totalsum':sum(map(lambda x: x[2],tvv)),
            'totaldisc':sum(map(lambda x: 0 if x[3] == None else x[3],tvv)),
            'total':sum(map(lambda x: x[2] - (0 if x[3] == None else x[3]),tvv))  
        }
register('vrachi', VrachReport) 
register('vrachi-usl-sum', VrachiUslSumReport) 
register('vrachi-refrl-pnt_usl', VrachRefrlPntUslReport) 
register('vrachi-pnt_usl', VrachPntUslReport) 
register('staff-daily', StaffDailyReport) 

register('patient-usl-sum', PatientUslSumReport)
register('patient-place_filial-usl-sum', PatientPlaceFilialUslSumReport)
register('patient-place_filial-usl-sum-lab-only', PatientPlaceFilialUslSumLabOnlyReport)
register('patient-place_office-usl-sum', PatientPlaceOfficeUslSumReport)
register('patient-place_office-usl-sum-lab-only', PatientPlaceOfficeUslSumLabOnlyReport)

register('referal-usl-sum', RreferalUslSumReport)
register('referal-usl-sum-uzi', RreferalUslSumReportOnlyUZI)
register('referal-usl-sum-lab', RreferalUslSumReportOnlyLAB)
register('referal-pnt_usl', RefrlPntUslReport)

register('payment-pnt-serv', PaymentPatientReport)
register('payment-place-serv', PaymentPlaceServReport)
register('payment-refrl-pnt_serv', PaymentRefrlSPReport)
register('payment-refrl-pnt_serv2', PaymentRefrlSPReport2)

register('place_filial-pnt-serv', PlaceFilialPatientReport)
register('place_office-pnt-serv', PlaceOfficePatientReport)

register('price-dinamic', PriceDinamicReport)
register('KLC-reestr', KLCReestrReport)

register('service_lab', ServiceLabReport) 
register('service_without_lab', ServiceWithoutLabReport)
register('service_lab_group_count', ServiceLabGroupCount)
register('service_lab_group_summ', ServiceLabGroupSumm)
