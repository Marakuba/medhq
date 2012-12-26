Ext.ns('App.dict');

App.dict.GlossaryPanel = Ext.extend(Ext.Panel, {

	initComponent: function(){
		
		this.tree = new App.dict.GlossaryTree({
			fn:function(node){
				this.node = node;
				Ext.callback(this.fn, this.scope || window, [node]);
			},
			scope:this
		});
		
		config = {
			iconCls:'silk-add',
			title:'Глоссарий',
			width:400,
			height:300,
			maximizeble:true,
			minimizeble:true,
			resizeble:true,
			modal:true,
			layout:'fit',
			items:[this.tree]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.dict.GlossaryPanel.superclass.initComponent.apply(this, arguments);
	}
	
	
});


Ext.reg('glossarypanel', App.dict.GlossaryPanel);