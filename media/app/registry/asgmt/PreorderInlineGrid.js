Ext.ns('App.assignment');


App.assignment.PreorderInlineGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	loadInstant: false,
	initComponent : function() {
		
		var today = new Date();
		
		this.expiration = today.add(Date.DAY,30)
		
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
		};
		
		this.serviceStore = new Ext.data.Store({
			autoDestroy:true,
			proxy: new Ext.data.HttpProxy({
			    url: get_api_url('extendedservice'),
				method:'GET'
			}),
			reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    idProperty: 'id',
			    root: 'objects'
			}, [
			    {name: 'id'},
			    {name: 'resource_uri'},
			    {name: 'state'}
			])
		});
		
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
		    	header: "Дата выполнения", 
		    	width: 32, 
		    	sortable: true, 
		    	dataIndex: 'expiration',
		    	renderer:Ext.util.Format.dateRenderer('d.m.y'),
		    	editor: new Ext.form.DateField({
		    		minValue: today,
		    		plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], // маска ввода __.__._____ - не надо точки ставить
		    		format:'d.m.Y'
		    	})
		    },{
		    	header: "Цена", 
		    	width: 10, 
		    	sortable: false, 
		    	hidden: this.shortMode,
		    	dataIndex: 'price' 
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
		    },{
		    	header: "Сумма", 
		    	width: 10, 
		    	sortable: false,
		    	hidden: this.shortMode,
		    	dataIndex: 'total',
		    	renderer: function(v,params,rec){
		    		return rec.data.count*rec.data.price
		    	}
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
					},
					rowdeselect: function(sm,i,rec) {
						this.getTopToolbar().items.itemAt(0).setDisabled(true);
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
	
	getPlace: function(ext_serv_id){
		this.serviceStore.setBaseParam('id',ext_serv_id);
		var state = this.serviceStore.load({callback:function(records){
			if (records.length){
				return records[0].data.state;
			} else {
				return 0
			}
		}});
		if (state){
			return state
		} else {
			return ''
		}
	},
	
	addRecord: function(attrs){
//		var re = /(.*) \[\d+\]/;
//		var res = re.exec(attrs.text);
		var text = attrs.text//res[res.length-1];
		var id = attrs.id;
		var Preorder = this.store.recordType;
		var state = this.getPlace(id);
		if (this.card_id){
			var card_resource = App.getApiUrl('card') + '/' + this.card_id
		};
		var s = new Preorder({
			service:App.getApiUrl('extendedservice')+'/'+id, 
			service_name:text,
			promotion: attrs.promotion ? App.getApiUrl('promotion')+'/'+attrs.promotion : '',
			patient:this.patientRecord.data.resource_uri,
			price:attrs.price || null,
			execution_place : state,
			expiration: this.expiration,
			card:card_resource || '',
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
                if (serv_id == id) {
                	rec.data.count += 1;
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