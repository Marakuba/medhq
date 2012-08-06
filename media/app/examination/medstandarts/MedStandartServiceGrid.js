Ext.ns('App.examination', 'App.models');

App.examination.MedStandartServiceGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoLoad : false,
			apiUrl : get_api_url('standartitem'),
			model: App.models.StandartItemModel
		});
		
		this.choiceBtn = new Ext.Button({
			text:'Выбрать',
			handler:this.onServiceChoice.createDelegate(this,[]),
			iconCls:'silk-accept',
			disabled:true
		})
		
		this.sm = new Ext.grid.CheckboxSelectionModel({
			listeners: {
				rowselect:function(model,ind,rec) {
					this.btnCheckStatus()
				},
				rowdeselect: function() {
					this.btnCheckStatus()
				},
				scope:this
			}
		});
		
		this.columns =  [this.sm,{
		    	header: "Услуга", 
		    	width: 60, 
		    	sortable: true, 
		    	dataIndex: 'service_name'
		    },{
		    	header: "Частота предоставления", 
		    	width: 20,
		    	dataIndex: 'frequency'
		    },{
		    	header: "Среднее количество", 
		    	width: 20,
		    	dataIndex: 'average'
		    }];		
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			sm : this.sm,
			listeners: {
			},
			viewConfig:{
				forceFit:true
			},
			tbar:[this.choiceBtn],
			bbar: new Ext.PagingToolbar({
	            pageSize: 100,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        })
		};
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.examination.MedStandartServiceGrid.superclass.initComponent.apply(this, arguments);
		
		
		this.on('afterrender',function(){
        })
		
	},
	
	setStandart: function(standart){
		this.store.setBaseParam('standart',standart);
		this.choiceBtn.setDisabled(true);
		this.store.load();
	},
	
	btnCheckStatus: function(){
		var sm = this.getSelectionModel();
		records = sm.getSelections();
		this.choiceBtn.setDisabled(!records.length)
	},
	
	onServiceChoice: function(){
		var sm = this.getSelectionModel();
		records = sm.getSelections();
		this.fireEvent('pushservices',records)
	}
	
});



Ext.reg('medstandservgrid',App.examination.MedStandartServiceGrid);