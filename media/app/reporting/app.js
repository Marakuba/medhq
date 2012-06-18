Ext.ns('App.settings');

Ext.onReady(function(){

	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
//	App.settings.reloadPriceByPaymentType = false;
	
	
	//medstateStore - Список организаций. Передаётся во все компоненты, где это необходимо. 
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

	
	centralPanel.launchApp('reports');
	
});