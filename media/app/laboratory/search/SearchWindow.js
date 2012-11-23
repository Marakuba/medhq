Ext.ns('App.laboratory');


App.laboratory.SearchWindow = Ext.extend(Ext.Window, {
	initComponent: function(){

		this.filterKey = this.filterKey || 'filters'

		this.form = new Ext.form.FormPanel({
			border:false,
			baseCls:'x-plain',
			labelWidth:80,
			padding:5,
			items:[/*{
				xtype:'compositefield',
				anchor:'100%',
				fieldLabel:'Заказ',
				items:[{
					xtype:'textfield',
					name:'barcode',
					width:60
				},{
					xtype:'displayfield',
					value:'Пациент:'
				},{
					xtype:'textfield',
					name:'patient',
					anchor:'100%'
//					width:140
				}]
			},*/{
				xtype:'compositefield',
				anchor:'100%',
				fieldLabel:'Дата заказа',
				items:[{
					xtype:'displayfield',
					value:'с '
				},{
					xtype:'datefield',
					format:'d.m.Y',
					name:'start_date',
					value:new Date(),
					listeners: {
					}
				},{
					xtype:'displayfield',
					value:' по '
				},{
					xtype:'datefield',
					format:'d.m.Y',
					name:'end_date',
					value:new Date(),
					listeners: {
					}
				}]
			},new Ext.form.LazyClearableComboBox({
				fieldLabel:'Офис',
				name:'office',
				anchor:'100%',
				valueField:'id',
				store:new Ext.data.RESTStore({
					autoLoad : true,
					apiUrl : App.getApiUrl('state','medstate'),
					model: ['id','name']
				}),
			    minChars:2,
			    emptyText:'Выберите офис...',
			    listeners:{
			    	select: function(combo, rec,i) {
			    	},
			    	scope:this
			    }
			}),new Ext.form.LazyClearableComboBox({
				fieldLabel:'Плательщик',
				name:'payer',
				anchor:'100%',
				valueField:'id',
				store:new Ext.data.RESTStore({
					autoLoad : true,
					apiUrl : App.getApiUrl('state','medstate'),
					model: ['id','name']
				}),
			    minChars:2,
			    emptyText:'Выберите плательщика...',
			    listeners:{
			    	select: function(combo, rec,i) {
			    	},
			    	scope:this
			    }
			}),new Ext.form.LazyClearableComboBox({
				fieldLabel:'Лаборатория',
				name:'laboratory',
				anchor:'100%',
				valueField:'id',
				store:new Ext.data.RESTStore({
					autoLoad : true,
					apiUrl : App.getApiUrl('state','medstate'),
					model: ['id','name']
				}),
			    minChars:2,
			    emptyText:'Выберите лабораторию...',
			    listeners:{
			    	select: function(combo, rec,i) {
			    	},
			    	scope:this
			    }
			}),new Ext.form.LazyClearableComboBox({
				fieldLabel:'Пациент',
				name:'patient',
				anchor:'100%',
				valueField:'id',
				displayField:'full_name',
				store:new Ext.data.RESTStore({
					autoLoad : true,
					apiUrl : App.getApiUrl('patient','patient'),
					model: ['id','full_name']
				}),
			    minChars:2,
				queryParam : 'last_name__istartswith',
			    emptyText:'Выберите пациента...',
			    listeners:{
			    	select: function(combo, rec,i) {
			    	},
			    	scope:this
			    }
			}),new Ext.form.LazyClearableComboBox({
				fieldLabel:'Врач',
				name:'staff',
				anchor:'100%',
				valueField:'id',
				queryParam : 'staff__last_name__istartswith',
				store:new Ext.data.RESTStore({
					autoLoad : true,
					apiUrl : App.getApiUrl('staff','position'),
					model: ['id','name']
				}),
			    minChars:2,
			    emptyText:'Выберите врача...',
			    listeners:{
			    	select: function(combo, rec,i) {
			    	},
			    	scope:this
			    }
			}),new Ext.form.Checkbox({
				fieldLabel:'Только cito',
				name:'cito'
			})]
		});

		config = {
			title:'Поиск',
			width:400,
			height:260,
			items:[this.form],
			buttonAlign: 'left',
			fbar:[{
				xtype:'tbtext',
//				text:'Найдено записей: 0',
				hidden:true
			},'->',{
				text:'Поиск',
				handler:this.doSearch.createDelegate(this)
			},{
				text:'Сбросить',
				handler:this.cancelSearch.createDelegate(this)
			},{
				text:'Закрыть',
				handler:function(){
					this.close();
				},
				scope:this
			}]
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laboratory.SearchWindow.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){
			var v = Ext.state.Manager.getProvider().get(this.filterKey);
			this.filtersConfig = v || {};
			var f = this.form.getForm();
			for(k in this.filtersConfig) {
				var field = f.findField(k);
				if(field) {
					var val = this.filtersConfig[k][0];
					if(field.getXType()=='datefield'){
						val = Date.parseDate(val,'Y-m-d H:i');
					}
					field[field.forceValue ? 'forceValue' : 'setValue'](val);
				}
			}

		}, this);

//		this.form.getForm().findField('laboratory').forceValue(1);
	},

	doSearch: function(){
		var f = this.form.getForm();
		Ext.each(this.fields, function(field){
			var ff = f.findField(field[0]);
			var v = ff.getValue();
			if(v) {
				this.filtersConfig[field[0]] = [v,v];
				if(ff.findRecord) {
					var rec = ff.findRecord(ff.valueField, v);
					this.filtersConfig[field[0]][1] = rec.get(ff.displayField);
				}
				if(v instanceof Date) {
					this.filtersConfig[field[0]] = [v.format(field[3] || 'Y-m-d'), v.format('d.m.Y')];
					v = v.format(field[3] || 'Y-m-d');
				}
				this.store.setBaseParam(field[1], v);
			} else {
				delete this.store.baseParams[field[1]];
				delete this.filtersConfig[field[0]];
			}
		}, this);
		Ext.state.Manager.getProvider().set(this.filterKey, this.filtersConfig);
		this.fireEvent('updatefilters', this.filtersConfig);
		this.store.load({
			callback:function(r) {
				var item = this.getFooterToolbar().items.itemAt(0);
				item.setText(String.format('Найдено записей: {0}', this.store.getTotalCount()));
				item.show();
			},
			scope:this
		});
	},

	cancelSearch: function(){
		Ext.each(this.fields, function(field){
			delete this.store.baseParams[field[1]];
		}, this);
		this.store.load();
		this.filtersConfig = {};
		Ext.state.Manager.getProvider().set(this.filterKey, this.filtersConfig);
		this.fireEvent('updatefilters', this.filtersConfig);
		this.close();
	}
});
