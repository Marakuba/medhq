Ext.ns('App.patient');

App.patient.ContractGrid = Ext.extend(Ext.grid.EditorGridPanel, {
	
	showChoiceButton:false,

	initComponent : function() {
		
		var today = new Date();
		
		this.addButton = new Ext.Button({
			iconCls:'silk-add',
			text:'Добавить',
	        handler:this.onCreate.createDelegate(this),
	        disabled: false,
	        scope:this
		});
		
		this.store = this.store || new Ext.data.Store({
			//autoLoad:true,
			
			autoSave:this.showChoiceButton || this.record,
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
		    proxy: new Ext.data.HttpProxy({
			    url: get_api_url('contract')
			}),
		    reader: new Ext.data.JsonReader({
			    totalProperty: 'meta.total_count',
			    successProperty: 'success',
			    idProperty: 'id',
			    root: 'objects',
			    messageProperty: 'message'
			}, App.models.contractModel),
		    writer: new Ext.data.JsonWriter({
			    encode: false,
			    writeAllFields: true
			}),
		    listeners:{
		    	exception:function(proxy, type, action, options, response, arg){
		    		console.log('ClientAccount Grid Exception!');
		    		console.log(proxy);
		    		console.log(type);
		    		console.log(action);
		    		console.log(options);
		    		console.log(response);
		    		console.log(arg);
		    		this.fireEvent('exception');
		    	},
		    	write:function(store, action, result, res, rs){
		    		console.log('ClietnAccount created!');
		    		console.log(store);
		    		console.log(action);
		    		console.log(result);
		    		console.log(res);
		    		console.log(rs);
		    	},
		    	scope:this
		    },
		    scope:this
		});
		
		this.contractTypeCB = new Ext.form.LazyClearableComboBox({
			anchor:'50%',
			valueField:'resource_uri',
			queryParam : 'title__istartswith',
			store:new Ext.data.RESTStore({
				autoLoad : false,
				apiUrl : get_api_url('contracttype'),
				model: ['id','title','resource_uri']
			}),
			displayField:'title',
		    minChars:2
		});
		
		Ext.util.Format.comboRenderer = function(combo,field){
            return function(value, meta, rec){
                var record = combo.findRecord(combo.valueField, value);
                return record ? record.get(combo.displayField) : (rec ? rec.get(field) : combo.valueNotFoundText);
            }
        };
		
		this.columns =  [{
		    	header: "Организация",
		    	width:'25%',
		    	sortable: true, 
		    	dataIndex: 'state_name'
		    },{
		    	header: "Дата заключения", 
		    	width: '25%', 
		    	sortable: true, 
		    	dataIndex: 'created',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y'),
		    	editor: new Ext.form.DateField({
		    		minValue: today,
		    		plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], 
		    		format:'d.m.Y'
		    	})
		    },{
		    	header: "Заключен до", 
		    	width: '25%', 
		    	sortable: true, 
		    	dataIndex: 'expire',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y'),
		    	editor: new Ext.form.DateField({
		    		minValue: today,
		    		plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], 
		    		format:'d.m.Y'
		    	})
		    },{
		    	header: "Тип контракта", 
		    	dataIndex: 'contract_type',
		    	editor: this.contractTypeCB,
                renderer: Ext.util.Format.comboRenderer(this.contractTypeCB,'contract_type_name')
		    }
		];		
		
		this.ttb = new Ext.Toolbar({ 
			items:[{
				xtype:'button',
				iconCls:'silk-accept',
				text:'Выбрать',
				hidden:!this.showChoiceButton,
				handler:this.onChoice.createDelegate(this,[])
			},this.addButton,'->']
		}); 
		
		var config = {
			title:'Договоры',
			layout:'fit',
			//closable:true,
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true
			}),
	        tbar:this.ttb,
			bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),			
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей'
				//getRowClass : this.applyRowClass
			})
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.ContractGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('patientcreate', this.onPatientCreate, this);
		this.on('destroy', function(){
			App.eventManager.un('patientcreate', this.onPatientCreate, this);
		},this);
	},
	
	
	storeFilter: function(field, value){
		if(value===undefined) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},
	
	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},
	
	onPrint: function() {
//		var id = this.getSelected().data.id;
//		var url = ['/lab/print/results',id,''].join('/');
//		window.open(url);
	},
	
	onCreate: function() {
		var today  = new Date();
		var data = this.record ? { patient:this.record.data.resource_uri } : {};
		data['state'] = App.getApiUrl('ownstate',state);
		data['state_name'] = active_state;
		data['created'] = today;
		data['expire'] = today;
        var r = new this.store.recordType(data);
        this.store.add(r);
	},
	
	onChange: function(rowindex){
	/*	var record = this.getSelected();
		if(record) {
    		var data = {
    			record:record,
                title: record.data.name,
    			model:this.backend.getModel(),
    			scope:this,
    			fn:function(record){
    				this.backend.saveRecord(record);
    			}
    		};
        App.eventManager.fireEvent('openform','clientaccountcreate',data)
		}*/
	},
	
	onDelete: function() {
		
	},
	
	getSteps: function(){
		var steps = 0;
		var m = this.store.getModifiedRecords().length;
		var d = this.deletedRecords ? this.deletedRecords.length : 0;
		steps+=m;
		steps+=d;
		return steps;
	},
	
	onPatientCreate: function(record) {
		this.record = record;
		this.onSave();
	},
	
	onSave: function() {
		if(this.record) {
			var records = this.store.queryBy(function(rec,id){
				return rec.data.patient ? false : true;
			});
			records.each(function(item,idx,len){
				item.beginEdit();
				item.set('patient', this.record.data.resource_uri);
				item.endEdit();
			}, this);
			this.store.save();
		} else {
			Ext.MessageBox.alert('Ошибка','Не задана запись пациента!');
		}
	},
	
	onChoice: function(rec){
		rec = rec || this.getSelectionModel().getSelected();
		if (!rec) return false
		Ext.callback(this.fn, this.scope || window, [rec]);
	},
	
	onPatientCreate: function(record) {
		this.record = record;
		this.onSave();
	},
	
	setPatientRecord: function(patient){
		this.record = patient;
		this.store.setBaseParam('patient',patient.data.id);
		this.contractTypeCB.store.load({callback:function(records){
			this.store.load();
		},scope:this});
	}
	
});



Ext.reg('contractgrid',App.patient.ContractGrid);
