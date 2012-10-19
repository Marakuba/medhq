# -*- coding: utf-8 -*-

import sys
from path import path

PROJECT_ROOT = path(__file__).abspath().dirname().dirname()
SITE_ROOT = PROJECT_ROOT.dirname()

sys.path.append(SITE_ROOT)
sys.path.append(SITE_ROOT / 'servers')
sys.path.append(PROJECT_ROOT / 'apps')
sys.path.append(PROJECT_ROOT / 'libs')


MEDIA_ROOT = PROJECT_ROOT / 'media'
UPLOAD_DIR = MEDIA_ROOT / 'photo'
TEMPLATE_DIRS = [PROJECT_ROOT / 'templates']

LOCALE_PATHS = (PROJECT_ROOT / 'locale',)

LOG_FILE = SITE_ROOT / 'logs' / 'medhq.log'

ADMINS = (
)

AUTH_PROFILE_MODULE = 'staff.Staff'

LOGIN_URL = '/webapp/auth/'

MANAGERS = ADMINS

TIME_ZONE = 'Europe/Moscow'

LANGUAGE_CODE = 'ru-RU'

USE_L10N = True

USE_I18N = True

SECRET_KEY = 'ud)-iik%3k(6%p_tzbt-e-kvgvekxi4-y+!xjnhpl0_e)_3gat'

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    },
    'dbtemplates': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11211',
    },
    'service': {
        'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
        'LOCATION': '127.0.0.1:11212',
    }
}

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
    "django.core.context_processors.static",
    "constance.context_processors.config",
    "core.context_processors.global_vars"

)

ROOT_URLCONF = 'medhq.urls'

MIDDLEWARE_CLASSES = [
#    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'webapp.middleware.ActiveProfileMiddleware',
    'reversion.middleware.RevisionMiddleware',
    'raven.contrib.django.middleware.Sentry404CatchMiddleware',
]

INSTALLED_APPS = [
    #'reversion',
    'admin_tools',
    'admin_tools.theming',
    'admin_tools.dashboard',
    'admin_tools.menu',

#    'indexer',
#    'paging',
#    'sentry',
#    'sentry.client',

    'assistant',
    'api',
    'crm',
    'core',
    'direct',
    'helpdesk',
    'webapp',
    'medstandart',
    'numeration',
    'patient',
    'reporting',
    'oldreporting',
    'service',
    'promotion',
    'remoting',
    'staff',
    'state',
    'pricelist',
    'visit',
    'taskmanager',
    'lab',
#    'workflow',
    'examination',
    'scheduler',
    'interlayer',
    'billing',
    
        
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.markup',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.staticfiles',
    
    'autocomplete',
    'constance',
    'dbtemplates',
    'debug_toolbar',
    'django_assets',
    'django_extensions',
    'django_memcached',
    'djcelery',
    'feincms',
    'flatblocks',
    'sorl.thumbnail',
    'south',
    'reversion',
    'tastypie',
    'tagging',
    'raven.contrib.django',
    'djangocodemirror',
]

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


### celery config

import djcelery
djcelery.setup_loader()

### constance config

CONSTANCE_CONFIG = {
    'BRAND': (u'', 'company brand'),
    'BASE_REPORT_FORM': (u'', 'Форма отчетов по умолчанию'),
    'MAIN_STATE_ID' : (1,'main state id'),
    'PRICE_BY_PAYMENT_TYPE':(False,'Индивидуальные цены по каждому способу оплаты'),
    'START_HOUR':(8,u'Начало работы'),
    'END_HOUR':(20,u'Окончание работы'),
    'CUMULATIVE_DISCOUNTS':(True,u'Использование накопительных скидок (temporary)'),
    'SERVICETREE_ONLY_OWN':(True,u'Показывать услуги только текущей организации'),
    'SERVICE_CACHE_AUTO_CLEAR':(False,u'Автоматически сбрасывать кэш услуг после изменений'),
    'BASE_SERVICE_CODE_TEMPLATE':('MEDHQ.{{service.id}}',u'Шаблон кода базовой услуги'),
    'ANALYSIS_CODE_TEMPLATE':('MEDHQ.{{analysis.id}}',u'Шаблон кода анализа'),
    'LAB_SERVICE_CODE_TEMPLATE':('MEDHQ.{{labservice.id}}',u'Шаблон кода ручного исследования'),
    'REGISTRY_SHOW_ALERTS':(True,u'Показывать предупреждения в карте пациента')
}

