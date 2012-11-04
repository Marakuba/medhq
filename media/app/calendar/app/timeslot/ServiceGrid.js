Ext.ns('App','App.calendar');

App.calendar.ServiceChoiceGrid = Ext.extend(Ext.grid.GridPanel, {

	initComponent : function() {

		this.serviceStore = new Ext.data.RESTStore({
			autoLoad : false,
			autoSave: false,
			apiUrl : App.getApiUrl('service','extendedservice'),
			model: [
				    {name: 'id'},
				    {name: 'resource_uri'},
				    {name: 'service_name'},
				    {name: 'state'},
				    {name: 'is_active'},
				    {name: 'state_name'},
				    {name: 'price'}
				]
		});

		this.columns =  [
		    {
		    	header: "Наименование",
		    	width: 80,
		    	sortable: true,
		    	dataIndex: 'service_name'
		    },{
		    	header: "Место выполнения",
		    	width: 45,
		    	sortable: true,
		    	dataIndex: 'state_name'
		    },{
		    	header: "Цена",
		    	width: 45,
		    	sortable: true,
		    	dataIndex: 'price',
		    	renderer: function(val, meta, record) {
		    		if (!record.data.is_active || val == 0){
		    			return 'услуга не оказывается'
		    		} else {
		    			return val
		    		}
		    	}
		    }
		];


		this.choiceButton = new Ext.Button({
			iconCls:'silk-accept',
			disabled:true,
			text:'Выбрать',
			handler:this.onChoice.createDelegate(this, []),
			scope:this
		});

		this.searchField = new Ext.ux.form.SearchField({
            store: this.store ? this.store : this.serveceStore,
            paramName:'base_service__name__icontains'
        });

        this.ttb = new Ext.Toolbar({
			items:[this.choiceButton,this.searchField]
		});

		var config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
			border: false,
			store : this.store ? this.store : this.serveceStore,
			columns:this.columns,
			sm : new Ext.grid.RowSelectionModel({
				singleSelect : true,
				listeners: {
                    rowselect: function(sm, row, rec) {
                    	this.btnSetDisabled(false);
                    },
                    rowdeselect: function(sm, row, rec) {
                    	this.btnSetDisabled(true);
                    },
                    scope:this
                }
			}),
			tbar:this.ttb,
	        bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            items:['Услуги и цены показаны для типа оплаты: ',this.ptype_title],
	            displayInfo: true,
	            displayMsg: 'Записи {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			viewConfig : {
				forceFit : true,
				getRowClass: function(record, index, p, store) {
            		var price = record.get('price');
            		var is_active = record.get('is_active');
            		if (price == 0 || !is_active) {
                		return 'preorder-deactive-row-body';
            		};
            		return 'preorder-actual-row-body';
        		}
			},
			listeners: {
				rowdblclick:this.onChoice.createDelegate(this, []),
				scope:this
			}
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.calendar.ServiceChoiceGrid.superclass.initComponent.apply(this, arguments);
		this.on('afterrender', function(){
			this.store.load();
		}, this);

		this.initToolbar();

	},

	btnSetDisabled: function(status) {
        this.choiceButton.setDisabled(status);
	},

	getSelected: function() {
		return this.getSelectionModel().getSelected()
	},

	onChoice: function() {
        var record = this.getSelectionModel().getSelected();
        if (record) {
        	Ext.callback(this.fn, this.scope || window, [record]);
        };
    },

    storeFilter: function(field, value){
		if(!value) {
			delete this.store.baseParams[field]
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},

    initToolbar: function(){
		// laboratory
		Ext.Ajax.request({
			url:App.getApiUrl('state','state','medstate'),
			method:'GET',
			success:function(resp, opts) {
				this.ttb.add({
					xtype:'tbtext',
					text:'Организация: '
				});
				this.ttb.add({
					xtype:'button',
					enableToggle:true,
					toggleGroup:'ex-place-cls',
					text:'Все',
					pressed: true,
					handler:this.storeFilter.createDelegate(this,['state'])
				});
				var jsonResponse = Ext.util.JSON.decode(resp.responseText);
				Ext.each(jsonResponse.objects, function(item,i){
					this.ttb.add({
						xtype:'button',
						enableToggle:true,
						toggleGroup:'ex-place-cls',
						text:item.name,
						handler:this.storeFilter.createDelegate(this,['state',item.id])
					});
				}, this);
				this.ttb.doLayout();
			},
			scope:this
		});
	}

});



Ext.reg('servicechoicegrid', App.calendar.ServiceChoiceGrid);
