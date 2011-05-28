"""


"""

from django.core.management.base import BaseCommand

from rusgeo.models import AdrType 

from csv import reader



def shortcuts_import(csv_file):

    try:
        fh = open(csv_file)
    except IOError:
        print "No such file"
        return
        
    table = reader(fh)

    header = table.next()
    
    for level,shortcut,name,code in table:
        shortcut = unicode(shortcut,'cp866').encode('utf-8')
        name = unicode(name,'cp866').encode('utf-8')
        new_adrtype = AdrType(level=int(level), shortcut=shortcut, name=name)
        new_adrtype.save()
        print "%s - %s created" % (shortcut, name)
        
    
    fh.close()
    del table
    
class Command(BaseCommand):
    help = "Loads shortcut list"

    def handle(self, *args, **options):
        shortcuts_import(args[0])