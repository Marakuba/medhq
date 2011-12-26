Ext.ns('App.dict');

App.dict.EditNodeWindow = Ext.extend(Ext.Window, {

	initComponent: function(){
		
		this.editField = new Ext.form.TextArea({
			
		})
		
		this.ttb = [this.choiceBtn]
		
		config = {
			iconCls:'silk-edit',
			title:'Изменить',
			width:400,
			height:300,
			maximizeble:true,
			minimizeble:false,
			resizeble:true,
			modal:true,
			closeAction:'close',
			layout:'fit',
			items:[this.editField],
			ttb:this.ttb,
			buttons:[{
				text:'Применить',
				handler:this.onSave.createDelegate(this),
				scope:this
			},{
				text:'Отменить',
				handler:this.onCancel.createDelegate(this),
				scope:this
			}],
			
			listeners:{
				afterrender: function(){
					if (this.text){
						this.editField.setValue(this.text);
					}
				},
				scope:this
			}
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.dict.EditNodeWindow.superclass.initComponent.apply(this, arguments);
	},
	
	onSave: function() {
		var value = this.editField.getValue();
		Ext.callback(this.fn, this.scope || window, [value]);
		this.close();
	},
	
	onCancel: function() {
		this.close();
	}
	
});