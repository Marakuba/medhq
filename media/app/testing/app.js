
Ext.onReady(function(){
	
	Ext.QuickTips.init();
	
	var body = Ext.getBody();
	
	Ext.Ajax.defaultHeaders = {Accept:'application/json'};

	var vp = new Ext.Viewport({
		layout:'border',
		items:{
			xtype:'samplingeditor',
			region:'center',
			visitId:2567
		}
	});
	
	window.onkeydown = function(e){
		console.info(e.keyCode);
	};
	
});