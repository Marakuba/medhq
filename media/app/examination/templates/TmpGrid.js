Ext.ns('App.examination');

App.examination.TmpGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	
	initComponent: function(){

//        this.Mess = new Ext.App({});
		this.proxy = new Ext.data.HttpProxy({
        	url: get_api_url('examtemplate')
        });
		this.baseParams = Ext.apply({
            format:'json',
            deleted:false,
            staff:active_staff
        },this.baseParams);
    
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
            autoSave: false,
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
        
        this.store.on('load', function(){
			
		}, this);
		
		this.store.on('write', function(store, action, result, res, rs){
			if (action=='create'){
				this.fireEvent('edittmp',rs);
			}
		}, this);
		
		this.addBtn = new Ext.Button({
			text:'Добавить',
			disabled:false,
			hidden:!this.editable,
			iconCls:'silk-add',
			handler:this.onAdd,
			scope:this
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
		
		if(!this.emptyTbar){
			
			this.tbar = this.tbar || [this.addBtn, this.editBtn,	this.delBtn];
			
			this.tbar.push({
				xtype:'button',
				text:'Обновить',
				iconCls:'x-tbar-loading',
				handler:function(){
					this.store.load()
				},
				scope:this
			});
		} else {
			this.tbar = undefined
		};
		
		
		var config = {
			store: this.store,
			border:false,
			autoScroll:true,
			columns:  [
			    {
			    	header: "Наименование", 
			    	width:400,
			    	sortable: true, 
			    	hidden:false,
			    	dataIndex: 'name',
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
						this.fireEvent('rowdeselect',record);
						this.editBtn.disable();
						this.delBtn.disable();
					}
				}
			}),
			tbar:this.tbar,
			bbar: new Ext.PagingToolbar({
	            pageSize: 150,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Записи {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),

            viewConfig: {
            	emptyText:'нет шаблонов',
                forceFit: true
            }
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
	    App.examination.TmpGrid.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
			this.store.load({
				callback : function(){
//					this.getSelectionModel().selectFirstRow();
				},
				scope:this
			});
		}, this);
		
    },
    
    printNameRenderer: function(){
    	var self = this;
    	return function(value,metaData,record){
    		if (value){
    			return value
    		} else {
    			var data = Ext.decode(record.data.data);
    			var name = '';
    			Ext.each(data.tickets,function(ticket){
    				if (ticket.xtype == 'titleticket'){
    					name = ticket.value;
    					return
    				}
    			})
    			return name
    		}
    	}
    },
    
    onDelete: function() {
        var rec = this.getSelectionModel().getSelected();
        if (!rec) {
            return false;
        }
        rec.set('deleted',true);
        this.store.save();
        this.editBtn.disable();
        this.delBtn.disable();
        this.store.load();
    },
    
    onAdd: function(){
		Ext.Msg.prompt('Название', 'Введите название шаблона:', function(btn, text){
		    if (btn == 'ok'){
		    	var emptyData = Ext.encode({'tickets':[]});
				this.record = new this.store.recordType();
				this.record.set('data',emptyData);
				this.record.set('staff',App.getApiUrl('staff',active_staff));
				this.record.set('name',text);
				this.store.add(this.record);
				this.store.save();
		    }
		},this);
	}

});

Ext.reg('tmpgrid', App.examination.TmpGrid);
