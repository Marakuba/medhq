Ext.ns('App');

Ext.Ajax.defaultHeaders = {Accept:'application/json'};

Ext.onReady(function() {
	
	var ServicePanel = new App.ServicePanel({
		region:'west',
		width:300
	});
	var MainPanel = new App.MainPanel({
		region:'center'
	});
	var InfoPanel;
	var ActionPanel;

    var viewport = new Ext.Viewport({
        layout: 'border',
        items: [ServicePanel, MainPanel]
    });	
	
});