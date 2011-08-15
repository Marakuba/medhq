Ext.ns('App');
Ext.ns('App.examination');

App.TemplateGlobalGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {		

		this.tmpModel = App.models.tmpModel;

		this.store = new Ext.data.GroupingStore({
			autoLoad:true,
			autoSave:true,
			groupField:'group_name',
		    baseParams: {
		    	format:'json',
		    	staff:active_profile
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
		    		};
		    		App.eventManager.fireEvent('savetemplatecard', rs);
		    	},
		    	scope:this
		    },
		    groupField:'group_name'
		});
		
		this.columns =  [
<<<<<<< HEAD
		    {
		    	header: "Группа", 
		    	hidden:true,
		    	sortable: true, 
		    	dataIndex: 'group_name'
		    },{
=======
			{
				header: "Название шаблона", 
				dataIndex:'group_name',
				hidden:true
			},{
>>>>>>> 952774d853769aee0060fd54f5a9f1ac2f0750ae
		    	header: "Название шаблона", 
		    	width:70,
		    	sortable: true, 
		    	dataIndex: 'name', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Врач", 
		    	width:30,
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
				iconCls:'silk-page-copy',
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
			},'-',{
				xtype:'button',
				enableToggle:true,
				pressed:true,
				toggleGroup:'templare-filter',
				text:'Свои',
                scope:this,
				handler: function(){
					this.store.setBaseParam('staff',active_profile);
					this.store.load();
				}
                
			},{
				xtype:'button',
				enableToggle:true,
				toggleGroup:'templare-filter',
				text:'Все',
                scope:this,
				handler: function(){
                    delete this.store.baseParams['staff'];
                    this.store.load();
                }
			}],
			view : new Ext.grid.GroupingView({
				forceFit : true,
<<<<<<< HEAD
				groupTextTpl: "{text}"
			})			
=======
				groupTextTpl:"{[values.rs[0].data['group_name']]}"
			})
>>>>>>> 952774d853769aee0060fd54f5a9f1ac2f0750ae
		};
		
		this.on('rowdblclick', function(object, rowIndex, e){
            this.onEdit();
        },this);
        
        this.on('afterrender',function(){
           	//this.store.setBaseParam('staff',active_profile);
           	//this.store.load();
        });
        
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.TemplateGlobalGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('templategrid_reload', this.reloadStore, this)
	},
	
	reloadStore: function() {
		this.store.load()	
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



Ext.reg('templateglobalgrid',App.TemplateGlobalGrid);