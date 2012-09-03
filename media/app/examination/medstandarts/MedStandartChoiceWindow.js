Ext.ns('App.examination');

App.examination.MedStandartChoiceWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.form = new App.examination.MedStandartChoiceForm({
			mkb10:this.mkb10,
			fn:function(record){
				Ext.callback(this.fn, this.scope || window, [record]);
			},
			listeners:{
				scope:this,
				pushservices:function(records){
					this.fireEvent('pushservices',records);
					this.close();
				}
			},
			scope:this
		});
		
		config = {
			width:1000,
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