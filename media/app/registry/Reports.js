Ext.ns('App');

App.Reports = Ext.extend(Ext.Panel, {
	initComponent:function(){
		
		this.form = new Ext.form.FormPanel({
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
						url:get_api_url('staff'),
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
				store:new Ext.data.ArrayStore({
					fields:['id','name'],
					data:[ [1,'Евромед КИМ'], [6,'Евромед Лузана'] ]
				}),
				mode:'local',
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
					window.open(String.format('/old/reporting/staff-daily/print/?start_date={0}&end_date={1}&order__patient=&staff__staff={2}&order__referral=&execution_place_office=&execution_place_filial=&order__payment_type=&price_type=&order__cls=&from_place_filial={3}', 
							vals['start_date'], vals['end_date'], staff, branch));
				},
				scope:this
			}]
		});

		config = {
			title:'Отчеты',
            defaults: {
				border:false
			},
			layout:'vbox',
			items:[{
				html:'Отчет за смену по врачам'
			}, this.form]
		}
		
		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Reports.superclass.initComponent.apply(this, arguments);
		
	}
});

Ext.reg('reports', App.Reports);