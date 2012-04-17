Ext.ns('App.visit');


App.visit.OrderedServiceInlineGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	loadInstant: false,
	
	preorders : new Ext.util.MixedCollection({}),
	
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
		    {name: 'total', allowBlank: true},
		    {name: 'assigment', allowBlank: true},
		    {name: 'preorder', allowBlank: true}
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
		    	add:this.onSumChange.createDelegate(this),
		    	remove:this.onSumChange.createDelegate(this),
//		    	load:this.onSumChange.createDelegate(this),
		    	exception: function(){
		    		this.fireEvent('basketexception')
		    	},
		    	scope:this
		    },
		    doTransaction : function(action, rs, batch) {
		        function transaction(records) {
		            try{
		                this.execute(action, records, undefined, batch);
		            }catch (e){
		                this.handleException(e);
		            }
		        }
		        this.batch=true;
		        transaction.call(this, rs);
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
		    	header: "МВ",
		    	width: 3, 
		    	css:'padding:0px!important;',
		    	dataIndex: 'execution_place', 
		    	renderer: function(val) {
		    		colors = {
		    			"5":"black",
		    			"1":"green",
		    			"7":"green",
		    			"4":"red",
		    			"6":"green"
		    		};
		    		var s = val.split('/');
		    		return String.format("<span style='font-weight:bolder;font-size:19px;padding:3px 0 0 3px;color:{0}'>+</span>", colors[s[s.length-1]]);
//		    		return "<img src='"+MEDIA_URL+"resources/images/state_"+s[s.length-1]+".png'>"
		    	}
		    },{
		    	header: "Услуга", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'service_name' 
		    },{
		    	hidden:true,
		    	dataIndex: 'preorder' 
		    },{
		    	header: "Врач", 
		    	width: 30, 
		    	hidden: this.shortMode,
		    	sortable: true, 
		    	dataIndex: 'staff_name',
		    	renderer: function(val) {
		    		return val //? val.staff_name : '';
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
		
		this.undoBtn = new Ext.Button({
			text:'Назад',
			disabled:true,
			scope:this,
			handler:function(){
				this.fireEvent('undo');
			}
		});
		
		this.redoBtn = new Ext.Button({
			text:'Вперед',
			disabled:true,
			scope:this,
			handler:function(){
				this.fireEvent('redo');
			}
		})
		
		var config = {
			id:'ordered-service-inline-grid',
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
			},this.undoBtn,this.redoBtn],
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
		var ids = attrs.id.split('-');
		var id = ids[0];
		var place = ids[1];
		var Service = this.store.recordType;
		var s = new Service({
			service:App.getApiUrl('baseservice') + '/' + id, 
			service_name:text,
			price:attrs.price,
			staff:attrs.staff_id ? App.getApiUrl('staff') + '/'+attrs.staff_id : null,
			staff_name:attrs.staff_name || '',
			count:attrs.c || 1,
			execution_place:App.getApiUrl('state') + '/'+place 
		});
		this.store.add(s);
		this.getView().focusRow(this.store.getCount()-1);
	},
	
	addRow: function(attrs, can_duplicate, callback, scope) {
		if(!can_duplicate) {
//			var re = /(.*) \[\d+\]/;
//			res = re.exec(attrs.text);
//			var text = res[res.length-1];	
			var ids = attrs.id.split('-');
			var has_record = false;
			this.store.each(function(rec){
				var serv_id = App.uriToId(rec.data.service);
				var ex_id = App.uriToId(rec.data.execution_place);
                if ((serv_id == ids[0]) && (ex_id == ids[1])) {
                	has_record = true;
                	return 0
                }
            });
            if (has_record) {
            	return false;
            };
		}
		if(attrs.staff){
			var box = App.visit.StaffBox;
			box.show({
				text:attrs.text,
				staffList:attrs.staff,
				fn:function(button,rec,opts){
					if(button=='ok' && rec) {
						attrs.staff_id = rec.data.id;
						attrs.staff_name = rec.data.staff_name;
						this.addRecord(attrs);
					}
					if(callback) {
						Ext.callback(callback, scope);
					}
				},
				scope:this
			});
		} else {
			this.addRecord(attrs);
			if(callback) {
				Ext.callback(callback, scope);
			}
		}
	},
	
	delRow: function() {
		rec = this.getSelectionModel().getSelected();
		if(rec.phantom) {
			this.store.remove(rec);
		}
	},
	
	changeStaff: function() {
		var rec = this.getSelectionModel().getSelected();
		Ext.Ajax.request({
			url:get_api_url('extendedservice'),
			method:'GET',
			success:function(response, opts){
				var obj = Ext.decode(response.responseText);
				var staff = obj.objects[0].staff;
				if(staff) {
					App.visit.StaffBox.show({
						staffList:staff,
						fn:function(button,r,opts){
							if(button=='ok' && r) {
								rec.beginEdit();
								rec.set('staff',get_api_url('staff')+'/'+r.data.id);
								rec.set('staff_name',r.data.staff_name);
								rec.endEdit();
							}
						},
						scope:this
					});
				} else {
					App.StatusBar.setStatus({
                        text: 'Для данной услуги врачи не назначены!',
                        iconCls: 'x-status-error',
                        clear: true // auto-clear after a set interval
                    });
				}
			},
			failure:function(response, opts){
				Ext.MessageBox.alert('Ошибка','Во время получения данных о врачах произошла ошибка на сервере!');
			},
			params:{
				base_service__id:App.uriToId(rec.data.service),
				state__id:App.uriToId(rec.data.execution_place)
			}
		});
	},
	
	onSave: function() {
		if(this.record) {
			var records = this.store.queryBy(function(rec,id){
				return rec.data.order ? false : true;
			});
			var ps;
			records.each(function(item,idx,len){
				item.beginEdit();
				item.set('order', this.record.data.resource_uri);
				item.endEdit();
				var preorder = this.preorders.get(item.data.preorder);
				if (preorder) {
					if(!ps) {
						ps = preorder.store;
						ps.autoSave = false;
					}
					preorder.set('visit',this.record.data.resource_uri)
				}
			}, this);
			if(ps){
				ps.save();
				ps.autoSave = true;
			}
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
		if (steps > 0) {
			steps = 1;
		}
		return steps;
	},
	
	onVisitCreate: function(record) {
		this.record = record;
		this.onSave();
	},
	
	setRecord: function(record){
		this.record = record;
		if (this.record) {
			this.store.setBaseParam('order',this.record.id);
			this.store.load();
		}
	}
	
});



Ext.reg('orderedserviceinlinegrid', App.visit.OrderedServiceInlineGrid);