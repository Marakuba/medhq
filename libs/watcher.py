# -*- coding: utf-8 -*-

import time
import fcntl
import os
import signal

FNAME = "."

def handler(signum, frame):
    print "File %s modified" % (FNAME,)

signal.signal(signal.SIGIO, handler)
fd = os.open(FNAME,  os.O_RDONLY)
fcntl.fcntl(fd, fcntl.F_SETSIG, 0)
fcntl.fcntl(fd, fcntl.F_NOTIFY, 
            fcntl.DN_MODIFY | fcntl.DN_CREATE | fcntl.DN_MULTISHOT)

while True:
    time.sleep(10000)
