Ext.ns('App');

App.Results = Ext.extend(Ext.Panel, {
	initComponent:function(){

		this.resultGrid = new App.results.Grid({
			region:'center',
			xtype:'resultsgrid'
		});

		this.origTitle = 'Результаты';

   		this.form = new Ext.form.FormPanel({
   			border:false,
   			baseCls:'x-plain',
   			labelWidth:80,
   			padding:5,
   			items:[{
				xtype:'button',
				text:'Период',
				enableToggle:true,
				listeners:{
					toggle:function(btn,pressed){
						this.singleDate = !pressed;
						btn.setText(pressed ? "Дата" : "Период");
						var startDate = this.form.getForm().findField('start_date'); 
						var endDate = this.form.getForm().findField('end_date');
						setLabel(startDate, pressed ? "Дата с" : "На дату");
						endDate.setVisible(pressed);
						if(this.singleDate) {
							endDate.setValue(this.form.getForm().findField('start_date').getValue());
						}
					},
					scope:this
				}
			},{
				xtype:'datefield',
				format:'d.m.Y',
				name:'start_date',
				fieldLabel:'На дату',
				value:new Date(),
				listeners: {
					select:function(field){
						if(this.singleDate) {
							this.form.getForm().findField('end_date').setValue(field.getValue());
						}
					},
					scope:this
				}
			},{
				xtype:'datefield',
				format:'d.m.Y',
				name:'end_date',
				fieldLabel:'Дата до',
				hidden:true,
				value:new Date(),
				listeners: {
				}
   			},new Ext.form.LazyClearableComboBox({
   				fieldLabel:'Офис',
   				name:'office',
   				anchor:'100%',
   				valueField:'id',
   				store:new Ext.data.RESTStore({
   					autoLoad : true,
   					apiUrl : get_api_url('medstate'),
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
   				fieldLabel:'Лаборатория',
   				name:'laboratory',
   				anchor:'100%',
   				valueField:'id',
   				store:new Ext.data.RESTStore({
   					autoLoad : true,
   					apiUrl : get_api_url('medstate'),
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
   					apiUrl : get_api_url('patient'),
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
   			}), new Ext.form.ComboBox({
   				fieldLabel:'Статус',
   				name:'is_completed',
   				store:new Ext.data.ArrayStore({
   					fields:['id','title'],
   					data: [
   						[-1,'Любой'],
   						[1,'Выполненные'],
   						[0,'Не выполненные']]
   				}),
   				typeAhead: true,
   				triggerAction: 'all',
   				valueField:'id',
   				displayField:'title',
   				mode: 'local',
   				forceSelection:true,
   				selectOnFocus:true,
   				editable:false,
   				anchor:'-2',
   				listeners:{
   					afterrender:function(c){
   						c.setValue(-1);
   					}
   				}
   			}),new Ext.form.Checkbox({
   				fieldLabel:'Только cito',
   				name:'cito'
   			})],
   			buttons:[{
				text:'Сформировать',
				handler:this.doReport.createDelegate(this)
			},{
				text:'Закрыть',
				handler:function(){
					App.eventManager.fireEvent('closeapp','results-grid')
				},
				scope:this
			}]
   		});
		config = {
			id:'results-grid',
			title:this.origTitle,
			closable:true,
			layout:'border',
            defaults: {
				border:false
			},
			items:[this.resultGrid,this.form]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Results.superclass.initComponent.apply(this, arguments);

		App.eventManager.on('globalsearch', this.onGlobalSearch, this);
		this.resultGrid.getStore().on('load',this.onResultLoad,this);
		this.on('beforedestroy', function(){
			this.resultGrid.getStore().un('load',this.onResultLoad,this);
		},this);
		this.on('destroy', function(){
			App.eventManager.un('globalsearch', this.onGlobalSearch, this);
		},this);

	},
	
	onGlobalSearch : function(v) {
		this.changeTitle = v!==undefined;
		if(!v){
			this.setTitle(this.origTitle);
		}
	},
	
	onResultLoad : function(store,r,options){
		if(this.changeTitle){
			this.setTitle(String.format('{0} ({1})', this.origTitle, store.getTotalCount()));
		}
	}
	
});

Ext.reg('results', App.Results);