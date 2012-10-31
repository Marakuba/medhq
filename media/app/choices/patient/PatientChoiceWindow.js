Ext.ns('App.choices');

App.choices.PatientChoiceWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		this.grid = new App.choices.PatientChoiceGrid({
			patientId:this.patientId,
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
			title:'Пациенты',
			items:[
				this.grid
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.choices.PatientChoiceWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('beforeclose',function(){
			// if (!this.sended){
			// 	Ext.callback(this.fn, this.scope || window, []);
			// }
		},this)
		
	}
});