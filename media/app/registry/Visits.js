Ext.ns('App');

App.Visits = Ext.extend(Ext.Panel, {
	initComponent:function(){

		config = {
			id:'visits-grid',
			title:'Приемы',
			closable:true,
			layout:'border',
            defaults: {
				border:false
			},
			items:[/*{
				region:'center',
				layout:'card',
				activeItem: 0,
		        items:[new Ext.Panel({
					html:'&laquo; Выберите прием'
		        })]
			},*/{
				region:'center',
				width:'100%',
				split:true,
				layout:'fit',
				items:{
					loadInstant:true,
					xtype:'visitgrid'
				}
			}]
		}

		Ext.apply(this, Ext.apply(this.initialConfig, config));
		App.Visits.superclass.initComponent.apply(this, arguments);
		
	}
});

Ext.reg('visits', App.Visits);