Ext.ns('App.manual');

App.manual.ManualGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
		this.store = new Ext.data.RESTStore({
			autoSave : true,
			autoLoad : true,
			apiUrl : get_api_url('labservice'),
			model: App.models.LabService
		});
		
//		this.store.on('load',function(store, records, options){
//			this.setTitle(String.format("{0} ({1})", this.baseTitle, records.length));
//		},this);

		
		this.dateField = new Ext.form.DateField({
			emptyText:'дата',
			format:'d.m.Y',
			plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], // маска ввода __.__._____ - не надо точки ставить
			minValue:new Date(1901,1,1),
			width:80
		});
		
		this.timeField = new Ext.form.TimeField({
			emptyText:'время',
			width:55,
			format:'H:i'
		});
		
		this.staffField = new Ext.form.LazyComboBox({
			emptyText:'врач',
			store: new Ext.data.JsonStore({
				autoLoad:true,
				proxy: new Ext.data.HttpProxy({
					url:get_api_url('position'),
					method:'GET'
				}),
				root:'objects',
				idProperty:'resource_uri',
				fields:['resource_uri','name','title']
			}),
			displayField:'name',
			width:120
		});
		
		this.printBtn = new Ext.Button({
			iconCls:'silk-printer',
			handler:function(){
				var rec = this.getSelectionModel().getSelected();
				if(rec) {
					var url = String.format('/lab/print/manualresults/{0}/?preview=yes', rec.id);
					window.open(url);
				}
			},
			scope:this
		});
		
		this.ttb = new Ext.Toolbar({ 
			items:[this.dateField, this.timeField, {
					iconCls:'silk-date-go',
					tooltip:'Устанавливает текущую дату и время',
					handler:function(){
						var now = new Date();
						this.dateField.setValue(now);
						this.timeField.setValue(now);
					},
					scope:this
				},
			
				this.staffField, {
					iconCls:'silk-user-go',
					tooltip:'Текущий пользователь',
					handler:function(){
						this.staffField.setValue(String.format('/api/v1/dashboard/position/{0}', active_profile));
					},
					scope:this
				},'-',{
					iconCls:'silk-accept',
					text:'Подтвердить',
					handler: function(){
						var rec = this.getSelectionModel().getSelected();
						if(rec) {
							this.saveSDT(rec);
						}
					},
					scope:this
				},'-', this.printBtn,'->',{
					iconCls:'x-tbar-loading',
					handler:function(){
						this.store.load();
					},
					scope:this
				}]
		}); 		
		
		this.columns =  [{
	    	header: "Заказ", 
	    	width: 8,
	    	dataIndex: 'barcode'
	    },{
	    	header: "Дата", 
	    	width: 12,
	    	dataIndex: 'created',
	    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
	    },{
	    	header: "Пациент", 
	    	width: 50,
	    	dataIndex: 'patient_name',
	    	renderer:function(v){
	    		return String.format("<b>{0}</b>",v);
	    	}
	    },{
	    	header: "Наименование исследования", 
	    	width: 50,
	    	dataIndex: 'service_name',
	    },{
	    	header: "Лаборатория", 
	    	width: 15,
	    	dataIndex: 'laboratory',
	    },{
	    	header: "Врач", 
	    	width: 15,
	    	dataIndex: 'staff_name',
	    },{
	    	header: "Оператор", 
	    	width: 12,
	    	dataIndex: 'operator_name',
	    }];		
		
		var config = {
			id:'manual-service-grid',
			title:'Ручные исследования',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			closable:false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
			tbar:this.ttb,
			bbar: new Ext.PagingToolbar({
	            pageSize: 50,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: '{0} - {1} | {2}',
	            emptyMsg: "Нет записей"
	        }),
			listeners: {
				rowdblclick:function(grid,i,e){
					var rec = grid.getStore().getAt(i);
					var serviceCode = String.format("{0}manualtest",rec.data.service_code);
					if(Ext.ComponentMgr.isRegistered(serviceCode)){
						var cmp = Ext.ComponentMgr.types[serviceCode];
						var win = new cmp({
							record:rec,
							service:App.uriToId(rec.data.service)
						});
						win.show();
					} else {
						Ext.Msg.alert('!!!','Для данного исследования не зарегистрирована форма ручного введения результатов!');
					}
				}
			},
			viewConfig : {
				forceFit : true,
				getRowClass: function(record, index) {
		            var c = record.get('executed');
		            return c ? 'x-lab-complete' : 'x-lab-incomplete';
		        }
			}			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.manual.ManualGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		
		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this); 
		},this);
		
	},
	
	saveSDT: function(rec) {
		var d = this.dateField.getValue();
		var t = this.timeField.getValue().split(':');
		if (d) {
			d = d.add(Date.HOUR, t[0]).add(Date.MINUTE,t[1]);
		}
		var staff = this.staffField.getValue();
		if(rec) {
			rec.beginEdit();
			rec.set('executed', d ? d : '');
			if(staff) {
				rec.set('staff', staff);
			}
			rec.endEdit();
		}
	},
	
	setActiveRecord: function(rec) {
		this.labOrderRecord = rec;
		
		this.store.setBaseParam('order',App.uriToId(this.labOrderRecord.data.visit));
		this.store.load();

		this.enable();
	},
	
	storeFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},
	
	onGlobalSearch: function(v){
		var s = this.store;
		s.setBaseParam('search', v);
		s.load();
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	
});

Ext.reg('manualgrid', App.manual.ManualGrid);