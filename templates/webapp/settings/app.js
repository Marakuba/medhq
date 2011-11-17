Ext.ns('App.settings');


App.settings.reloadPriceByPaymentType = {{ config.PRICE_BY_PAYMENT_TYPE|yesno:'true,false' }};

App.settings.startHour = {{ config.START_HOUR }};

App.settings.endHour = {{ config.END_HOUR }};