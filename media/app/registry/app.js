Ext.ns('App.settings');

Ext.onReady(function(){

	App.direct.numeration.getPrinterBySlug('registry',function websocket_init(res,e) {
		if(res.success) {
	    	d = res.data;
    		App.WebSocket = new WebSocket(String.format("ws://{0}:{1}/",d.address,d.port));
	    	App.WebSocket.onopen = function() {
//	    		console.log("printserver connected");
	    	};
	    	App.WebSocket.onmessage = function(e) {
//	    		console.log("printserver message: " + e.data);
	    	};
	    	App.WebSocket.onclose = function() {
//	    		console.log("printserver disconnected");
	    	};
	    	App.WebSocket.onerror = function() {
//	    		console.log("printserver error");
	    	};
		}
    }, this);

	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
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