Ext.ns('App.laboratory');


App.laboratory.LabBoard = Ext.extend(Ext.Panel, {
	
	initComponent: function() {
		this.LabOrderGrid = new App.laboratory.LabOrderGrid({
			id:'lab-order-grid',
			region:'west',
			split:true,
			width:510,
		});
		this.ResultGrid = new App.result.ResultGrid({
			id:'lab-result-grid',
			closable:false
		});
		this.ResultCard = new Ext.Panel({
			region:'center',
			border:false,
			title:'Результаты',
			layout:'fit',
/*			tools:[{
				id:'help',
				handler:function(){
				},
				scope:this,
				qtip:'Посмотреть информацию о работе с данным разделом'
			}],*/
			items:new Ext.TabPanel({
				border:false,
				tabPosition:'bottom',
				activeTab:0,
				items:[this.ResultGrid]
			})
		});
		
		config = {
			title:'Панель заказов',
			layout:'border',
			items:[this.LabOrderGrid,this.ResultCard]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laboratory.LabBoard.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
		this.LabOrderGrid.getSelectionModel().on('rowselect', function(sm,i,rec){
			this.ResultCard.enable();
			this.ResultCard.setTitle(String.format('Результаты: {0}', rec.data.patient_name));
			this.ResultGrid.setActiveRecord(rec);
		}, this);
		
		this.LabOrderGrid.on('updatefilters', function(){
			this.ResultCard.disable();
		}, this);
	},

	onGlobalSearch: function(v) {
		this.ResultCard.disable();
	},
	

	
});


Ext.reg('labboard', App.laboratory.LabBoard);