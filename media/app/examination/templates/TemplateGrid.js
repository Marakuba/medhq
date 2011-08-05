Ext.ns('App');
Ext.ns('App.examination');

App.CardTemplateGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {		

		//this.backend = App.getBackend('cardtemplate');	
		//this.cardBackend = new App.ExamBackend({});
		
		this.tmp_id = Ext.id();
		
		this.tmpModel = new Ext.data.Record.create([
			{name: 'id'},
			{name: 'staff', allowBlank: false},
			{name: 'staff_name', allowBlank: true},
			{name: 'complaints', allowBlank: true},
			{name: 'anamnesis', allowBlank: true},
			{name: 'ekg', allowBlank: true},
			{name: 'name', allowBlank: false},
			{name: 'print_name', allowBlank: true},
			{name: 'objective_data', allowBlank: true},
			{name: 'psycho_status', allowBlank: true},
			{name: 'gen_diag', allowBlank: true},
			{name: 'complication', allowBlank: true},
			{name: 'concomitant_diag', allowBlank: true},
			{name: 'clinical_diag', allowBlank: true},
			{name: 'treatment', allowBlank: true},
			{name: 'referral', allowBlank: true},
			{name: 'group', allowBlank: true}
		]);
		
		this.examModel = new Ext.data.Record.create([
			{name: 'id'},
			{name: 'name',allowBlank: true},
			{name: 'print_name',allowBlank: true},
			{name: 'ordered_service',allowBlank: true},
			{name: 'print_date', allowBlank: true},
			{name: 'objective_data', allowBlank: true},
			{name: 'psycho_status', allowBlank: true},
			{name: 'gen_diag', allowBlank: true},
			{name: 'complication', allowBlank: true},
			{name: 'concomitant_diag', allowBlank: true},
			{name: 'clinical_diag', allowBlank: true},
			{name: 'treatment', allowBlank: true},
			{name: 'referral', allowBlank: true},
			{name: 'disease', allowBlank: true},
			{name: 'complaints', allowBlank: true},
			{name: 'history', allowBlank: true},
			{name: 'anamnesis', allowBlank: true},
			{name: 'mbk_diag', allowBlank: true},
			{name: 'group', allowBlank: true}
		]);

		this.examStore = new Ext.data.Store({
			autoLoad:true,
			autoSave:true,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    remoteSort: true,
		    proxy: new Ext.data.HttpProxy({
			    url: get_api_url('examcard')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, this.examModel),
		    writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
		    listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    	},
		    	write:function(store, action, result, res, rs){
		    		if(action=='create') {
			    		App.eventManager.fireEvent('examcardcreate', rs);
		    		}
		    	},
		    	scope:this
		    }
		});
		
		this.store = new Ext.data.Store({
			autoLoad:true,
			autoSave:true,
		    baseParams: {
		    	format:'json'
		    },
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
		    restful: true,
		    remoteSort: true,
		    proxy: new Ext.data.HttpProxy({
			    url: get_api_url('cardtemplate')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, this.tmpModel),
		    writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
		    listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    	},
		    	write:function(store, action, result, res, rs){
		    		if(action=='create') {
			    		App.eventManager.fireEvent('templatecardcreate', rs);
		    		}
		    	},
		    	scope:this
		    }
		});
		//this.store = this.backend.store;
		
		//this.store.load();
		
		this.columns =  [
		    {
		    	header: "Название шаблона", 
		    	width:70,
		    	sortable: true, 
		    	dataIndex: 'name', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Врач", 
		    	width:70,
		    	sortable: true, 
		    	dataIndex: 'staff_name'
		    }
		];		
		var config = {
			id: 'teplare-grid',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			store:this.store,
			closable:true,
			//title: 'Шаблоны',
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
					rowselect:function(model,ind,rec) {
						Ext.getCmp(this.tmp_id+'choice-btn').enable()
						
					},
					rowdeselect: function() {
						Ext.getCmp(this.tmp_id+'choice-btn').disable()
					},
					scope:this
				}
			}),
			tbar:[{
				xtype:'button',
				id:this.tmp_id + 'choice-btn',
				iconCls:'silk-accept',
				text:'Выбрать',
				handler:this.onChoice.createDelegate(this, [])
			}/*,'-',{
				xtype:'button',
				iconCls:'silk-add',
				text:'Добавить',
				handler:this.onAdd.createDelegate(this, [])
			},{
				xtype:'button',
				//iconCls:'silk-add',
				text:'Добавить копированием',
				handler:this.onAddCopy.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-pencil',
				text:'Изменить',
				handler:this.onEdit.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-delete',
				text:'Удалить',
				handler:this.onDelete.createDelegate(this, [])
			}*/,'-',{
				xtype:'button',
				enableToggle:true,
				toggleGroup:'templare-filter',
				text:'Свои',
                scope:this,
				handler: function(){
					var url = get_api_url('position');
					var path = [url,active_profile];
					this.store.filter('staff',path.join("/"));
				}
                
			},{
				xtype:'button',
				enableToggle:true,
				toggleGroup:'templare-filter',
				text:'Все',
				pressed: true,
                scope:this,
				handler: function(){
                    this.store.clearFilter()
                }
			}],
			viewConfig : {
				forceFit : true
			}			
		};
		
		this.on('rowdblclick', function(object, rowIndex, e){
            this.onChoice();
        },this);
        
       	this.on('afterrender',function(){
           	//this.store.setBaseParam('staff',active_profile);
           	this.store.load();
        });
        
       
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.CardTemplateGrid.superclass.initComponent.apply(this, arguments);
		
	},
	
	onAdd: function(btn,ev){
        config = {
			title:'Новый шаблон',
			closable:true,
   			model:this.tmpModel,
   			scope:this,
   			fn:function(record){
   				this.saveRecord(record);
   			}
		}
		App.eventManager.fireEvent('launchapp', 'cardtemplateform',config);
		//this.setVisible(false); 
	},
	
	onAddCopy: function(btn,ev){
		var record = this.getSelected();
		if(record) {
			var url = get_api_url('position');
			var path = [url,active_profile];
			var Model = this.tmpModel;
			if (Model) {
				var model = new Model();
			}
			
			var id;
			for (id in record.data) {
				if (id != 'id') {
					model.data[id] = record.data[id];
					model.data['staff'] = path.join("/");
				};
				
			}
			this.saveRecord(model);
		}
	},
    
	onEdit: function(rowindex){
		var record = this.getSelected();
		if(record) {
			config = {
				title:'Шаблон '+record.data.name,
				closable:true,
				record:record,
    			model:this.tmpModel,
    			scope:this,
    			fn:function(record){
    				this.saveRecord(record);
    			}
			}
			App.eventManager.fireEvent('launchapp', 'cardtemplateform',config);
		}
	},
	
    onDelete: function() {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        }
        this.store.remove(rec);
    },	
    
    onChoice: function() {
        var record = this.getSelectionModel().getSelected();
        Ext.callback(this.fn, this.scope || window, [record]);        
    },
    
    saveExamRecord: function(record) {
		if(record.phantom) {
			//record.data['ordered_service'] = this.ordered_service;
			if(this.examStore.indexOf(record)==-1) {
				this.examStore.insert(0, record);
				Ext.callback(this.fn, this.scope || window, [this.record]);
			} else {
			}
		} else {
		};
	},
	
	saveRecord: function(record) {
		if(record.phantom) {
			if(this.store.indexOf(record)==-1) {
				this.store.insert(0, record);
			} else {
			}
		} else {
		}
	},
    
    getSelected: function() {
		return this.getSelectionModel().getSelected()
	}
	
	
});



Ext.reg('cardtemplategrid',App.CardTemplateGrid);