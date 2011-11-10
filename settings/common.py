# -*- coding: utf-8 -*-

import sys
from path import path

PROJECT_ROOT = path(__file__).abspath().dirname().dirname()
SITE_ROOT = PROJECT_ROOT.dirname()

sys.path.append(SITE_ROOT)
sys.path.append(PROJECT_ROOT / 'apps')
sys.path.append(PROJECT_ROOT / 'libs')
sys.path.append(PROJECT_ROOT / 'custom')

MEDIA_ROOT = PROJECT_ROOT / 'media'
CUSTOMS_ROOT = PROJECT_ROOT / 'custom'
REPORTS_DIR = 'reports'
UPLOAD_DIR = MEDIA_ROOT / 'photo'
TEMPLATE_DIRS = [PROJECT_ROOT / 'templates']

LOCALE_PATHS = (PROJECT_ROOT / 'locale',)

LOG_FILE = SITE_ROOT / 'logs' / 'django.log'

DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
          ('TRX', '4015555@gmail.com'),
)

AUTH_PROFILE_MODULE = 'staff.Staff'

LOGIN_URL = '/webapp/auth/'

MANAGERS = ADMINS

TIME_ZONE = 'Europe/Moscow'

LANGUAGE_CODE = 'ru-RU'

USE_L10N = True

USE_I18N = True

SECRET_KEY = 'ud)-iik%3k(6%p_tzbt-e-kvgvekxi4-y+!xjnhpl0_e)_3gat'

CACHE_BACKEND = 'memcached://127.0.0.1:11211/'

DBTEMPLATES_CACHE_BACKEND = 'memcached://127.0.0.1:11211/'

#JOHNNY_MIDDLEWARE_KEY_PREFIX='jc_medical'

TEMPLATE_LOADERS = (
    'dbtemplates.loader.Loader',
    'django.template.loaders.filesystem.load_template_source',
    'django.template.loaders.app_directories.load_template_source',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.core.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.request",
    'constance.context_processors.config',
)

ROOT_URLCONF = 'medhq.urls'

MIDDLEWARE_CLASSES = [
#    'debug_toolbar.middleware.DebugToolbarMiddleware',
    #'johnny.middleware.LocalStoreClearMiddleware',
    #'johnny.middleware.QueryCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'webapp.middleware.ActiveProfileMiddleware',
    'reversion.middleware.RevisionMiddleware'
]

INSTALLED_APPS = (
    #'reversion',
    'admin_tools',
    'admin_tools.theming',
    'admin_tools.dashboard',
    'admin_tools.menu',

    'indexer',
    'paging',
    'sentry',
    'sentry.client',

    'crm',
    'core',
    'helpdesk',
    'webapp',
    'numeration',
    'patient',
    'reporting',
    'service',
    'promotion',
    'staff',
    'state',
    'pricelist',
    'visit',
    'taskmanager',
    'lab',
    'workflow',
    'examination',
    'scheduler',
    'interlayer',
    'billing',
    
        
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    
    'autocomplete',
    'constance',
    'dbtemplates',
    'debug_toolbar',
    'django_extensions',
    'django_memcached',
    #'djcelery',
    'feincms',
    'flatblocks',
    'sorl.thumbnail',
    'south',
    'reversion',
    'tastypie',
    'tagging'
)

ADMIN_TOOLS_MENU = 'medhq.menu.CustomMenu'

ADMIN_TOOLS_INDEX_DASHBOARD = 'medhq.dashboard.CustomIndexDashboard'

APPSERVER_ADMIN_TITLE = u'Главная панель'

CORE_MEDIA = {
    'css': {
        'all': ('resources/css/sys.css',)
    }
}

TASTYPIE_ALLOW_MISSING_SLASH = True
APPEND_SLASH = False

SESSION_EXPIRE_AT_BROWSER_CLOSE = True

DBTEMPLATES_USE_CODEMIRROR = True


#import djcelery
#djcelery.setup_loader()
#
#BROKER_HOST = "localhost"
#BROKER_PORT = 5672
#BROKER_USER = "django"
#BROKER_PASSWORD = "django"
#BROKER_VHOST = "medhq"
#CELERY_RESULT_BACKEND = "amqp"
#CELERY_IMPORTS = ("tasks", )

#HARD_CODE SETTINGS

CONSTANCE_CONFIG = {
    'BRAND': (u'', 'company brand'),
    'PRICE_BY_PAYMENT_TYPE':(False,'Индивидуальные цены по каждому способу оплаты')
}

MAIN_STATE_ID = 1 

MAIN_PRICE_TYPE = 'em_retail'

DBTEMPLATES_USE_CODEMIRROR = True
