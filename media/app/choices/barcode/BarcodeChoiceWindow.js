Ext.ns('App.choices');

App.choices.BarcodeChoiceWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.grid = new App.choices.BarcodeChoiceGrid({
			patientId:this.patientId,
			fn:function(record){
				console.log('123')
				Ext.callback(this.fn, this.scope || window, [record]);
			},
			scope:this
		});
		
		config = {
			width:700,
			height:500,
			layout:'fit',
			title:'Штрих-коды',
			items:[
				this.grid
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.choices.BarcodeChoiceWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('beforeclose',function(){
			if (!this.sended){
				Ext.callback(this.fn, this.scope || window, []);
			}
		},this)
		
	}
});