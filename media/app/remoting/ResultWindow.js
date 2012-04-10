Ext.ns('App.remoting');

App.remoting.ResultWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		
		this.data = this.data || [];
		this.messages = [];
		Ext.each(this.data, function(d,i){
			this.messages.push(d.message);
		}, this);
		
		this.form = new Ext.form.FormPanel({
			hideLabels:true,
			border:false,
			items:[{
				xtype:'textarea',
				anchor:'100% 100%',
				html:this.messages.join("\n\n")
			}]
		});
		
		config = {
			title:'Протокол передачи заказов',
			width:600,
			height:500,
			items: this.form,
			layout:'fit',
			modal:true,
			buttons:[{
				text:'Печатать',
				handler:function(){
				},
				scope:this
			},{
				text:'Отмена',
				handler:function(){
					this.close();
				},
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.remoting.ResultWindow.superclass.initComponent.apply(this, arguments);
	}

});