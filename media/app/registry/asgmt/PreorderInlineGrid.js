Ext.ns('App.assignment');


App.assignment.PreorderInlineGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	loadInstant: false,
	initComponent : function() {
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('extpreorder')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, App.models.preorderModel);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		
		this.store = new Ext.data.Store({
			autoSave:false,
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
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,
		    listeners:{
		    	add:this.onSumChange.createDelegate(this),
		    	remove:this.onSumChange.createDelegate(this),
		    	load:this.onSumChange.createDelegate(this),
		    	scope:this
		    }
		});
		
		if (this.record) {
			this.store.setBaseParam('order',this.record.id);
			this.store.load();
		}
		
		this.staffStore = new Ext.data.Store({
			autoDestroy:true,
			proxy: new Ext.data.HttpProxy({
			    url: get_api_url('position'),
				method:'GET'
			}),
			reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    idProperty: 'id',
			    root: 'objects'
			}, [
			    {name: 'id'},
			    {name: 'staff_name', mapping:'text'}
			])
		})
		this.columns =  [new Ext.grid.RowNumberer({width: 30}),
		    {
		    	header: "Услуга", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_name' 
		    },{
		    	header: "Кол-во", 
		    	width: 10, 
		    	sortable: false, 
		    	hidden: this.shortMode,
		    	dataIndex: 'count', 
		    	editor: new Ext.ux.form.SpinnerField({
		    		minValue: 1,
            		maxValue: 20
            	})
		    }
		];		
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			clicksToEdit:1,
			autoDestroy:true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
					rowselect: function(sm,i,rec) {
						this.getTopToolbar().items.itemAt(0).setDisabled(!rec.phantom);
						this.getTopToolbar().items.itemAt(1).setDisabled(false);
					},
					rowdeselect: function(sm,i,rec) {
						this.getTopToolbar().items.itemAt(0).setDisabled(true);
						this.getTopToolbar().items.itemAt(1).setDisabled(true);
					},
					scope:this
				}
			}),
			tbar:[{
				xtype:'button',
				iconCls:'silk-delete',
				text:'Удалить',
				disabled:true,
				handler:this.delRow.createDelegate(this)
			}],
			viewConfig : {
				forceFit : true
				//getRowClass : this.applyRowClass
			},
			listeners:{
				afteredit:this.onSumChange.createDelegate(this),
				scope:this
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.assignment.PreorderInlineGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('visitcreate', this.onVisitCreate, this);
		this.on('destroy', function(){
			App.eventManager.un('visitcreate', this.onVisitCreate, this);
		},this);
	},
	
	applyRowClass: function() {
		//TODO: сделать разные цвета для сохраненных, новых и отмененных записей
	},
	
	saveBasket: function(){
		this.store.save();
	},
	
	onSumChange: function(){
		var c = 0;
		this.store.each(function(item){
			c+=item.data.price*item.data.count;
		});
		this.fireEvent('sumchange',c);
	},
	
	addRecord: function(attrs){
//		var re = /(.*) \[\d+\]/;
//		var res = re.exec(attrs.text);
		var text = attrs.text//res[res.length-1];
		var id = attrs.id;
		var Preorder = this.store.recordType;
		var s = new Preorder({
			service:App.getApiUrl('extendedservice')+'/'+id, //TODO: replace to App.getApiUrl
			service_name:text,
			patient:this.patientRecord.data.resource_uri,
			count:attrs.c || 1
		});
		this.store.add(s);
		this.getView().focusRow(this.store.getCount()-1);
	},
	
	addRow: function(attrs, can_duplicate, callback, scope) {
		if(!can_duplicate) {
//			var re = /(.*) \[\d+\]/;
//			res = re.exec(attrs.text);
//			var text = res[res.length-1];	
			var id = attrs.id;
			var has_record = false;
			this.store.each(function(rec){
				var serv_id = App.uriToId(rec.data.service);
				var ex_id = App.uriToId(rec.data.execution_place);
                if (serv_id == id) {
                	has_record = true;
                	return 0
                }
            });
            if (has_record) {
            	return false;
            };
		}
		
		this.addRecord(attrs);
		if(callback) {
			Ext.callback(callback, scope);
		}
		
	},
	
	delRow: function() {
		rec = this.getSelectionModel().getSelected();
		if(rec.phantom) {
			this.store.remove(rec);
		}
	},
	
	onSave: function() {
		this.store.save();
	},
	
	getSteps: function(){
		var steps = 0;
		var m = this.store.getModifiedRecords().length;
		var d = this.deletedRecords ? this.deletedRecords.length : 0;
		steps+=m;
		steps+=d;
		return steps;
	},
	
	onVisitCreate: function(record) {
		this.record = record;
		this.onSave();
	}
	
});



Ext.reg('preorderinlinegrid', App.assignment.PreorderInlineGrid);