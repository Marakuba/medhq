Ext.ns('App');
Ext.ns('App.examination');

App.ExamCardGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {	
		
		//this.orderedService = this.orderedService==undefined ? false : this.orderedService;

		//this.backend = App.getBackend('examcard');
		
		this.examModel = new Ext.data.Record.create([
			{name: 'id'},
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
		
		//this.store = this.backend.store;
		
		//this.store.load();
		
		this.columns =  [
		    {
		    	header: "Характер заболевания", 
		    	width:70,
		    	sortable: true, 
		    	dataIndex: 'disease' 
		    	//editor: new Ext.form.TextField({})
		    }
		];		
		
		var config = {
			//id: 'teplare-grid',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			store:this.store,
			closable:true,
			title: 'Карты осмотра',
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
				iconCls:'silk-edit',
				text:'Изменить',
				handler:this.onEdit.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-delete',
				text:'Удалить',
				handler:this.onDelete.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-print',
				text:'Печать',
				handler:this.onPrint.createDelegate(this, [])
			}],
			viewConfig : {
				forceFit : true
			}			
		};
		
		this.on('afterrender',function(){
            if (this.ordered_service) {
            	this.store.setBaseParam('ordered_service', App.uriToId(this.ordered_service));
            }
        })

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.ExamCardGrid.superclass.initComponent.apply(this, arguments);
	},
	
	onAdd: function() {
		var win = new App.examination.TemplatesWindow({
			scope:this,
			ordered_service:this.ordered_service,
			fn:function(){
				this.store.load();
			}
		});
		win.show();
	},
	
	onEdit: function(rowindex){
		var record = this.getSelected();
		if(record) {
    		var win = new App.examination.ExamCardWindow({
    			record:record,
    			model:this.store.recordType,
    			scope:this,
    			fn:this.saveRecord(record)
    		});
    		win.show();
		}
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
	
    onDelete: function() {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        }
        this.store.remove(rec);
    },	
    
    getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onPrint : function(){
		var record = this.getSelected();
		if(record) {
			window.open('/exam/card/'+record.data.id+'/');
		}
	}
	
});



Ext.reg('examcardgrid',App.ExamCardGrid);