Ext.ns('App.treatment');

App.treatment.LabTestGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {

		this.store = new Ext.data.RESTStore({
			autoLoad : true,
			apiUrl : App.getApiUrl('visit','servicetosend'),
			model: App.models.ServiceToSend
		});

		this.sm = new Ext.grid.CheckboxSelectionModel({
			singleSelect : false,
			listeners:{
				rowselect:function(sm,i,rec) {
				},
				rowdeselect:function(sm,i,rec) {
				},
				scope:this
			}
		});

		this.columns =  [this.sm, {
	    	header: "Дата",
	    	width:10,
	    	sortable: true,
	    	dataIndex: 'created',
	    	renderer:Ext.util.Format.dateRenderer('d.m.Y H:i')
	    },{
	    	header: "PID",
	    	width: 8,
	    	sortable: true,
	    	dataIndex: 'patient_id'
	    },{
	    	header: "SyncID",
	    	width: 8,
	    	sortable: true,
	    	dataIndex: 'patient_sync_id'
	    },{
	    	header: "Услуга",
	    	width: 25,
	    	sortable: true,
	    	dataIndex: 'service_name'
	    },{
	    	header: "Пациент",
	    	width: 20,
	    	sortable: true,
	    	dataIndex: 'patient_name'
	    },{
	    	header: "Оператор",
	    	width: 10,
	    	sortable: true,
	    	dataIndex: 'operator_name'
	    }];

		var config = {
			closable:true,
			title:'Лабораторные тесты',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			stripeRows:true,
			border : false,
			store:this.store,
			columns:this.columns,
			sm : this.sm,
			tbar: [new Ext.form.LazyComboBox({
	        	fieldLabel:'Лаборатория',
	        	name:'state',
			    minChars:3,
			    emptyText:'Выберите лабораторию...',
			    proxyUrl:App.getApiUrl('state','medstate')
			}),{
				text:'Передать в лабораторию',
				handler:this.onSend.createDelegate(this)
			}],
			bbar: new Ext.PagingToolbar({
	            pageSize: 200,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Показана запись {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			listeners: {
//				rowdblclick:this.onChange.createDelegate(this),
	        	scope:this
			},
			view : new Ext.grid.GridView({
				forceFit : true,
				emptyText: 'Нет записей',
//	            enableRowBody:true,
//	            showPreview:true,
//	            getRowClass : function(record, rowIndex, p, store){
//	                if(this.showPreview){
//	                    p.body = '<p class="helpdesk-row-body">'+record.data.description+'</p>';
//	                    return 'x-grid3-row-expanded';
//	                }
//	                return 'x-grid3-row-collapsed';
//	            }
			})

		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.treatment.LabTestGrid.superclass.initComponent.apply(this, arguments);
//		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
//		this.store.on('write', this.onStoreWrite, this);
	},

	onGlobalSearch: function(v) {
		this.storeFilter('search', v);
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

	onSend : function(){
		var records = this.getSelectionModel().getSelections();
		if(records) {
			var ids = new Array();
			Ext.each(records,function(rec){
				ids.push(rec.id);
			});
			Ext.MessageBox.alert('ids',ids.join(','));
		}
	},

	onPrint: function() {
//		var id = this.getSelected().data.id;
//		var url = ['/lab/print/results',id,''].join('/');
//		window.open(url);
	},

	onCreate: function() {
		this.win = new App.issue.IssueWindow({
			model:this.store.recordType,
			scope:this,
			fn:function(record){
				this.store.insertRecord(record);
			}
		});
		this.win.show();
	},

	onChange: function(rowindex){
		var record = this.getSelected();
		if(record) {
    		this.win = new App.issue.IssueWindow({
    			record:record,
    			model:this.store.recordType,
    			scope:this,
    			fn:function(record){
    				//this.store.Record(record);
    			}
    		});
    		this.win.show();
		}
	},

	onDelete: function() {

	},

	onStoreWrite: function(store, action, result, res, rs) {
		if( res.success && this.win ) {
			this.win.close();
		}
	}

});



Ext.reg('trlabtestgrid', App.treatment.LabTestGrid);
