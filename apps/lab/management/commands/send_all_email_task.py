# -*- coding: utf-8 -*-


from django.core.management.base import NoArgsCommand
from lab.utils import send_all_email_task


class Command(NoArgsCommand):

    def handle_noargs(self, *args, **options):
        """
        """
        send_all_email_task()
