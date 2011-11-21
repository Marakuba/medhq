Ext.ns('App.examination');
Ext.ns('App.ServicePanel');
Ext.ns('Ext.ux');

App.examination.Editor = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.tmpStore = new Ext.data.RESTStore({
			autoSave: true,
			autoLoad : false,
			apiUrl : get_api_url('extendedservice'),
			model: App.models.Template
		});
		
		this.serviceTree = new App.visit.VisitServicePanel({
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
		
		this.startPanel.on('opentmp',function(source){
			if (!source){
				this.record = new this.tmpStore.model();
				this.contentPanel.remove(this.startPanel);
				this.tmpBody.record = this.record;
				this.contentPanel.add(this.tmpBody);
				this.contentPanel.doLayout();
			}
		},this);
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.Editor.superclass.initComponent.apply(this, arguments);
		
		this.serviceTree.on('serviceclick',this.onServiceClick,this);
	},
	
	onServiceClick: function(attrs){
		var ids = attrs.id.split('-');
		var id = ids[0];
		this.service = '';
		
	}
});


Ext.reg('editor', App.examination.Editor);
