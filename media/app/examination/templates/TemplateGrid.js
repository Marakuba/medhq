Ext.ns('App');
Ext.ns('App.examination');

App.CardTemplateGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {		

		this.backend = App.getBackend('cardtemplate');	
		//this.cardBackend = new App.ExamBackend({});
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
		
		this.store.load();
		
		this.columns =  [
		    {
		    	header: "Название шаблона", 
		    	width:70,
		    	sortable: true, 
		    	dataIndex: 'name', 
		    	editor: new Ext.form.TextField({})
		    }
		];		
		this.editor = new Ext.ux.grid.RowEditor({
       		saveText: 'Сохранить',
       		cancelText: 'Отменить'
    	});
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
			plugins: [this.editor],
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
				iconCls:'silk-yes',
				text:'Выбрать',
				handler:this.onChoice.createDelegate(this, [])
			}],
			viewConfig : {
				forceFit : true
			}			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.CardTemplateGrid.superclass.initComponent.apply(this, arguments);
	},
	
	onAdd: function(btn,ev){
        var r = new this.store.recordType({
            name : ''
        });
        this.editor.stopEditing();
        this.store.insert(0, r);
        this.editor.startEditing(0);
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
    
    onChoice: function() {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        } else {
        	rec.data['ordered_service'] = this.ordered_service;
        	var win = new App.examination.ExamCardWindow({
        		tmp_record : rec,
				model:this.examModel,
				scope:this,
				fn:function(record){
					this.saveExamRecord(record);
				}
			});
			win.show();
        }
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
    
    getSelected: function() {
		return this.getSelectionModel().getSelected()
	}
	
	
});



Ext.reg('cardtemplategrid',App.CardTemplateGrid);