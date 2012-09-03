Ext.ns('App.laboratory');


App.laboratory.LabBoard = Ext.extend(Ext.Panel, {
	
	initComponent: function() {
		
		this.origTitle = 'Заказы';
		
		this.LabOrderGrid = new App.laboratory.LabOrderGrid({
			id:'lab-order-grid',
			region:'west',
			split:true,
			width:510,
			listeners:{
				scope:this,
				orderselect: function(rec){
					this.ResultCard.enable();
					this.ResultCard.setActiveRecord(rec);
				}
			}
		});

		this.ResultCard = new App.result.ResultCard({
			region:'center'
		});
		
		config = {
			id:'lab-board-app',
			title:this.origTitle,
			layout:'border',
			items:[this.LabOrderGrid,this.ResultCard]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laboratory.LabBoard.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
		this.LabOrderGrid.getStore().on('load',this.onLabOrderLoad,this);
		this.on('beforedestroy', function(){
			this.LabOrderGrid.getStore().un('load',this.onLabOrderLoad,this);
		},this);
		
		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this); 
		},this);
		
//		this.LabOrderGrid.getSelectionModel().on('rowclick', function(sm,i,rec){
//			this.ResultCard.enable();
//			this.ResultCard.setActiveRecord(rec);
//		}, this);
		
		this.LabOrderGrid.on('updatefilters', function(){
			this.ResultCard.disable();
		}, this);
	},

	onGlobalSearch: function(v) {
		this.changeTitle = v!==undefined;
		if(!v){
			this.setTitle(this.origTitle);
		};
		this.ResultCard.disable();
	},
	
	onLabOrderLoad : function(store,r,options){
		if(this.changeTitle){
			this.setTitle(String.format('{0} ({1})', this.origTitle, store.getTotalCount()));
		}
	}

	
});


Ext.reg('labboard', App.laboratory.LabBoard);