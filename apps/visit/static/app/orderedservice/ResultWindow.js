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
				name:'msg'
//				html:this.messages.join("\n\n")
			}]
		});
		
		config = {
			title:'Протокол передачи заказов',
			width:650,
			height:500,
			items: {
				xtype:'box',
				style:{
					backgroundColor:'white',
					fontSize:'1.2em',
					padding:'3px'
				}
			},
			layout:'fit',
			modal:true,
			buttons:[/*{
				text:'Печатать',
				handler:function(){
				},
				scope:this
			},*/{
				text:'Закрыть',
				handler:function(){
					this.close();
				},
				scope:this
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.remoting.ResultWindow.superclass.initComponent.apply(this, arguments);
		
		this.on('afterrender',function(){
			this.items.itemAt(0).update(this.messages.join("<br>"));
		},this);
	}

});