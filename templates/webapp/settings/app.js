Ext.ns('App.settings');


App.settings.serviceTreeOnlyOwn = {% if request.active_profile.department.state.type == 'p' %}true{% else %}{{ config.SERVICETREE_ONLY_OWN|yesno:'true,false' }}{% endif %};

App.settings.strictMode = {% if request.active_profile.department.state.type == 'p' %}true{% else %}false{% endif %};

App.settings.reloadPriceByPaymentType = {{ config.PRICE_BY_PAYMENT_TYPE|yesno:'true,false' }};

App.settings.startHour = {{ config.START_HOUR }};

App.settings.endHour = {{ config.END_HOUR }};