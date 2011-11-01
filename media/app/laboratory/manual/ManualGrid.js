Ext.ns('App.manual');

App.manual.ManualGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.baseTitle = 'Ручные исследования';
		
		this.store = new Ext.data.RESTStore({
			autoSave : true,
			autoLoad : false,
			apiUrl : get_api_url('labservice'),
			model: App.models.LabService
		});
		
		this.store.on('load',function(store, records, options){
			this.setTitle(String.format("{0} ({1})", this.baseTitle, records.length));
		},this);
		
		this.columns =  [{
	    	header: "Название", 
	    	width: 50,
	    	dataIndex: 'service_name',
	    },{
	    	header: "Код", 
	    	width: 50,
	    	dataIndex: 'service_code',
	    }];		
		
		var config = {
			id:'manual-service-grid',
			title:'Ручные исследования',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			closable:false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
			tbar:[/*{
				iconCls:'silk-add',
				text:'Добавить',
				handler:this.onAdd.createDelegate(this)
			},*/'->',{
				iconCls:'x-tbar-loading',
				handler:function(){
					this.store.load();
				},
				scope:this
			}],
			listeners: {
				rowdblclick:function(grid,i,e){
					var rec = grid.getStore().getAt(i);
					var serviceCode = String.format("{0}manualtest",rec.data.service_code);
					if(Ext.ComponentMgr.isRegistered(serviceCode)){
						var cmp = Ext.ComponentMgr.types[serviceCode];
						var win = new cmp({
							record:this.labOrderRecord,
							service:App.uriToId(rec.data.service)
						});
						win.show();
					} else {
						Ext.Msg.alert('!!!','Для данного исследования не зарегистрирована форма ручного введения результатов!');
					}
				}
			},
			viewConfig : {
				forceFit : true
			}			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.manual.ManualGrid.superclass.initComponent.apply(this, arguments);
		
	},
	
	setActiveRecord: function(rec) {
		this.labOrderRecord = rec;
		
		this.store.setBaseParam('order',App.uriToId(this.labOrderRecord.data.visit));
		this.store.load();

		this.enable();
	},
	
	storeFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	
});

Ext.reg('manualgrid', App.manual.ManualGrid);