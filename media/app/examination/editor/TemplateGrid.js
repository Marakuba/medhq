Ext.ns('App.examination');

App.examination.TemplateGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	
	initComponent: function(){

//        this.Mess = new Ext.App({});
		this.proxy = new Ext.data.HttpProxy({
        	url: get_api_url('examtemplate')
        });
		this.baseParams = {
            format:'json',
            deleted:false
        };
    
        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        },App.models.Template);
    
        this.writer = new Ext.data.JsonWriter({
            encode: false,
            writeAllFields: true
        }); 
    
        this.store =  this.store || new Ext.data.Store({
            restful: true,    
            autoLoad: false, 
			autoDestroy:true,
            baseParams: this.baseParams,
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
            proxy: this.proxy,
            reader: this.reader,
            writer: this.writer
        });
        
        this.editBtn = new Ext.Button({
			text:'Изменить',
			disabled:true,
			hidden:!this.editable,
			iconCls:'silk-pencil',
			handler:function(){
				var record = this.getSelectionModel().getSelected()
				if (record){
					this.fireEvent('edittmp',record);
				}
			},
			scope:this
		});
		
		this.delBtn = new Ext.Button({
			text:'Удалить',
			disabled:true,
			hidden:!this.editable,
			iconCls:'silk-delete',
			handler:this.onDelete.createDelegate(this, []),
			scope:this
		});
		
		var config = {
			store: this.store,
			autoScroll:true,
			columns:  [
			    {
			    	header: "Наименование", 
			    	width:400,
			    	sortable: true, 
			    	hidden:false,
			    	dataIndex: 'print_name',
			    	renderer:this.printNameRenderer()
			    },{
			    	header: "Наименование1", 
			    	width:400,
			    	sortable: true, 
			    	hidden:true,
			    	dataIndex: 'service_name' 
			    },{
			    	header: "Создано", 
			    	width:70,
			    	sortable: true, 
			    	renderer:Ext.util.Format.dateRenderer('H:i / d.m.Y'),
			    	dataIndex: 'created' 
			    },{
			    	header: "Изменено", 
			    	width:70,
			    	sortable: true, 
			    	renderer:Ext.util.Format.dateRenderer('H:i / d.m.Y'),
			    	dataIndex: 'modified' 
			    }
			],
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners:{
					scope:this,
					rowselect:function(selModel,rowIndex,record){
						this.fireEvent('rowselect',record);
						this.editBtn.enable();
						this.delBtn.enable();
					},rowdeselect:function(selModel,rowIndex,record){
						this.editBtn.disable();
						this.delBtn.disable();
					}
				}
			}),
			tbar:[this.editBtn,
				this.delBtn,
				{
					xtype:'button',
					text:'Обновить',
					iconCls:'x-tbar-loading',
					handler:function(){
						this.store.load()
					},
					scope:this
				}
			],
            viewConfig: {
                forceFit: true
            }
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
	    App.examination.TemplateGrid.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
			if (this.staff){
				this.store.setBaseParam('staff',App.uriToId(this.staff));
				this.store.setBaseParam('base_service__isnull',true);
				this.store.load();
			}
		}, this);
		
    },
    
    printNameRenderer: function(){
    	var self = this;
    	return function(value,metaData,record){
    		if (self.printName){
    			return value
    		} else {
    			return record.data.print_name
    		}
    	}
    },
    
    onDelete: function() {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        }
        rec.set('deleted',true);
        this.store.load();
    },
    
    printNameRenderer: function(){
    	var self = this;
    	return function(value,metaData,record){
    		if (self.printName){
    			return value
    		} else {
    			return record.data.service_name
    		}
    	}
    }

});

Ext.reg('templategrid', App.examination.TemplateGrid);
