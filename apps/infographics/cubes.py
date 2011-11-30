# -*- coding: utf-8 -*-

"""
"""
from cube.models import Cube, Dimension
import datetime

class DayMixin(Dimension):
    """
    """
    @property
    def pretty_constraint(self):
        """
        Returns:
            str. A pretty string representation of the constraint's value 
        """
        days = [u'Вс',u'Пн',u'Вт',u'Ср',u'Чт',u'Пт',u'Сб']
        return " %s" % days[int(self.constraint)-1]
    

class HourMixin(Dimension):
    """
    """
    @property
    def pretty_constraint(self):
        """
        Returns:
            str. A pretty string representation of the constraint's value 
        """
        return self.constraint[1:3]
    

class HotTime(Cube):
    """
    """
    time = HourMixin('created__icontains',sample_space=[' %02d:' % i for i in range(24)])
    week_day = DayMixin('created__week_day', sample_space=[2,3,4,5,6,7,1])

    @staticmethod
    def aggregation(queryset):
        return queryset.count()