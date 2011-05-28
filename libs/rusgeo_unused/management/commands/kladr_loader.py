"""


"""

from django.core.management.base import BaseCommand
from django.db import transaction



from rusgeo.models import AdrType, Region, District, City 

from csv import reader

import datetime

#@transaction.commit_on_success
def kladr_import(csv_file):

    start = datetime.datetime.now()
    
    _cache_city = {}

    try:
        fh = open(csv_file)
    except IOError:
        print "No such file"
        return

    adrtypes = AdrType.objects.all()
    regions = Region.objects.all()
    districts = District.objects.all()
        
    table = reader(fh)

    #header = table.next()
    #name,shortcut,region_code,district_code,city_code,place_code,index,status
    for name,shortcut,region_code,district_code,city_code,place_code,index,status in table:
        

        #adrtype = AdrType.objects.filter(shortcut=shortcut).order_by('level')
        #level = adrtype[0].level
        adrtype = adrtypes.filter(shortcut=shortcut).order_by('level')[0]
        region = regions.get(code=region_code)
        
        
        if place_code=='000':
            #print "this is not Place"
            if city_code=='000':
                #print "this is not City"
                if district_code=='000':
                    pass
                    #print "this is not District"
                    #print "WOW! this is Region!"
                    #print "%s - %s" % (region_code, name)
                    #new_region = Region(name=name, code=region_code, adrtype=adrtype[0])
                    #new_region.save()
                else:
                    pass
                    #print "this is District"
                    
                    #new_district = District(name=name, code=region_code+district_code, adrtype=adrtype, status=status)
                    #new_district.save()
            else:
                if district_code=='000':
                    district = None
                else:
                    district = districts.get(code=region_code+district_code)
                #district = district_code=='000' and None or districts.get(code=region_code+district_code)
                new_city = City(name=name, code=city_code, adrtype=adrtype, region=region, district=district, status=status)
                new_city.save()
                _cache_city[region_code+district_code+city_code]=new_city
                #print "this is City"
                #pass
        else:
            #pass
            if district_code=='000':
                district = None
            else:
                district = districts.get(code=region_code+district_code)
            if city_code=='000':
                major_city = None
            else:
                major_city = _cache_city.get(region_code+district_code+city_code)
            #district = district_code=='000' and None or districts.get(code=region_code+district_code)
            #major_city = city_code=='000' and None or _cache_city.get(city_code)
            new_city = City(name=name, code=city_code, adrtype=adrtype, region=region, district=district, major_city=major_city, status=status)
            new_city.save()
            #print "this is Place"
        print table.line_num

    end = datetime.datetime.now()

    delta = end-start
    
    print "execution time: %s.%s" % (delta.seconds, delta.microseconds) 
    
    fh.close()
    del table
    
class Command(BaseCommand):
    help = "Loads kladr list"

    def handle(self, *args, **options):
        kladr_import(args[0])