Ext.ns('App.patient');

App.patient.ManualGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {

		this.store = new Ext.data.RESTStore({
			autoSave : false,
			autoLoad : false,
			apiUrl : App.getApiUrl('labservice'),
			model: App.models.LabService
		});

		this.printBtn = new Ext.Button({
			iconCls:'silk-printer',
			text:'Печать',
			handler:this.onPrint.createDelegate(this),
			scope:this
		});


		this.columns =  [{
	    	width: 1,
	    	sortable: true,
	    	dataIndex: 'executed',
	    	renderer: function(val) {
	    		flag = val ? 'yes' : 'no';
	    		return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
	    	}
	    },{
	    	header: "Заказ",
	    	width: 8,
	    	dataIndex: 'barcode'
	    },{
	    	header: "Дата",
	    	width: 15,
	    	dataIndex: 'created',
	    	renderer:Ext.util.Format.dateRenderer('d.m.y H:i')
	    },{
	    	header: "Напечатано",
	    	width: 15,
	    	dataIndex: 'print_date',
	    	renderer:function(val,opts,rec){
	    		var flag = val ? 'yes' : 'no';
	    		if(val) {
	    			var img = "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>";
	    			return String.format("{0} {1}",img, Ext.util.Format.date(val,'d.m.y H:i'));
	    		} else {
	    			return "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>";
	    		}
	    	}
	    },{
	    	header: "Наименование исследования",
	    	width: 38,
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
			tbar:[this.printBtn,'->',{
				iconCls:'x-tbar-loading',
				handler:function(){
					this.store.load();
				},
				scope:this
			}],
			bbar: new Ext.PagingToolbar({
	            pageSize: 50,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: '{0} - {1} | {2}',
	            emptyMsg: "Нет записей"
	        }),
			listeners: {
				rowdblclick:this.onPrint.createDelegate(this)
			},
			viewConfig : {
				forceFit : true,
				emptyText : 'Нет записей'
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.patient.ManualGrid.superclass.initComponent.apply(this, arguments);

	},

	onPrint: function(){
		var rec = this.getSelectionModel().getSelected();
		if(rec) {
			var url = String.format('/lab/print/manualresults/{0}/', rec.id);
			window.open(url);
		}
	},

	setActivePatient: function(rec) {
		var id = rec.id;
		this.patientId = id;
		var s = this.store;
		s.baseParams = {
			format:'json',
			order__patient: id
		};
		s.load();
	},

	storeFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},

	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},


});

Ext.reg('patientmanualgrid', App.patient.ManualGrid);
