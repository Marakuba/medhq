Ext.ns('App.choices');

App.choices.ServiceGroupChoiceWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.grid = new App.choices.ServiceGroupChoiceGrid({
			fn:function(record){
				Ext.callback(this.fn, this.scope || window, [record]);
			},
			scope:this
		});
		
		config = {
			width:700,
			height:500,
			modal:true,
			layout:'fit',
			title:'Услуги',
			items:[
				this.grid
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.choices.ServiceGroupChoiceWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('beforeclose',function(){
			if (!this.sended){
				Ext.callback(this.fn, this.scope || window, []);
			}
		},this)
		
	}
});