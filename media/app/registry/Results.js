Ext.ns('App');

function setLabel(field,label){
    var el = field.el.dom.parentNode.parentNode;
    if( el.children[0].tagName.toLowerCase() === 'label' ) {
        el.children[0].innerHTML =label;
    }else if( el.parentNode.children[0].tagName.toLowerCase() === 'label' ){
    el.parentNode.children[0].innerHTML =label;
    }
    return setLabel; //just for fun
}

App.Results = Ext.extend(Ext.Panel, {
	initComponent:function(){

		this.resultGrid = new App.results.Grid({
			region:'center',
			xtype:'resultsgrid'
		});

		this.origTitle = 'Результаты';

		this.singleDate = true;

		this.fields = [
		    ['start_date','visit__created__gte','Y-m-d 00:00'],
		    ['end_date','visit__created__lte','Y-m-d 23:59'],
		    ['laboratory','laboratory'],
		    ['office','visit__office'],
		    ['payer','visit__payer'],
		    ['is_completed','is_completed', {0:false,1:true}],
		    ['is_printed','is_printed', {0:false,1:true}]
		];

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
   					autoLoad : false,
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
   					autoLoad : false,
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
   					autoLoad : false,
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
   			}), new Ext.form.ComboBox({
   				fieldLabel:'Готовность',
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
   				value:-1,
   				listeners:{
   					afterrender:function(c){
   						c.setValue(-1);
   					}
   				}
   			}), new Ext.form.ComboBox({
   				fieldLabel:'Печать',
   				name:'is_printed',
   				store:new Ext.data.ArrayStore({
   					fields:['id','title'],
   					data: [
   						[-1,'Любой'],
   						[1,'Распечатанные'],
   						[0,'Не печатанные']]
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
   				value:-1,
   				listeners:{
   					afterrender:function(c){
   						c.setValue(-1);
   					}
   				}
   			})],
   			buttons:[{
				text:'Сформировать',
				handler:this.applyFilter.createDelegate(this)
			},{
				text:'Сбросить',
				handler:this.clearFilter.createDelegate(this),
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
			items:[this.resultGrid,{
				region:'east',
				width:300,
				baseCls:'x-plain',
				items:this.form
			}]
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
	},

	applyFilter: function(){
		var f = this.form.getForm();
		var o = {};
		Ext.each(this.fields, function(field){
			var ff = f.findField(field[0]);
			var v = ff.getValue();
			if((v!==undefined && v!='' && v!==-1) || v===0) {
				if(v instanceof Date) {
					v = v.format(field[2] || 'Y-m-d');
				} else if(field[2] && field[2] instanceof Object){
					v = field[2][v]
				}
				o[field[1]] = v;
			}
		}, this);
		var s = this.resultGrid.getStore();
		s.baseParams = {};
		Ext.apply(s.baseParams, o);
		s.load();
	},

	clearFilter: function(){
		var f = this.form.getForm().reset();
		var s = this.resultGrid.getStore();
		s.baseParams = {};
		s.load();
	}

});

Ext.reg('results', App.Results);
