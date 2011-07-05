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
			}, new Ext.form.LazyComboBox({
				proxyUrl:get_api_url('staff'),
				fieldLabel:'Врач',
				name:'staff__staff',
				valueField:'id'
			}), {
				xtype:'button',
				text:'Сформировать',
				handler:function(){
					var vals = this.form.getForm().getValues();
					var staff = App.uriToId(this.form.getForm().findField('staff__staff').getValue());
					window.open(String.format('/old/reporting/staff-daily/print/?start_date={0}&end_date={1}&order__patient=&staff__staff={2}&order__referral=&execution_place_office=&execution_place_filial=&order__payment_type=&price_type=&order__cls=&from_place_filial=', 
							vals['start_date'], vals['end_date'], staff));
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