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
		
		this.restoreTmpBtn = new Ext.Button({
			text:'Восстановить',
			disabled:true,
			handler:this.restoreRecord.createDelegate(this,['trashTmpGrid']),
			scope:this
		});
		
		this.trashTmpGrid = new App.examination.TmpGrid({
			baseParams:{
				deleted:true
			},
			staff:this.staff,
			border: false,
			split:true,
			tbar:[this.restoreTmpBtn],
			listeners:{
				rowselect:function(record){
					if (record){
						this.onPreview(record.data.id);
						this.restoreTmpBtn.enable();
					}
				},
				rowdeselect:function(record){
					this.restoreTmpBtn.disable();
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
			title: 'Корзина',
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
	
	restoreRecord: function(gridName){
		var grid = this[gridName];
		var record = grid.getSelectionModel().getSelected();
		if(!record){
			console.log('нет записи');
			return false
		};
		Ext.Msg.confirm('Восстановление','Восстановить запись?',function(btn){
			if (btn=='yes'){
				record.set('deleted',false);
				record.store.load();
				this.contentPanel.removeAll();
				this.restoreTmpBtn.disable();
			}
		},this);
	}
});

Ext.reg('extrash', App.examination.TrashApp);