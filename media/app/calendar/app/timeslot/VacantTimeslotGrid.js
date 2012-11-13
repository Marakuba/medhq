Ext.ns('App','App.registry');

App.calendar.VacantTimeslotGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {

		this.store = this.store ? this.store : new Ext.data.RESTStore({
			autoLoad : false,
			autoSave : true,
			apiUrl : App.utils.getApiUrl('scheduler','event'),
			model: [
				    {name: 'resource_uri'},
				    {name: 'start',type:'date',format:'c'},
				    {name: 'end',type:'date',format:'c'},
				    {name: 'status'},
				    {name: 'timeslot'},
				    {name: 'cid'},
				    {name: 'staff'}
				]
		});

		this.start_date = new Date();

		this.columns =  [
		    {
		    	header: "С",
		    	width: 60,
		    	sortable: true,
		    	dataIndex: 'start',
		    	hide: this.patient ? true : false,
		    	renderer:Ext.util.Format.dateRenderer('H:i d.m.Y')
		    },{
		    	header: "По",
		    	width: 60,
		    	sortable: true,
		    	dataIndex: 'end',
		    	renderer:Ext.util.Format.dateRenderer('H:i d.m.Y')
		     }
		];

		this.choiceButton = new Ext.Button({
			iconCls:'silk-accept',
			disabled:true,
			text:'Выбрать',
			handler:this.onChoice.createDelegate(this, []),
			scope:this
		});


		this.startDateField = new Ext.form.DateField({
			plugins:[new Ext.ux.netbox.InputTextMask('99.99.9999')], // маска ввода __.__._____ - не надо точки ставить
			minValue:new Date(1901,1,1),
			format:'d.m.Y',
			value:this.start_date,
			listeners: {
				select: function(df, date){
					this.start_date = date;
					this.storeDateFilter('start',this.start_date);
				},
				scope:this
			}
		});

		var config = {
			id:'preorder-grid',
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			emptyText:'На эту дату предзаказов нет',
			store:this.store,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
                    rowselect: function(sm, row, rec) {
//                    	this.fireEvent('timeslotselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().loadRecord(rec);
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
//                    	this.fireEvent('timeslotselect', rec);
//                        Ext.getCmp("patient-quick-form").getForm().reset();
                    	this.btnSetDisabled(true);
                    },
                    dblclick: function(e) {
                    	this.onChoice();
                    },
                    scope:this
                }
			}),
			tbar:[this.choiceButton],
	        bbar: {
            	cls: 'ext-cal-toolbar',
            	border: true,
            	buttonAlign: 'center',
            	items: [{
//	                id: this.id + '-tb-prev',
                	handler: this.onPrevClick,
                	scope: this,
                	iconCls: 'x-tbar-page-prev'
            	},this.startDateField,{
//	                id: this.id + '-tb-next',
                	handler: this.onNextClick,
                	scope: this,
                	iconCls: 'x-tbar-page-next'
            	}]
        	},
			viewConfig : {
				forceFit : true,
				showPreview:true,
				enableRowBody:true,
				getRowClass: function(record, index, p, store) {
               		return 'preorder-actual-row-body';
        		}
			},
			listeners: {
//				rowdblclick:this.onVisit.createDelegate(this, []),
//				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.calendar.VacantTimeslotGrid.superclass.initComponent.apply(this, arguments);
		WebApp.on('globalsearch', this.onGlobalSearch, this);
		this.on('destroy', function(){
		    WebApp.un('globalsearch', this.onGlobalSearch, this);
		},this);
		this.store.on('write', function(){
			var record = this.getSelected();
			if (record){
				if (record.data.visit){
					this.visitButton.setDisabled(true);
				}
			}
			//this.store.load();
		}, this);
		this.on('timeslotselect', this.onTimeslotSelect, this);
		this.on('afterrender', function(){
			if (this.staff_id){
				this.store.setBaseParam('cid',this.staff_id);
			}
			this.store.setBaseParam('status','с');
			this.store.setBaseParam('timeslot',true);
			var day = this.start_date.getDate();
			var month = this.start_date.getMonth()+1;
			var year = this.start_date.getFullYear();
			this.store.setBaseParam('start__year', year);
			this.store.setBaseParam('start__month', month);
			this.store.setBaseParam('start__day', day);
			this.store.load()},
		this);
	},

	btnSetDisabled: function(status) {
        this.choiceButton.setDisabled(status);
	},

	onTimeslotSelect: function(record){
        this.choiceButton.setDisabled(true);
	},

	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},

	onChoice: function() {
        var record = this.getSelected();
        if (record) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        } else {
        	Ext.Msg.alert('Уведомление','Ничего не выбрано')
        }
    },

    storeFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load({callback:function(){
			var record = this.getSelected();
			if (record){
				this.onServiceSelect(record);
			} else {
				this.btnSetDisabled(true);
			};
		},scope:this});
		this.btnSetDisabled(true);
	},

	storeDateFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field+'__year'];
			delete this.store.baseParams[field+'__month'];
			delete this.store.baseParams[field+'__day'];
		} else {
			var day = value.getDate();
			var month = value.getMonth()+1;
			var year = value.getFullYear();
			this.store.setBaseParam(field+'__year', year);
			this.store.setBaseParam(field+'__month', month);
			this.store.setBaseParam(field+'__day', day);
		}
		this.store.load({callback:function(){
			var record = this.getSelected();
			if (record){
				this.onServiceSelect(record);
			} else {
				this.btnSetDisabled(true);
			};
		},scope:this});
		this.btnSetDisabled(true);
	},

	onPrevClick: function(){
		this.start_date = this.start_date.add(Date.DAY,-1);
		this.startDateField.setValue(this.start_date);
		this.storeDateFilter('start',this.start_date);
		this.btnSetDisabled(true);
	},

	onNextClick: function(){
		this.start_date = this.start_date.add(Date.DAY,1);
		this.startDateField.setValue(this.start_date);
		this.storeDateFilter('start',this.start_date);
		this.btnSetDisabled(true);
	}
});

