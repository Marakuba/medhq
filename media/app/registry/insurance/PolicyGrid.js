Ext.ns('App.insurance');

App.insurance.PolicyGrid = Ext.extend(Ext.grid.GridPanel, {
	
	showChoiceButton:false,
	
	initComponent : function() {
		
		this.deletedRecords = [];
		
		// Create a standard HttpProxy instance.
		this.proxy = new Ext.data.HttpProxy({
		    url: get_api_url('insurance_policy')
		});
		
		// Typical JsonReader.  Notice additional meta-data params for defining the core attributes of your json-response
		this.reader = new Ext.data.JsonReader({
		    totalProperty: 'meta.total_count',
		    successProperty: 'success',
		    idProperty: 'id',
		    root: 'objects',
		    messageProperty: 'message'
		}, [
		    {name: 'id'},
		    {name: 'start_date', type:'date'},
		    {name: 'end_date', type:'date'},
		    {name: 'number', allowBlank:true},
		    {name: 'patient', allowBlank:true},
		    {name: 'insurance_state', allowBlank:true},
		    {name: 'state_name'},
		    {name: 'resource_uri'}
		]);
		
		this.writer = new Ext.data.JsonWriter({
		    encode: false,
		    writeAllFields: true
		});
		
		this.store = new Ext.data.Store({
		    id: 'laborder-store',
			//autoLoad:true,
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
		    	write:function(store,action,result,res,rs){
		    		if(res.success){
		    			this.onChoice(rs);
		    		}
		    	},
		    	scope:this
		    }
		});
		
		if (this.record) {
			this.store.setBaseParam('patient',this.record.id);
			this.store.load();
		}
		
		this.insState = new Ext.form.ComboBox({
	        	name:'source_lab',
			    store: new Ext.data.JsonStore({
					autoLoad:true,
					proxy: new Ext.data.HttpProxy({
						url:'/api/v1/dashboard/insurance_state',
						method:'GET'
					}),
					root:'objects',
					idProperty:'resource_uri',
					fields:['resource_uri','name']
				}),
			    typeAhead: true,
			    queryParam:'name__istartswith',
			    minChars:3,
			    triggerAction: 'all',
			    //emptyText:'Выберите лабораторию...',
			    valueField: 'resource_uri',
			    displayField: 'name',
			    selectOnFocus:true
		});
		this.itemRenderer = function(combo){
		    return function(value, meta, rec){
		        var record = combo.findRecord(combo.valueField, value);
		        return record ? record.get(combo.displayField) : (rec ? rec.data.state_name : combo.valueNotFoundText);
		    }
		};
				
		this.columns =  [
		    {
		    	header: "№ полиса", 
		    	width: 50, 
		    	sortable: true, 
		    	dataIndex: 'number', 
		    	editor: new Ext.form.TextField({})
		    },{
		    	header: "Компания", 
		    	width: 100, 
		    	sortable: true, 
		    	dataIndex: 'insurance_state',
		    	editor: this.insState,
		    	renderer: this.itemRenderer(this.insState)
		    },{
		    	header: "Выдан", 
		    	width: 80, 
		    	sortable: true, 
		    	dataIndex: 'start_date',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y'), 
		    	editor: new Ext.form.DateField({ format:'d.m.Y' })
		    },{
		    	header: "Заканчивается", 
		    	width: 80, 
		    	sortable: true, 
		    	dataIndex: 'end_date',
		    	renderer:Ext.util.Format.dateRenderer('d.m.Y'), 
		    	editor: new Ext.form.DateField({ format:'d.m.Y' })
		    }
		];
		
		this.editor = new Ext.ux.grid.RowEditor({
       		saveText: 'Сохранить',
       		cancelText: 'Отменить',
       		listeners: {
       			afteredit:function(editor,changes,rec,i){
//       				rec.data.patient = this.record.data.resource_uri;
//       				rec.data.insurance_state = rec.data.state_name;
//       				this.store.save();
       			}, 
       			scope:this
       		}
    	});
		
		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border : false,
			store:this.store,
			columns:this.columns,
			plugins: [this.editor],
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true
					}),
	        tbar:[{
				xtype:'button',
				iconCls:'silk-accept',
				text:'Выбрать',
				hidden:!this.showChoiceButton,
				handler:this.onChoice.createDelegate(this)
			},'-',{
				xtype:'button',
				iconCls:'silk-add',
				text:'Добавить полис',
				handler:this.onAddPolicy.createDelegate(this)
			},{
				xtype:'button',
				iconCls:'silk-add',
				text:'Добавить компанию',
				handler:this.onAddState.createDelegate(this)
			},'-',{
				xtype:'button',
				iconCls:'silk-delete',
				text:'Удалить полис',
				handler:this.onRemove.createDelegate(this)
			}],
			viewConfig : {
				forceFit : true,
				emptyText: 'Нет записей'
			},
			listeners: {
				scope:this
			}
			
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.insurance.PolicyGrid.superclass.initComponent.apply(this, arguments);
		App.eventManager.on('patientcreate', this.onPatientCreate, this);
	},
	
	onChoice: function(rec){
		rec = rec || this.getSelectionModel().getSelected();
		this.fireEvent('policyselect', rec.data.resource_uri);
	},
	
	onAddPolicy: function(){
        var r = new this.store.recordType({
        });
        this.editor.stopEditing();
        this.store.add(r);
        this.editor.startEditing(this.store.getCount()-1);
	},
	
	onAddState: function(){
		var win = new App.insurance.StateWindow({
		});
		win.show();
	},
	
	onRemove: function(){
		var rec = this.getSelectionModel().getSelected();
		this.store.remove(rec);
		this.deletedRecords.push(rec);
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
	}
	
});