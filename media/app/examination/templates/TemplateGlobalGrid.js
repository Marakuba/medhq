Ext.ns('App');
Ext.ns('App.examination');

App.TemplateGlobalGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {		

		this.backend = App.getBackend('cardtemplate');	
		//this.cardBackend = new App.ExamBackend({});
		this.examModel = new Ext.data.Record.create([
			{name: 'id'},
			{name: 'name',allowBlank: true},
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
			{name: 'extra_service', allowBlank: true}
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
		
		this.store = this.backend.store;
		
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
			id: 'teplare-global-grid',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			store:this.store,
			closable:true,
			title: 'Шаблоны',
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
			tbar:[{
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
			}],
			viewConfig : {
				forceFit : true
			}			
		};
		
		this.on('rowdblclick', function(object, rowIndex, e){
            this.onEdit.createDelegate(this, []);
        },this);
        
        this.on('afterrender',function(){
           	//this.store.setBaseParam('staff',active_profile);
           	this.store.load();
        });
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.TemplateGlobalGrid.superclass.initComponent.apply(this, arguments);
				App.eventManager.on('templategrid_reload', this.reloadStore, this)
	},
	
	reloadStore: function() {
		this.store.load()	
	},
	
	onAdd: function(btn,ev){
        var win = new App.examination.CardTemplateWindow({
    		model:this.backend.getModel(),
    		scope:this,
    		fn:function(record){
    			console.info(record);
    			this.backend.saveRecord(record);
    		}
    	});
    	win.show();
	},
    
	onEdit: function(rowindex){
		var record = this.getSelected();
		if(record) {
    		var win = new App.examination.CardTemplateWindow({
    			record:record,
    			model:this.backend.getModel(),
    			scope:this,
    			fn:function(record){
    				this.backend.saveRecord(record);
    			}
    		});
    		win.show();
		}
	},
	
    onDelete: function() {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        }
        this.store.remove(rec);
    },	
    
    saveExamRecord: function(record) {
		if(record.phantom) {
			if(this.examStore.indexOf(record)==-1) {
				this.examStore.insert(0, record);
				Ext.callback(this.fn, this.scope || window, [this.record]);
			} else {
			}
		} else {
		};
	},
	
    	onAddCopy: function(btn,ev){
		var record = this.getSelected();
		if(record) {
			var url = get_api_url('position');
			var path = [url,active_profile];
			var Model = this.backend.getModel();
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
			this.backend.saveRecord(model);
		}
	},
    
    getSelected: function() {
		return this.getSelectionModel().getSelected()
	}
	
	
});



Ext.reg('templateglobalgrid',App.TemplateGlobalGrid);