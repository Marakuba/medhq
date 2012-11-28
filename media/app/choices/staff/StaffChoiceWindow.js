Ext.ns('App.choices');

App.choices.StaffChoiceWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.grid = new App.choices.StaffChoiceGrid({
			store:this.store,
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
			title:'Врачи',
			items:[
				this.grid
			]
		};

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.choices.StaffChoiceWindow.superclass.initComponent.apply(this, arguments);

	}
});
