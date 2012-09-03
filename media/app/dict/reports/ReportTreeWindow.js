Ext.ns('App.dict');

App.dict.MKBWindow = Ext.extend(Ext.Window, {

	initComponent: function(){
		
		this.tree = new App.dict.MKBTree({
			fn:function(node){
				this.node = node;
				Ext.callback(this.fn, this.scope || window, [node]);
			},
			scope:this
		});
		
		config = {
			iconCls:'silk-add',
			title:'МКБ',
			width:800,
			height:450,
			maximizeble:true,
			minimizeble:true,
			resizeble:true,
			modal:true,
			closeAction:'hide',
			layout:'fit',
			items:[this.tree],
			buttons:[{
				text:'Закрыть',
				handler:this.onClose.createDelegate(this),
				scope:this
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.dict.MKBWindow.superclass.initComponent.apply(this, arguments);
	},
	
	onFormSave: function() {
		this.form.onSave();
	},
	
	onClose: function() {
		this.hide();
	}
	
});


Ext.reg('mkbwindow', App.dict.MKBWindow);