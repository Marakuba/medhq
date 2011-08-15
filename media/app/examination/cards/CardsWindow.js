Ext.ns('App');

App.examination.CardsWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.form = new App.AllExamGrid ({
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
			title:'Карты осмотра',
			width:700,
			height:500,
			autoScroll:true,
			layout:'fit',
			items:[this.form],
			modal:true,
			border:false
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.CardsWindow.superclass.initComponent.apply(this, arguments);
	}
	
});


Ext.reg('cardswindow', App.examination.CardsWindow);