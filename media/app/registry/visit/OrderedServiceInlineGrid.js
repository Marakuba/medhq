Ext.ns('App.visit');


App.visit.OrderedServiceInlineGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	loadInstant: false,
	initComponent : function() {
		
		this.shortMode = this.type=='material';
		
		this.deletedRecords = [];
		
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('servicebasket')
		});
		
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'order', allowBlank: true},
		    {name: 'service', allowBlank: true},
		    {name: 'service_name', allowBlank: true},
		    {name: 'staff', allowBlank: true},
		    {name: 'staff_name', allowBlank: true},
		    {name: 'staff_list', allowBlank: true},
		    {name: 'count', allowBlank: false},
		    {name: 'price', allowBlank: false},
		    {name: 'execution_place', allowBlank: false},
		    {name: 'total', allowBlank: true}
		]);
		
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
		    	write: function(store, action, result, res, rs) {
	    			var pb = Ext.getCmp('global-progress-bar');
		    		var modified = store.getModifiedRecords().length;
	    			elapse = this.startModified - modified;
	    			pb.updateProgress(1-modified/this.startModified,'Сохранено '+elapse+' из '+this.startModified+' записей');
		    		if (modified==0){
						var sb = Ext.getCmp('global-status-bar');
						sb.setStatus({
							text:'Готово',
							iconCls:'x-status-valid'
						});
//						Ext.getCmp('barcode-print-btn').enable();
//						Ext.getCmp('visit-print-btn').enable();
//						Ext.getCmp('sampling-print-btn').enable();
						Ext.getCmp('visit-submit-btn').enable();
						pb.hide();
						App.eventManager.fireEvent('visitclose');
		    		}
		    	},
		    	add:function(){
		    		App.eventManager.fireEvent('sumchange');
		    	},
		    	remove:function(){
		    		App.eventManager.fireEvent('sumchange');
		    	},
		    	load:function(){
		    		App.eventManager.fireEvent('sumchange');
		    	},
		    	scope:this
		    }
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
		    	header: "МВ",
		    	width: 5, 
		    	dataIndex: 'execution_place', 
		    	renderer: function(val) {
		    		var s = val.split('/');
		    		return "<img src='"+MEDIA_URL+"resources/images/state_"+s[s.length-1]+".png'>"
		    	}
		    },{
		    	header: "Услуга", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_name' 
		    },{
		    	header: "Врач", 
		    	width: 30, 
		    	hidden: this.shortMode,
		    	sortable: true, 
		    	dataIndex: 'staff_name',
		    	renderer: function(val) {
		    		return val //? val.staff_name : '';
		    	},
		    	listeners:{
		    		click: function(col,grid,i,e){
		    			var rec = grid.store.getAt(i);
		    			var s = rec.data.service.split('/');
		    			s = s[s.length-1];
		    			this.staffWindow(i,s);
		    			/*var node = t.getNodeById(rec.data.service);
		    			var sl = node.attributes.staff;
		    			if(sl) {
		    				var win = new App.patient.StaffWindow({index:i, staffList:sl});
		    				win.on('validstaff', this.updateStaff, this);
		    				win.show();
		    				
		    			}*/
		    			//console.log(rec.data.staff_list);
		    			//Ext.MessageBox.alert('Column clicked',i);
		    		},
		    		scope:this
		    	}
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
		    	header: "Цена", 
		    	width: 10, 
		    	sortable: false, 
		    	hidden: this.shortMode,
		    	dataIndex: 'price' 
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
			},{
				xtype:'button',
				text:'Изменить врача',
				disabled:true,
				handler:this.changeStaff.createDelegate(this)
			}],
			viewConfig : {
				forceFit : true
				//getRowClass : this.applyRowClass
			},
			listeners:{
				afteredit:function(){
//					App.eventManager.fireEvent('sumchange');
				},
				scope:this
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.visit.OrderedServiceInlineGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('visitcreate', this.onVisitCreate, this);
		this.on('destroy', function(){
			App.eventManager.un('visitcreate', this.onVisitCreate, this);
		},this);
	},
	
	applyRowClass: function() {
		//TODO: сделать разные цвета для сохраненных, новых и отмененных записей
	},
	
	staffWindow: function(index, service){
		var t = Ext.getCmp('service-panel');
		var node = t.getNodeById(service);
		if(node){
			var sl = node.attributes.staff;
			if(sl) {
				var win = new App.visit.StaffWindow({index:index, staffList:sl});
				win.on('validstaff', this.updateStaff, this);
				win.show();
				
			}
		}
	},
	
	updateStaff: function(rec, id, staff_name){
		rec.beginEdit();
		rec.set('staff',"/api/v1/dashboard/position/"+id);
		rec.set('staff_name',staff_name);
		rec.endEdit();
	},
	
	saveBasket: function(){
		this.store.save();
	},
	
	getTotalSum: function(){
		var c = this.store.sum('total');
		return c
	},
	
	addRecord: function(attrs){
		var re = /(.*) \[\d+\]/;
		var res = re.exec(attrs.text);
		var text = res[res.length-1];
		var ids = attrs.id.split('-');
		var id = ids[0];
		var place = ids[1];
		var Service = this.store.recordType;
		var s = new Service({
			service:"/api/v1/dashboard/baseservice/"+id, //TODO: replace to App.getApiUrl
			service_name:text,
			price:attrs.price,
			staff:attrs.staff || null,
			staff_name:attrs.staff_name || '',
			count:1,
			execution_place:"/api/v1/dashboard/state/"+place  //TODO: replace to App.getApiUrl
		});
		this.stopEditing();
		this.store.add(s);
		this.startEditing(0, 0);
	},
	
	addRow: function(attrs, can_duplicate) {
		if(!can_duplicate) {
			var re = /(.*) \[\d+\]/;
			res = re.exec(attrs.text);
			var text = res[res.length-1];		
			if(this.store.query('service_name',text).length){
				return false;
			}
		}
		if(attrs.staff){
			this.addRecord(attrs);
//				var last = this.store.getCount()-1;
//				this.staffWindow(last,attrs.id);
		} else {
			this.addRecord(attrs);
		}
	},
	
	delRow: function() {
		rec = this.getSelectionModel().getSelected();
		if(rec.phantom) {
			this.store.remove(rec);
		}
	},
	
	changeStaff: function() {
		rec = this.getSelectionModel().getSelected();
	},
	
	onSave: function() {
		if(this.record) {
			var records = this.store.queryBy(function(rec,id){
				return rec.data.order ? false : true;
			});
			records.each(function(item,idx,len){
				item.beginEdit();
				item.set('order', this.record.data.resource_uri);
				item.endEdit();
			}, this);
			this.store.save();
		} else {
			Ext.MessageBox.alert('Ошибка','Не задана запись визита!');
		}
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



Ext.reg('orderedserviceinlinegrid', App.visit.OrderedServiceInlineGrid);