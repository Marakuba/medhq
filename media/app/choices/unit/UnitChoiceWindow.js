Ext.ns('App.choices');

App.choices.UnitChoiceWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.grid = new App.choices.UnitChoiceGrid({
			fn:function(record){
				this.sended = true;
				Ext.callback(this.fn, this.scope || window, [record]);
			},
			scope:this
		});

		config = {
			width:700,
			height:500,
			modal:true,
			layout:'fit',
			title:'Единицы измерения',
			items:[
				this.grid
			]
		};

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.choices.UnitChoiceWindow.superclass.initComponent.apply(this, arguments);

		this.on('beforeclose',function(){
			if (!this.sended){
				Ext.callback(this.fn, this.scope || window, []);
			}
		},this);

	}
});
