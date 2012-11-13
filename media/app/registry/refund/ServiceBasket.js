Ext.ns('App.refund');

App.refund.StaffWindow = Ext.extend(Ext.Window, {

	initComponent:function(){
		/*this.staffStore = new Ext.data.Store({
			autoDestroy:true,
			proxy: new Ext.data.HttpProxy({
			    url: '/dashboard/api/v1/position',
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
		});*/
		this.staffStore = new Ext.data.ArrayStore({
		    fields: ['id', 'staff_name'],
		    data : this.staffList
		});
		this.staff = new Ext.form.ComboBox({
			fieldLabel:'Врач',
			name:'staff',
			allowBlank:false,
    		store:this.staffStore,
    		mode:'local',
	    	selectOnFocus:true,
		    typeAhead: true,
		    triggerAction: 'all',
		    valueField: 'id',
		    displayField:'staff_name',
		    editable:false
		});
		this.staff.setValue(this.staffList[0][0]);
		this.form = new Ext.form.FormPanel({
			layout:'form',
			items: this.staff
		});

		config = {
			title:'Выберите врача',
			width:380,
			height:120,
			layout:'fit',
			defaults:{
				baseCls:'x-border-layout-ct',
				border:false
			},
			items: this.form,
			modal:true,
			border:false,
			buttons:[{
				text:'Выбрать',
				handler:this.onSubmit.createDelegate(this,[])
			},{
				text:'Отменить',
				handler:function(){
					this.fireEvent('declinestaff');
					this.close();
				},
				scope:this
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.refund.StaffWindow.superclass.initComponent.apply(this, arguments);

		this.addEvents({
			validstaff:true,
			declinestaff:true
		});
	},

	onSubmit:function()
	{
		var staff = this.staff;
		if(id=staff.getValue()){
			var idx = staff.getStore().find('id',id);
			var name = staff.getStore().getAt(idx).data.staff_name;
			this.fireEvent('validstaff', this.index, id, name);
			this.close();
		}

	}
});

App.refund.ServiceBasket = Ext.extend(Ext.grid.EditorGridPanel, {

	loadInstant: false,
	initComponent : function() {

		this.shortMode = this.type=='material';

		this.proxy = new Ext.data.HttpProxy({
		    url: App.utils.getApiUrl('visit','refundbasket')
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
		    id: Ext.id(),
			autoDestroy:true,
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
						WebApp.fireEvent('refundclose');
		    		}
		    	},
		    	add:function(){
		    		WebApp.fireEvent('sumchange');
		    	},
		    	remove:function(){
		    		WebApp.fireEvent('sumchange');
		    	},
		    	load:function(){
		    		WebApp.fireEvent('sumchange');
		    	},
		    	scope:this
		    }
		});
		this.staffStore = new Ext.data.Store({
			autoDestroy:true,
			proxy: new Ext.data.HttpProxy({
			    url: App.utils.getApiUrl('staff','position'),
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
		    	header: "vID",
		    	width: 50,
		    	sortable: true,
		    	dataIndex: 'order',
		    	hidden:true
		    },{
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
		    	hidden:true,
		    	dataIndex: 'staff_list'
		    },{
		    	header: "Врач",
		    	width: 50,
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
		    	/*editor: new Ext.form.ComboBox({
		    		store:this.staffStore,
		    		mode:'remote',
			    	selectOnFocus:true,
				    typeAhead: true,
				    triggerAction: 'all',
				    valueField: 'id',
				    displayField:'staff_name',
				    editable:false
				    //queryParam:'staff__last_name__istartswith'
		    	})*/
		    },{
		    	header: "Количество",
		    	width: 50,
		    	sortable: false,
		    	hidden: this.shortMode,
		    	dataIndex: 'count',
		    	editor: new Ext.ux.form.SpinnerField({
		    		minValue: 1,
            		maxValue: 20
            	})
		    },{
		    	header: "Цена",
		    	width: 50,
		    	sortable: false,
		    	hidden: this.shortMode,
		    	dataIndex: 'price'
		    	//editor: new Ext.form.TextField({})
		    },{
		    	header: "Сумма",
		    	width: 50,
		    	sortable: false,
		    	hidden: this.shortMode,
		    	dataIndex: 'total',
		    	renderer: function(v,params,rec){
		    		return rec.data.count*rec.data.price
		    	}
		    	//editor: new Ext.form.TextField({})
		    }
		];

		var id = Ext.id();
		var config = {
			id:id,
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			clicksToEdit:1,
			autoDestroy:true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
			tbar:[{
				xtype:'button',
				iconCls:'silk-delete',
				text:'Удалить',
				handler:this.delRow.createDelegate(this,[])
			}/*,{
				xtype:'button',
				//iconCls:'silk-delete',
				text:'Сохранить',
				handler:this.saveBasket.createDelegate(this,[])
			}*/],
			viewConfig : {
				forceFit : true
				//getRowClass : this.applyRowClass
			},
			listeners:{
				afteredit:function(){
					WebApp.fireEvent('sumchange');
				},
				scope:this
			}

		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.refund.ServiceBasket.superclass.initComponent.apply(this, arguments);
		WebApp.on('servicedblclick', this.addRow, this);

		this.on('destroy', function(){
		    WebApp.un('servicedblclick', this.addRow, this);
		},this);
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

	updateStaff: function(index, id, staff_name){
		var rec = this.store.getAt(index);
		rec.beginEdit();
		rec.set('staff',App.utils.getApiUrl('staff', 'position', id));
		rec.set('staff_name',staff_name);
		rec.endEdit();
	},

	saveBasket: function(){
		this.store.save();
	},

	getTotalSum: function(){
		var c=0;
		this.store.each(function(rec){
			c += rec.data.price*rec.data.count;
			return true;
		});
		return c;

		//this.fireEvent('updatetotalsum',c);  ////R

		//var p = Ext.getCmp('total-count-panel');
		//p.tpl.overwrite(p.body,{total:c});
		//return c
	},

	addRecord: function(attrs){
		var Service = this.store.recordType;
		var re = /(.*) \[\d+\]/;
		var res = re.exec(attrs.text);
		var text = res[res.length-1];
		var ids = attrs.id.split('-');
		var id = ids[0];
		var place = ids[1];
		var s = new Service({
			service:App.utils.getApiUrl('service', 'baseservice', id),
			service_name:text,
			price:attrs.price,
			count:1,
			execution_place:App.utils.getApiUrl('state', 'state', place)
		});
		this.stopEditing();
		this.store.add(s);
		this.startEditing(0, 0);
	},

	addRow: function(attrs) {
		var re = /(.*) \[\d+\]/;
		res = re.exec(attrs.text);
		var text = res[res.length-1];
		if(!this.store.query('service_name',text).length){
			if(attrs.staff){
				this.addRecord(attrs);
				var last = this.store.getCount()-1;
				this.staffWindow(last,attrs.id);
			} else {
				this.addRecord(attrs);
			}
		}
	},

	delRow: function() {
		rec = this.getSelectionModel().getSelected();
		this.store.remove(rec);
	}

	/*onPatientSelect: function(rec) {
		this.store.load({
			params: {
				'order__patient': rec.data.id
			}
		});
	}*/


});



Ext.reg('refundservicebasket', App.refund.ServiceBasket);
