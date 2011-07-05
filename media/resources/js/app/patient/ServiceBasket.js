Ext.ns('App.patient');

App.patient.StaffWindow = Ext.extend(Ext.Window, {

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
		
		this.staff = new Ext.form.ComboBox({
			fieldLabel:'Врач',
			name:'staff',
			allowBlank:false,
    		store:new Ext.data.ArrayStore({
			    fields: ['id', 'staff_name'],
			    data : this.staffList
			}),
    		mode:'local',
	    	selectOnFocus:true,
		    typeAhead: true,
		    triggerAction: 'all',
		    valueField: 'id',
		    displayField:'staff_name',
		    editable:false
		});
		
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
			}/*,{
				text:'Отменить',
				handler:this.close.createDelegate(this,[])
			}*/]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.StaffWindow.superclass.initComponent.apply(this, arguments);
		
		this.addEvents({validstaff:true});
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

App.patient.ServiceBasket = Ext.extend(Ext.grid.EditorGridPanel, {

	loadInstant: false,
	initComponent : function() {
		
		this.shortMode = this.type=='material';
		
		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: '/dashboard/api/v1/servicebasket'
		});
		
		// Typical JsonReader.  Notice additional meta-data params for defining the core attributes of your json-response
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'  // <-- New "messageProperty" meta-data
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
		
		// The new DataWriter component.
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
			    start : 'offset',  // The parameter name which specifies the start row
			    limit : 'limit',  // The parameter name which specifies number of rows to return
			    sort : 'sort',    // The parameter name which specifies the column to sort on
			    dir : 'dir'       // The parameter name which specifies the sort direction
			},
		    restful: true,     // <-- This Store is RESTful
		    proxy: this.proxy,
		    reader: this.reader,
		    writer: this.writer,
		    listeners:{
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
		})
		this.columns =  [new Ext.grid.RowNumberer({width: 30}),
		    {
		    	header: "vID", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'order',
		    	hidden:true
		    },{
		    	width: 5, 
		    	sortable: true, 
		    	dataIndex: 'execution_place', 
		    	renderer: function(val) {
		    		var s = val.split('/');
		    		return "<img src='/media/resources/images/state_"+s[s.length-1]+".png'>"
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
					App.eventManager.fireEvent('sumchange');
				},
				scope:this
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.ServiceBasket.superclass.initComponent.apply(this, arguments);
		
	},
	
	staffWindow: function(index, service){
		var t = Ext.getCmp('service-panel');
		var node = t.getNodeById(service);
		if(node){
			var sl = node.attributes.staff;
			if(sl) {
				var win = new App.patient.StaffWindow({index:index, staffList:sl});
				win.on('validstaff', this.updateStaff, this);
				win.show();
				
			}
		}
	},
	
	updateStaff: function(index, id, staff_name){
		var rec = this.store.getAt(index);
		rec.beginEdit();
		rec.set('staff',"/dashboard/api/v1/position/"+id);
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
	
	addRow: function(attrs) {
		var Service = this.store.recordType;
		var s = new Service({
			service:"/dashboard/api/v1/baseservice/"+attrs.id,
			service_name:attrs.text,
			price:attrs.price,
			count:1,
			execution_place:"/dashboard/api/v1/state/"+attrs.place
		});
		this.stopEditing();
		this.store.add(s);
		this.startEditing(0, 0);
		var last = this.store.getCount()-1;
		if(attrs.staff){
			this.staffWindow(last,attrs.id);
		}
		//console.log('last record:', c);
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



Ext.reg('patientservicebasket',App.patient.ServiceBasket);