Ext.ns('App.laboratory');


function setLabel(field,label){
    var el = field.el.dom.parentNode.parentNode;
    if( el.children[0].tagName.toLowerCase() === 'label' ) {
        el.children[0].innerHTML =label;
    }else if( el.parentNode.children[0].tagName.toLowerCase() === 'label' ){
    el.parentNode.children[0].innerHTML =label;
    }
    return setLabel; //just for fun
}

App.laboratory.RegisterApp = Ext.extend(Ext.Panel, {
	initComponent: function(){

		this.fields = [
    		    ['start_date','visit__created__gte','Y-m-d 00:00'],
    		    ['end_date','visit__created__lte','Y-m-d 23:59'],
    		    ['laboratory','laboratory'],
    		    ['office','visit__office'],
    		    ['payer','visit__payer'],
    		    ['patient','visit__patient'],
    		    ['is_completed','is_completed'],
    		    ['cito','visit__is_cito']
    		];

		this.singleDate = true;

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
   					apiUrl : App.utils.getApiUrl('state','medstate'),
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
   					apiUrl : App.utils.getApiUrl('state','medstate'),
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
   					apiUrl : App.utils.getApiUrl('state','medstate'),
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
   					apiUrl : App.utils.getApiUrl('patient','patient'),
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
					WebApp.fireEvent('closeapp','lab-register-app')
				},
				scope:this
			}]
   		});

   		this.panel = new Ext.Panel({
			region:'center',
			margins:'3 3 3 3',
			autoScroll:true,
			tbar:[{
				text:'Печать',
				iconCls:'silk-printer',
				handler:function(){
					var opts = {
						printable:1
					}
					var url = String.format("/lab/print/register/?{0}", Ext.urlEncode(Ext.apply(opts, this.opts)))
					window.open(url);
				},
				scope:this
			}],
			listeners:{
				render: function(p){
			        p.body.on({
			            'click': function(e, t){ // if they tab + enter a link, need to do it old fashioned way
			            	e.stopEvent();
			            	var type = t.href.split('#')[1];
			            	var val = t.text || t.innerText;
			            	switch (type) {
							case 'search':
								this.centralPanel.gsf.imitate(val);
								this.centralPanel.mainPanel.setActiveTab(0);
								break;

							default:
								break;
							}
			            },
			            delegate:'a',
			            scope:this
			        }, this);
			    },
				scope:this
			}
		});

		config = {
			id:'lab-register-app',
			title:'Реестр тестов',
			closable:true,
			layout:'border',
			border:false,
			items:[this.panel,{
				region:'east',
				width:300,
//				layout:'fit',
				baseCls:'x-plain',
				items:this.form
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.laboratory.RegisterApp.superclass.initComponent.apply(this, arguments);

		this.panel.on('afterrender', function(){
			this.doReport();
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
		this.opts = o;
		this.panel.load(String.format("/lab/print/register/?{0}", Ext.urlEncode(o)));
//		var url = String.format("/lab/print/register/?{0}", Ext.urlEncode(o));
//		window.open(url);
	}
});


Ext.reg('labregisterapp', App.laboratory.RegisterApp);
