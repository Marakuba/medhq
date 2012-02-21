Ext.ns('App.examination');

App.examination.CardGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	
	initComponent: function(){

		//передаваемые параметры: 
		//editable - показывает кнопки Изменить и Удалить
		
		this.proxy = new Ext.data.HttpProxy({
        	url: get_api_url('card')
        });
		this.baseParams = {
            format:'json',
            deleted:false,
            'ordered_service__staff': active_profile
        };
    
        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, App.models.Card);
    
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
			hidden:!this.editable,
			disabled:true,
			iconCls:'silk-pencil',
			handler:function(){
				var record = this.getSelectionModel().getSelected()
				if (record){
					this.fireEvent('editcard',record);
				}
			},
			scope:this
		});
		
		this.delBtn = new Ext.Button({
			text:'Удалить',
			hidden:!this.editable,
			disabled:true,
			iconCls:'silk-delete',
			handler:this.onDelete.createDelegate(this, []),
			scope:this
		});
		
		var config = {
			store: this.store,
			autoScroll:true,
			border:false,
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
			    	header: this.fromTrash ? "Удалено": "Изменено", 
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
						if(this.editable){
							this.editBtn.enable();
							this.delBtn.enable();
						}
					},
					rowdeselect:function(selModel,rowIndex,record){
						if(this.editable){
							this.editBtn.disable();
							this.delBtn.disable();
						}
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
	    App.examination.CardGrid.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
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

Ext.reg('cardgrid', App.examination.CardGrid);
