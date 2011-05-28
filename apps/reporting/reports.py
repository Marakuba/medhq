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
  Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'.' as staff, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum  \
 %s\
GROUP BY \
  Tstaff.last_name ,Tstaff.first_name ,Tstaff.mid_name \
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
        tt = []
        tt.append(t)
        return tt
    
class VrachRefrlPntUslReport(Report):
    verbose_name = u'<<Врач - Кто направил>> - пациент,услуга..'
    query_str = "\
SELECT \
  Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'.' as staff, \
  Trefrl.name as refrl, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt,    \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tserv.id ||' - '||Tserv.name as serv, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum \
 %s\
GROUP BY \
  Tstaff.last_name ,Tstaff.first_name ,Tstaff.mid_name \
  ,Trefrl.name \
  ,Tvis.created \
  ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tserv.id \
  ,Tserv.name \
ORDER BY  \
    staff, refrl ,created ,num ,pnt ,serv" % (Report.base_wuery_from_where)
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
                ,sum(map(lambda x: sum(map(lambda x:x[4],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[5],x[1])) ,x[1]))                
                ,map(lambda x: [
                    x[0]
#                    ,'Mesto'
                    ,sum(map(lambda x:x[4],x[1]))
                    ,sum(map(lambda x:x[5],x[1]))
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
  round(sum(TTvis.count*TTvis.price*0.20),2) as s20 \
%s %s\
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
            ,x[1:]                          # gr.5!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[3],tvv)))                  #results.0.3
        t.append(sum(map(lambda x: x[4],tvv)))                  #results.0.4
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
  round(sum(TTvis.count*TTvis.price*0.10),2) as s10 \
%s %s\
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
            ,x[1:]                          # gr.5!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        t.append(sum(map(lambda x: x[3],tvv)))                  #results.0.3
        tt = []
        tt.append(t)
        return tt

class PaymentPatientReport(Report):
    verbose_name = u'<<Форма оплаты>> - дата,№,пациент,услуга,кол-во, сумма'
    query_str = "\
SELECT \
  Tvis.payment_type as pmt, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt, \
  Tserv.id ||' - '||Tserv.name as serv, \
  sum(TTvis.count) as cnt, \
  sum(TTvis.count * TTvis.price) as sum \
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
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
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
  sum(TTvis.count * TTvis.price) as sum \
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
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
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
  sum(TTvis.count * TTvis.price) as sum \
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
  sum(TTvis.count * TTvis.price) as sum \
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
                x[0]   
#                ,'Oplata'
                ,sum(map(lambda x: sum(map(lambda x:x[4],x[1])) ,x[1]))                
                ,sum(map(lambda x: sum(map(lambda x:x[5],x[1])) ,x[1]))                
                ,map(lambda x: [
                    x[0]
#                    ,'Mesto'
                    ,sum(map(lambda x:x[4],x[1]))
                    ,sum(map(lambda x:x[5],x[1]))
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
        tt = []
        tt.append(t)
        return tt

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
  sum(TTvis.count * TTvis.price) as sum \
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
#-------------------------------------------------------------------------------

class PaymentPlaceServReport(Report):
    verbose_name = u'Форма оплаты - Место выполнения - Услуга'
    query_str = "SELECT \
          Tvis.payment_type as pmt, \
          Tstate.name as state, \
          Tserv.id ||' - '||Tserv.name as serv, \
          TTvis.price as cost, \
          sum(TTvis.count) as cnt, \
          sum(TTvis.count * TTvis.price) as sum \
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
                ,map(lambda x: [
                    x[0]
#                    ,'Mesto'
                    ,sum(map(lambda x:x[2],x[1]))
                    ,sum(map(lambda x:x[3],x[1]))
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
  sum(TTvis.count * TTvis.price) as sum \
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
                ,map(lambda x: [
                    x[0]
#                    ,'Mesto'
                    ,sum(map(lambda x:x[4],x[1]))
                    ,sum(map(lambda x:x[5],x[1]))
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
  sum(TTvis.count * TTvis.price) as sum \
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
    query_str = "SELECT \
      serv.id ||' - '|| serv.name, \
      pr.on_date , \
      prtype.name, \
      (select \
        t2.value \
        from \
            public.pricelist_price t2 \
      where \
        t2.on_date = (select \
            max(t1.on_date) \
        from \
        public.pricelist_price t1 \
        where \
            t1.on_date < pr.on_date \
            and t1.service_id = serv.id \
            and t1.type_id = pr.type_id \
        ) \
        and t2.service_id = serv.id \
        and t2.type_id = pr.type_id \
      )as costbefor,\
      pr.value \
    FROM \
      public.service_baseservice serv \
      join public.pricelist_price pr on pr.service_id = serv.id  \
      join public.pricelist_pricetype prtype on prtype.id = pr.type_id \
    WHERE  \
      to_char(pr.on_date,'YYYY-MM-DD') BETWEEN '%s' and '%s' \
      %s \
    order by \
        serv.name,pr.on_date"

    #..

    def prep_query_str(self):    
        s_price_type = ''
        if str(self.params['price_type']) is not '':
            s_price_type = 'and pr.type_id = %s'% (self.params['price_type'])

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
  Tstaff.last_name ||' '|| substr(Tstaff.first_name,1,1)||'.' ||substr(Tstaff.mid_name,1,1)||'.' as staff, \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price as cost, \
  sum(TTvis.count) as cnt,  \
  sum(TTvis.count * TTvis.price) as sum  \
%s \
GROUP BY \
  Tstaff.last_name ,Tstaff.first_name ,Tstaff.mid_name \
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
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt



class RefrlPntUslReport(Report):
    verbose_name = u'<<Кто направил>>  пациент,услуга..'
    query_str = "\
SELECT \
  Trefrl.name as refrl, \
  to_char(Tvis.created,'YYYY-MM-DD HH24:MI') as created, \
  Tvis.id as num, \
  Tpnt.last_name ||' '|| substr(Tpnt.first_name,1,1)||'.' ||substr(Tpnt.mid_name,1,1)||'.' as pnt,     \
  Tserv.id ||' - '||Tserv.name as serv,  \
  TTvis.price, \
  sum(TTvis.count) as cnt,  \
  sum(TTvis.count * TTvis.price) as sum  \
%s \
GROUP BY \
  Trefrl.name \
  ,Tvis.created \
  ,Tvis.id \
  ,Tpnt.last_name, Tpnt.first_name,Tpnt.mid_name  \
  ,Tserv.id \
  ,Tserv.name \
  ,TTvis.price \
ORDER BY \
 refrl \
  ,created \
  ,num \
  ,pnt \
   ,serv ,TTvis.price " % (Report.base_wuery_from_where)

    
    def make(self,results):

        #
        vl = self.struct(results)
        #..

        tvv = map(lambda x: [
            x[0]                            # gr.0
            ,sum(map(lambda y: y[5],x[1]))  # gr.1
            ,sum(map(lambda y: y[6],x[1]))  # gr.2
            ,x[1:]                          # gr.5!!!!
        ] ,vl)    
        
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
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
  sum(TTvis.count * TTvis.price) as sum \
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
            x[0]                            # gr.0
            ,sum(map(lambda y: y[4],x[1]))  # gr.1
            ,sum(map(lambda y: y[5],x[1]))  # gr.2
            ,x[1:]                          # gr.3!!!!
        ] ,vl)    
        #...
        t = []
        t.append(tvv)
        t.append(sum(map(lambda x: x[1],tvv)))                  #results.0.1
        t.append(sum(map(lambda x: x[2],tvv)))                  #results.0.2
        tt = []
        tt.append(t)
        return tt



register('vrachi', VrachReport) 
register('vrachi-usl-sum', VrachiUslSumReport) 
register('vrachi-refrl-pnt_usl', VrachRefrlPntUslReport) 

register('patient-usl-sum', PatientUslSumReport)
register('patient-place_filial-usl-sum', PatientPlaceFilialUslSumReport)
register('patient-place_office-usl-sum', PatientPlaceOfficeUslSumReport)

register('referal-usl-sum', RreferalUslSumReport)
register('referal-usl-sum-uzi', RreferalUslSumReportOnlyUZI)
register('referal-pnt_usl', RefrlPntUslReport)

register('payment-pnt-serv', PaymentPatientReport)
register('payment-place-serv', PaymentPlaceServReport)
register('payment-refrl-pnt_serv', PaymentRefrlSPReport)
register('payment-refrl-pnt_serv2', PaymentRefrlSPReport2)

register('place_filial-pnt-serv', PlaceFilialPatientReport)
register('place_office-pnt-serv', PlaceOfficePatientReport)

register('price-dinamic', PriceDinamicReport)
