Ext.ns('App.assistant');

App.assistant.AssistantWindow = Ext.extend(Ext.Window, {

	width : 700,
	
	height : 500,
	
	title : "Врачи",
	
	initComponent:function(){
		this.grid = new App.assistant.AssistantGrid({
			// proxy function for callback
			fn:function(record){
				Ext.callback(this.fn, this.scope || window, [record]);
			},
			scope:this
		});
		
		config = {
			modal:true,
			layout:'fit',
			items:this.grid
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.assistant.AssistantWindow.superclass.initComponent.apply(this, arguments);
		
	}
});