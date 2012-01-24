
Ext.onReady(function(){
	
	Ext.state.Manager.setProvider(
	    new Ext.state.CookieProvider({
	        expires: new Date(new Date().getTime()+(1000*60*60*24*3)), //1 year from now
	}));
	
	Ext.QuickTips.init();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};
	
	var centralPanel = new App.CentralPanel({
		tbar:[{
			id:'global-search-field',
			xtype:'gsearchfield',
			stripCharsRe:new RegExp('[\;\?]')
		}]
	});
	
	var viewport = new Ext.Viewport({
		layout:'border',
		items:[centralPanel]
	});
	
	centralPanel.launchApp('trlabtestgrid',{},true);
//	centralPanel.launchApp('manualgrid');

    
});