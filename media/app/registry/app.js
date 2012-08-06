Ext.ns('App.settings','App.barcoding');

Ext.onReady(function(){

	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	Ext.state.Manager.setProvider(
		    new Ext.state.CookieProvider({
		        expires: new Date(new Date().getTime()+(1000*60*60*24*3)), //1 year from now
		}));
	
	App.direct.numeration.getPrinterBySlug('registry',function(res,e) {
		if(res && res.success) {
			App.barcoding.printers = res.data.printers;
			if(App.barcoding.printers.length) {
				var key = String.format('registry_printer_{0}', active_state_id);
				var printer = Ext.state.Manager.getProvider().get(key);
				
				if(!printer){
					printer = App.barcoding.printers[0];
					Ext.state.Manager.getProvider().set(key, printer);
				}
				App.WebSocket = new WebSocket(String.format("ws://{0}:{1}/",printer.address,printer.port));
		    	App.WebSocket.onopen = function() {
		    	};
		    	App.WebSocket.onmessage = function(e) {
		    	};
		    	App.WebSocket.onclose = function() {
		    	};
		    	App.WebSocket.onerror = function() {
		    	};
			}
		} else {
			// printer not found handler
		}
	}, this);

//	App.settings.reloadPriceByPaymentType = false;
	
	
	//Список организаций. Передаётся во все компоненты, где это необходимо. 
	// Вынесен в app для исключения множественной загрузки идентичных данных
	var medstateStore = new Ext.data.RESTStore({
		autoSave: true,
		autoLoad : true,
		apiUrl : get_api_url('medstate'),
		model: App.models.MedState
	});
	
	var centralPanel = new App.CentralPanel({
		medstateStore:medstateStore
	});

	var viewport = new Ext.Viewport({
		layout:'border',
		items:[centralPanel]
	});

	new Ext.KeyMap(document, {
	    key: Ext.EventObject.F3,
	    handler: function(){ 
	    	centralPanel.onSearch();
	    },
	    scope: this,
	    stopEvent: true
	});
	
	new Ext.KeyMap(document, {
	    key: Ext.EventObject.F8,
	    handler: function(){ 
	    	centralPanel.onClearSearch();
	    },
	    scope: this,
	    stopEvent: true
	});
	
	centralPanel.launchApp('patients');
	centralPanel.launchApp('visits',{},false);
	centralPanel.launchApp('results',{},false);
	
});