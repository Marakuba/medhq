Ext.ns('App');

App.examination.TemplatesWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.form = new App.CardTemplateGrid ({
			model:this.model,
			record:this.record,
			patient:this.patient,
			ordered_service:this.ordered_service,
			fn:function(record){
				//this.record = record;
				Ext.callback(this.fn, this.scope || window, [record]);
				this.close()
			},
			scope:this
		});
		
		config = {
			title:'Шаблоны',
			width:700,
			height:500,
			layout:'fit',
			items:[this.form],
			modal:true,
			border:false
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TemplatesWindow.superclass.initComponent.apply(this, arguments);
	}
	
});


Ext.reg('templateswindow', App.examination.TemplatesWindow);