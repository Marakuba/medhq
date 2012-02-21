Ext.ns('App.examination');

App.examination.TrashApp = Ext.extend(Ext.Panel, {
	initComponent : function() {
		
		this.staff = App.getApiUrl('staff')+ '/' + active_staff;
		
		this.contentPanel = new Ext.Panel({
			region:'center',
 			border:true,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			title:'Предпросмотр',
 			defaults:{
 				border:false
 			},
    		items: [
    		]
		});
		
		this.trashTmpGrid = new App.examination.TemplateGrid({
			baseParams:{
				format:'json',
				staff : active_staff,
				deleted:true
			},
			staff:this.staff,
			border: false,
			split:true,
			listeners:{
				rowselect:function(record){
					if (record){
						this.onPreview(record.data.id);
					}
				},
				scope:this
			}
		});
		
		this.trashPanel = new Ext.Panel({
			region:'west',
 			border:true,
 			collapsible:true,
			collapseMode:'mini',
 			width:550,
 			margins:'5 5 5 0',
 			layout: 'fit',
 			defaults:{
 				border:false
 			},
    		items: [
    			this.trashTmpGrid
    		]
		});
		
		var config = {
			closable:true,
			title: 'Мои шаблоны',
			layout: 'border',	
     		items: [
				this.trashPanel,
				this.contentPanel
			]
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.TrashApp.superclass.initComponent.apply(this, arguments);
	},
	
	onPreview: function(tmp_id){
		var list = new Ext.Panel({
			autoLoad:String.format('/widget/examination/template/{0}/',tmp_id)
		});
		this.contentPanel.removeAll();
		this.contentPanel.add(list);
		this.contentPanel.setTitle('Предпросмотр');
		this.contentPanel.doLayout();
		this.doLayout();
	},
	
	editTmp: function(record){
		if(!record){
			console.log('нет записи');
			return false
		}
		
		this.print_name = record.data.name;
		
		config = {
			editMode: true,
			closable:true,
			title: record.data.print_name,
			print_name:record.data.print_name,
			record:record,
			staff:this.staff
		};
		
		App.eventManager.fireEvent('launchapp', 'editor',config);
		
	}
});

Ext.reg('trashapp', App.examination.TrashApp);