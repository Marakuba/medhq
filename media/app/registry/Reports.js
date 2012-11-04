Ext.ns('App');

App.Reports = Ext.extend(Ext.Panel, {
	initComponent:function(){

		this.form = new Ext.form.FormPanel({
			border:false,
			padding:10,
			items:[{
				xtype:'datefield',
				fieldLabel:'Дата с',
				name:'start_date',
				format:'Y-m-d',
				value:new Date()
			},{
				xtype:'datefield',
				fieldLabel:'Дата с',
				name:'end_date',
				format:'Y-m-d',
				value:new Date()
			}, new Ext.form.ComboBox({
				store:new Ext.data.JsonStore({
			    	autoLoad:true,
					proxy: new Ext.data.HttpProxy({
						url:App.getApiUrl('staff','staff'),
						method:'GET'
					}),
					root:'objects',
					idProperty:'resource_uri',
					fields:['resource_uri','name']
				}),
				fieldLabel:'Врач',
				name:'staff__staff',
				valueField:'resource_uri',
				queryParam:'last_name__istartswith',
			    typeAhead: true,
			    minChars:2,
			    triggerAction: 'all',
			    displayField: 'name',
			    selectOnFocus:true
			}), new Ext.form.ComboBox({
				store:new Ext.data.JsonStore({
			    	autoLoad:true,
			    	baseParams:{
			    		type:'b'
			    	},
					proxy: new Ext.data.HttpProxy({
						url:App.getApiUrl('state','state'),
						method:'GET'
					}),
					root:'objects',
					idProperty:'resource_uri',
					fields:['resource_uri','name','id']
				}),
				fieldLabel:'Филиал',
				name:'branch',
				valueField:'id',
			    typeAhead: true,
			    minChars:2,
			    triggerAction: 'all',
			    displayField: 'name',
			    selectOnFocus:true
			}), {
				xtype:'button',
				text:'Сформировать',
				handler:function(){
					var vals = this.form.getForm().getValues();
					var staff = App.uriToId(this.form.getForm().findField('staff__staff').getValue());
					var branch = this.form.getForm().findField('branch').getValue();
					window.open(String.format('/old/reporting/staff-daily/print/?start_date={0}&end_date={1}&order__patient=&staff__staff={2}&staff__department=&order__referral=&execution_place_office=&execution_place_filial=&order__payment_type=&price_type=&order__cls=&from_lab=&from_place_filial={3}',
							vals['start_date'], vals['end_date'], staff, branch));
				},
				scope:this
			}]
		});

		config = {
			id:'reports-grid',
			title:'Отчеты',
			closable:true,
            defaults: {
				border:false
			},
			layout:'fit',
			items:[{
				title:'Отчет за смену по врачам',
				items:this.form
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Reports.superclass.initComponent.apply(this, arguments);

	}
});

Ext.reg('reports', App.Reports);
