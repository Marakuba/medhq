Ext.ns('App');
Ext.ns('App.examination');

App.AllExamGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {	
		
		//this.orderedService = this.orderedService==undefined ? false : this.orderedService;

		//this.backend = App.getBackend('examcard');
		
		this.tmp_id = Ext.id();
		
		this.examModel = App.models.examModel;

		this.store = new Ext.data.Store({
			//autoLoad:true,
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
		    	header: "Пациент", 
		    	width:100,
		    	sortable: true, 
		    	dataIndex: 'patient_name' 
		    },{
		    	header: "Обследование", 
		    	width:100,
		    	sortable: true, 
		    	dataIndex: 'view' 
		    }/*,{
		    	header: "Дата создания", 
		    	width:70,
		    	sortable: true, 
		    	dataIndex: 'created' ,
		    	renderer:function(val, meta, record) {
		    		var p = record.data.created;
		    		return String.format(Ext.util.Format.date(p, 'd.m.Y H:i'));
		    	}
		    },{
		    	header: "Дата изменения", 
		    	width:70,
		    	sortable: true, 
		    	dataIndex: 'modified',
		    	renderer:function(val, meta, record) {
		    		var p = record.data.modified;
		    		return String.format(Ext.util.Format.date(p, 'd.m.Y H:i'));
		    	}
		    }*/
		];		
		
		var config = {
			id: 'all-exam-grid',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			autoScroll:true,
			store:this.store,
			closable:true,
			title: this.title ? this.title : 'Карты осмотра',
			columns:this.columns,
			listeners: {
				rowdblclick:this.onChoice.createDelegate(this, [])
			},
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
					rowselect:function(model,ind,rec) {
						if (this.patient){ //Если форма открыта из карты осмотра для копирования документа
							Ext.getCmp(this.tmp_id+'-choice-btn').enable()
						}
						
					},
					rowdeselect: function() {
						Ext.getCmp(this.tmp_id+'-choice-btn').disable()
					},
					scope:this
				}
			}),
			tbar:[{
				xtype:'button',
				iconCls:'silk-accept',
				id:this.tmp_id+'-choice-btn',
				text:'Выбрать',
				disabled:true,
				handler:this.onChoice.createDelegate(this, [])
			},{
				xtype:'button',
				iconCls:'silk-printer',
				text:'Посмотреть',
				handler:this.onPrint.createDelegate(this, [])
			}],
			bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true
			}			
		};
		
		this.on('afterrender',function(){
			if (this.patient) {
				this.store.setBaseParam('ordered_service__order__patient',this.patient);
				//Ext.getCmp(this.tmp_id+'-choice-btn').enable();
			};
			this.store.load();
			
        })

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.AllExamGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('examcardgrid_reload', this.reloadStore, this)
		this.on('destroy', function(){
		    App.eventManager.un('examcardgrid_reload', this.reloadStore, this) 
		},this);
	},
	
	reloadStore: function() {
		this.store.load()	
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
			window.open('/exam/examcard/'+record.data.id+'/');
		}
	},
	
	onChoice: function() {
		//Если в форму передан пациент, то этот grid вызван из формы карты осмотра, 
		//значит нужно передать выбранный документ в ту форму
		//Иначе: просто смотрим выбранный документ
		if (this.patient){
			var record = this.getSelected();
        	Ext.callback(this.fn, this.scope || window, [record]);
		} else {
			this.onPrint();
		}
                
    }
	
});



Ext.reg('allexamgrid',App.AllExamGrid);