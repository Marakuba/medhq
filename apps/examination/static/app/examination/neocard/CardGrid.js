Ext.ns('App.examination');

App.examination.CardGrid = Ext.extend(Ext.grid.EditorGridPanel, {

	initComponent: function(){

		this.proxy = new Ext.data.HttpProxy({
        	url: App.getApiUrl('examination','card')
        });
		this.baseParams = Ext.apply({
            format:'json',
            deleted:false,
            'ordered_service__staff': active_profile
        },this.baseParams);

        this.reader = new Ext.data.JsonReader({
            totalProperty: 'meta.total_count',
            successProperty: 'success',
            idProperty: 'id',
            root: 'objects',
            messageProperty: 'message'
        }, App.models.Card);

        this.writer = new Ext.data.JsonWriter({
            encode: false,
            writeAllFields: true
        });

        this.store =  this.store || new Ext.data.Store({
            restful: true,
            autoLoad: false,
			autoDestroy:true,
            baseParams: this.baseParams,
		    paramNames: {
			    start : 'offset',
			    limit : 'limit',
			    sort : 'sort',
			    dir : 'dir'
			},
            proxy: this.proxy,
            reader: this.reader,
            writer: this.writer
        });

		this.store.on('load', function(){
			this.getSelectionModel().selectFirstRow();
		}, this);

		this.assistant = new Ext.form.LazyClearableComboBox({
			fieldLabel:'Лаборант',
			name:'assistant',
			anchor:'50%',
			valueField:'resource_uri',
			queryParam : 'staff__last_name__istartswith',
			store:new Ext.data.RESTStore({
				autoLoad : true,
				apiUrl : App.getApiUrl('staff','position'),
				model: ['id','name','resource_uri']
			}),
		    minChars:2,
		    emptyText:'Выберите врача...',
		    listeners:{
		    	select: function(combo, rec,i) {
		    	},
		    	scope:this
		    }
		});

		Ext.util.Format.comboRenderer = function(combo,field){
            return function(value, meta, rec){
                var record = combo.findRecord(combo.valueField, value);
                return record ? record.get(combo.displayField) : (rec ? rec.get(field) : combo.valueNotFoundText);
            }
        };

        if(!this.emptyTbar){

			this.tbar = this.tbar || ['Период',{
				xtype:'datefield',
				format:'d.m.Y',
				emptyText:'с',
				listeners: {
					select: function(df, date){
						this.storeFilter('created__gte',date.format('Y-m-d 00:00'));
					},
					scope:this
				}
			},{
				xtype:'datefield',
				format:'d.m.Y',
				emptyText:'по',
				listeners: {
					select: function(df, date){
						this.storeFilter('created__lte',date.format('Y-m-d 23:59'));
					},
					scope:this
				}
			}];

			this.tbar.push({
				xtype:'button',
				text:'Обновить',
				iconCls:'x-tbar-loading',
				handler:function(){
					this.store.load()
				},
				scope:this
			});
			this.tbar.push({
				text:'Печать',
				iconCls:'silk-printer',
				handler:function(){
					var rec = this.getSelectionModel().getSelected();
					if(rec){
						var url = String.format('/exam/card/{0}/', rec.id);
						window.open(url);
					}
				},
				scope:this
			})
		} else {
			this.tbar = undefined
		};

        this.columns =  [
        	{
                header: "",
                width: 15,
                sortable: true,
                dataIndex: 'executed',
                renderer:function(val, meta, record) {
		    		var p = record.data.executed;
		    		var flag = p ? 'yes' : 'no';
		    		var img = "<img src='"+MEDIA_URL+"admin/img/admin/icon-"+flag+".gif'>"
		    		return String.format("{0}", img);
		    	}
            },
            {
                header: "Дата создания",
                width: '.1',
                sortable: true,
                dataIndex: 'created',
                renderer:Ext.util.Format.dateRenderer('d.m.y / H:i')
            },{
                header: "Услуга",
                width: '.3',
                sortable: true,
                dataIndex: 'print_name'
            },{
                header: "Пациент",
                width: '.2',
                sortable: true,
                dataIndex: 'patient_name'
            },{
                header: "Лаборант",
                width: '.2',
                sortable: true,
                dataIndex: 'assistant',
                editor: this.assistant,
                renderer: Ext.util.Format.comboRenderer(this.assistant,'assistant_name')
            },{
                header: "Лаборант",
                sortable: true,
                hidden:true,
                dataIndex: 'assistant_name'
            },{
                header: "Изменено",
                width: '.1',
                sortable: true,
                dataIndex: 'modified',
                renderer:Ext.util.Format.dateRenderer('d.m.y / H:i')
            }
        ];



        config = {
			loadMask : {
				msg : 'Подождите, идет загрузка...'
			},
            clicksToEdit : 2,
            border:false,
            store: this.store,
            columns : this.columns,
			sm : new Ext.grid.RowSelectionModel({
						singleSelect : true,
						listeners:{
							scope:this,
							rowselect:function(selModel,rowIndex,record){
								this.fireEvent('rowselect',record);
							}
						}
					}),
            viewConfig: {
            	emptyText:'нет карт осмотра'
//                forceFit: true
            },
            bbar: new Ext.PagingToolbar({
	            pageSize: 20,
	            store: this.store,
	            displayInfo: true,
	            displayMsg: 'Записи {0} - {1} из {2}',
	            emptyMsg: "Нет записей"
	        }),
			tbar:this.tbar
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
	    App.examination.CardGrid.superclass.initComponent.apply(this, arguments);

	    App.eventManager.on('globalsearch', this.onGlobalSearch, this);

		this.on('destroy', function(){
		    App.eventManager.un('globalsearch', this.onGlobalSearch, this);
		},this);

		this.on('afterrender', function(){
		}, this);

    },

    storeFilter: function(field, value){
		if(!value) {
			//console.log(this.store.baseParams[field]);
			delete this.store.baseParams[field]
			//this.store.setBaseParam(field, );
		} else {
			this.store.setBaseParam(field, value);
		}
		this.store.load();
	},

	onGlobalSearch: function(v) {
		if(v) {
			var letter = v.charAt(0);
			if( letter=='#' || letter=='№') {
				v = v.substring(1);
			}
			this.storeFilter('search', v);
		} else {
			delete this.store.baseParams['search'];
			delete this.store.baseParams['order__barcode'];
			this.store.load();
		}
	}

});

Ext.reg('cardgrid', App.examination.CardGrid);
