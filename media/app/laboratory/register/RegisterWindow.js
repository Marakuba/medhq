Ext.ns('App.laboratory');


App.laboratory.RegisterWindow = Ext.extend(Ext.Window, {
	initComponent: function(){
		this.fields = [
 		    ['start_date','visit__created__gte','Y-m-d 00:00'],
 		    ['end_date','visit__created__lte','Y-m-d 23:59'],
 		    ['laboratory','laboratory'],
 		    ['office','visit__office'],
 		    ['patient','visit__patient'],
 		    ['is_completed','is_completed'],
 		    ['cito','visit__is_cito']
 		];

		this.form = new Ext.form.FormPanel({
			border:false,
			baseCls:'x-plain',
			labelWidth:80,
			padding:5,
			items:[{
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
					apiUrl : App.getApiUrl('state','state','medstate'),
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
					apiUrl : App.getApiUrl('state','state','medstate'),
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
			})]
		});

		config = {
			title:'Реестр тестов',
			width:400,
			height:200,
			items:[this.form],
//			buttonAlign: 'left',
			fbar:[{
				text:'Сформировать',
				handler:this.doReport.createDelegate(this)
			},{
				text:'Закрыть',
				handler:function(){
					this.close();
				},
				scope:this
			}],
		}
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laboratory.RegisterWindow.superclass.initComponent.apply(this, arguments);

		this.on('afterrender', function(){

		}, this);

	},

	doReport: function(){
		var f = this.form.getForm();
		var o = {};
		Ext.each(this.fields, function(field){
			var ff = f.findField(field[0]);
			var v = ff.getValue();
			if((v!==undefined && v!='') || v===0) {
				if(v instanceof Date) {
					v = v.format(field[2] || 'Y-m-d');
				}
				o[field[1]] = v;
			}
		}, this);
		var url = String.format("/lab/print/register/?{0}", Ext.urlEncode(o));
		window.open(url);
	}
});
