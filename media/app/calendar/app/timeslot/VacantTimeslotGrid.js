Ext.ns('App','App.registry');

App.calendar.VacantTimeslotGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {
		
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
			format:'d.m.Y',
			value:this.start_date,
			listeners: {
				select: function(df, date){
					this.start_date = date;
					this.storeFilter('start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')));
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
		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
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
			this.store.setBaseParam('vacant',true);
			this.store.setBaseParam('timeslot',true);
			this.store.setBaseParam('start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')))
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
	
	onPrevClick: function(){
		this.start_date = this.start_date.add(Date.DAY,-1);
		this.startDateField.setValue(this.start_date);
		this.storeFilter('start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')));
		this.btnSetDisabled(true);
	},
	
	onNextClick: function(){
		this.start_date = this.start_date.add(Date.DAY,1);
		this.startDateField.setValue(this.start_date);
		this.storeFilter('start__range',String.format('{0},{1}',this.start_date.format('Y-m-d 00:00'),this.start_date.format('Y-m-d 23:59')));
		this.btnSetDisabled(true);
	}
});

