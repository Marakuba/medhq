Ext.ns('App.examination');
Ext.ns('App.ServicePanel');
Ext.ns('Ext.ux');

App.examination.Editor = Ext.extend(Ext.Panel, {
	initComponent : function() {

		this.serviceTree = new App.ServicePanel.Tree({
			layout: 'fit'
			,region:'west'
			,width:250 
			,border: false
			,collapsible:true
			,collapseMode:'mini'
			,split:true
		})
				
		this.templateBody = new App.examination.TemplateBody ({
			id:'grid'
			,anchor: '0 -250'
			,border: false	
			,enableDragDrop:true
			,ddGroup:'grid2tree' //same as for tree
		});
		
		this.glossaryTree = new App.examination.GlossaryTree ({
			height: 225	
			,border: false
		});
		
				
		var config = {
			id: 'ServiceAdminPanel_id'
			,title: 'Конструктор'
			,layout: 'border'	
     		,items: [
				this.serviceTree,
				{
				xtype: 'panel'
				,id: 'servicecenterpanel'
				,region:'center'
     			,border:false
     			,layout: 'anchor'				
	    		,items: [
	    			this.ServiceGrid
	    			,{
	    				xtype: 'panel'
	    				,id: 'tabpanelcontainer'
	    				,layout: 'fit'
	    				,border: false
	    				,title: 'Услуги'
	    				,items: this.InfoTabPanel 
	    			}
	    		]}
			]
		}
								
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.service.ServiceAdminPanel.superclass.initComponent.apply(this, arguments);
	}
});


Ext.reg('serviceadminpanel', App.service.ServiceAdminPanel);
