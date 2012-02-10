Ext.ns('App.laboratory');


App.laboratory.LabBoard = Ext.extend(Ext.Panel, {
	
	initComponent: function() {
		this.LabOrderGrid = new App.laboratory.LabOrderGrid({
			id:'lab-order-grid',
			region:'west',
			split:true,
			width:510,
		});

		this.ResultCard = new App.result.ResultCard({
			region:'center'
		});
		
		config = {
			id:'lab-board-app',
			title:'Панель заказов',
			layout:'border',
			items:[this.LabOrderGrid,this.ResultCard]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laboratory.LabBoard.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this); 
		},this);
		
		this.LabOrderGrid.getSelectionModel().on('rowselect', function(sm,i,rec){
			this.ResultCard.enable();
			this.ResultCard.setActiveRecord(rec);
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