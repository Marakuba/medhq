Ext.ns('App.examination');

App.examination.MedStandartChoiceWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.form = new App.examination.MedStandartChoiceForm({
			fn:function(record){
				Ext.callback(this.fn, this.scope || window, [record]);
			},
			scope:this
		});
		
		config = {
			width:800,
			height:600,
			modal:true,
			layout:'fit',
			title:'Стандарты лечения',
			items:[
				this.form
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.MedStandartChoiceWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('beforeclose',function(){
		},this)
		
	}
});