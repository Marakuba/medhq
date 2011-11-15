Ext.ns('App.examination');
Ext.ns('App.ServicePanel');
Ext.ns('Ext.ux');

App.examination.Editor = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.serviceTree = new App.ServicePanel.Tree({
			layout: 'fit',
			region:'west',
			width:250,
			border: false,
			collapsible:true,
			collapseMode:'mini',
			split:true
		});
		
		this.tmpBody = new App.examination.TemplateBody ({
			id:'tmp-body',
			anchor: '0 -250',
			border: false,	
			enableDragDrop:true,
			ddGroup:'grid2tree' //same as for tree
		});
		
		this.startPanel = new App.examination.StartPanel({
			id:'start'
		});
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:false,
 			layout: 'fit',				
    		items: [
    			this.startPanel
    		]
		});
		
//		this.glossaryTree = new App.examination.GlossaryTree ({
//			height: 225,	
//			border: false
//		});
		
				
		var config = {
			id: 'editor-cmp',
			closable:true,
			title: 'Конструктор',
			layout: 'border',	
     		items: [
				this.serviceTree,
				this.contentPanel
			]
		};
		
		this.startPanel.on('opentmp',function(){
			this.contentPanel.remove(this.startPanel);
			this.contentPanel.add(this.tmpBody);
			this.contentPanel.doLayout();
		},this)
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.Editor.superclass.initComponent.apply(this, arguments);
	}
});


Ext.reg('editor', App.examination.Editor);
